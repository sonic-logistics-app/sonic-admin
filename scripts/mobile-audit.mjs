#!/usr/bin/env node
/**
 * Mobile layout audit for the admin.
 *
 * Opens every admin page in a phone-sized Chrome window and reports what does not fit:
 *   - the page scrolling sideways
 *   - elements that stick out past the screen edge (and are not inside a scrollable wrapper)
 *   - buttons, links and inputs that are too small to tap
 *   - console errors
 * It also checks the sidebar drawer, every tab, the filter panels, and every dialog or panel a button opens (Delete,
 * Reject, Suspend, Invite, Create...). While it opens those, every request that would change data is blocked, so
 * nothing is ever deleted or saved. A screenshot of each page and dialog is saved.
 *
 * Needs the admin and the backend running, and an admin account:
 *   npm run dev                                   (admin, default http://localhost:3000)
 *   npm run audit:mobile -- --email you@x.com --password '...'
 *
 * Options (or env vars ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_URL, API_URL):
 *   --base http://localhost:3000          where the admin runs
 *   --api  http://localhost:3030/api/admin  the backend, used to find a real id for the detail pages
 *   --width 390 --height 844              the phone size (default: iPhone 14)
 *   --only order,user                     only pages whose name contains one of these
 *   --out mobile-audit-report             report and screenshots folder
 *   --chrome "C:/Program Files/Google/Chrome/Application/chrome.exe"
 *
 * Exit code is 1 when anything is reported, so it can run in CI.
 */
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => {
    if (a.startsWith("--")) acc.push([a.slice(2), all[i + 1] && !all[i + 1].startsWith("--") ? all[i + 1] : "true"]);
    return acc;
  }, []),
);
const opt = (name, env, fallback) => args[name] ?? process.env[env] ?? fallback;

const BASE = opt("base", "ADMIN_URL", "http://localhost:3000").replace(/\/$/, "");
const API = opt("api", "API_URL", "http://localhost:3030/api/admin").replace(/\/$/, "");
const EMAIL = opt("email", "ADMIN_EMAIL", "");
const PASSWORD = opt("password", "ADMIN_PASSWORD", "");
const WIDTH = Number(opt("width", "", 390));
const HEIGHT = Number(opt("height", "", 844));
const ONLY = (opt("only", "", "") || "").split(",").filter(Boolean);
const OUT = opt("out", "", "mobile-audit-report");
const CHROME = opt("chrome", "CHROME_PATH", [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].find((p) => fs.existsSync(p)));

if (!EMAIL || !PASSWORD) {
  console.error("Give an admin login: --email you@x.com --password '...' (or ADMIN_EMAIL and ADMIN_PASSWORD).");
  process.exit(2);
}
if (!CHROME) {
  console.error("Chrome was not found. Pass --chrome <path to chrome or msedge>.");
  process.exit(2);
}

const STATIC_PAGES = [
  ["dashboard", "/dashboard"],
  ["user-list", "/user"],
  ["user-create", "/user/create"],
  ["mover-list", "/mover"],
  ["mover-create", "/mover/create"],
  ["business-partner-list", "/business-partner"],
  ["business-partner-create", "/business-partner/create"],
  ["order-list", "/order"],
  ["order-refunds", "/order/refund"],
  ["transaction", "/transaction"],
  ["voucher", "/voucher"],
  ["faq-list", "/faq"],
  ["faq-create", "/faq/create"],
  ["support", "/support"],
  ["audit-log", "/audit-log"],
  ["team", "/team"],
  ["deleted", "/deleted"],
  ["profile", "/profile"],
  ["api-docs", "/api-docs"],
];

// Pages a signed-out person sees. A token that does not exist shows the "cannot be used" state.
const PUBLIC_PAGES = [
  ["login", "/login"],
  ["forgot-password", "/forgot-password"],
  ["reset-password-bad-link", "/reset-password?token=0000000000000000000000000000000000000000"],
  ["accept-invite-bad-link", "/accept-invite?token=0000000000000000000000000000000000000000"],
];

// Detail pages need a real id: ask the backend for the first row of each list
const DETAIL_PAGES = [
  ["user-detail", "/user", "/user?limit=1", ["short_code", "public_id", "id"]],
  ["mover-detail", "/mover", "/driver?limit=1", ["short_code", "public_id", "id"]],
  ["business-partner-detail", "/business-partner", "/vendor?limit=1", ["short_code", "id"]],
  ["order-detail", "/order", "/order?limit=1", ["id"]],
  // The list opens an order by its number (SNK-00001), so that address has to work too
  ["order-detail-by-number", "/order", "/order?limit=1", ["order_number"]],
  ["faq-detail", "/faq", "/faq?limit=1", ["id"]],
];

const firstRow = (body) => {
  const data = body?.data ?? body;
  if (Array.isArray(data)) return data[0];
  if (data && typeof data === "object") {
    for (const v of Object.values(data)) if (Array.isArray(v)) return v[0];
  }
  return undefined;
};

// Runs inside the page. Returns what does not fit.
const inspect = ({ minTap }) => {
  const vw = window.innerWidth;
  const out = { pageScrollsSideways: false, overflowing: [], tooSmall: [], badNesting: [], showsError: "" };
  // A page that loaded but is showing an error is not fine, however well it fits the screen
  const text = (document.querySelector("main") || document.body).innerText || "";
  const bad = text.match(/something went wrong|not found|failed to load|could not load|cannot read propert|unexpected error/i);
  if (bad) out.showsError = bad[0];
  const root = document.documentElement;
  out.pageScrollsSideways = root.scrollWidth > vw + 1 || document.body.scrollWidth > vw + 1;
  // The admin scrolls inside a full-width box, so also look for sideways scrolling in any full-width scroll box
  for (const el of document.querySelectorAll("div, main, section")) {
    const st = getComputedStyle(el);
    const box = el.getBoundingClientRect();
    if (["auto", "scroll"].includes(st.overflowY) && box.height > 200 && box.width >= vw - 24 && el.scrollWidth > el.clientWidth + 1) out.pageScrollsSideways = true;
  }

  const describe = (el) => {
    const text = (el.innerText || el.getAttribute("aria-label") || el.getAttribute("placeholder") || el.title || "").trim().replace(/\s+/g, " ").slice(0, 40);
    const cls = typeof el.className === "string" ? el.className.split(/\s+/).slice(0, 4).join(".") : "";
    return `${el.tagName.toLowerCase()}${cls ? "." + cls : ""}${text ? ` "${text}"` : ""}`;
  };
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return false;
    const s = getComputedStyle(el);
    return s.visibility !== "hidden" && s.display !== "none" && s.opacity !== "0";
  };
  // An element inside a sideways-scrolling wrapper (a table, a tab bar) is allowed to be wider than the screen
  const inScroller = (el) => {
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const s = getComputedStyle(p);
      // Only a wrapper the person can scroll sideways counts. overflow hidden just cuts the content off.
      // The page itself scrolls up and down inside a full-width box. Sideways scrolling there is the bug, not a feature.
      const box = p.getBoundingClientRect();
      const isPageScroller = ["auto", "scroll"].includes(s.overflowY) && box.height > 200 && box.width >= vw - 24;
      if (["auto", "scroll"].includes(s.overflowX) && box.right <= vw + 1 && !isPageScroller) return true;
    }
    return false;
  };
  // The off-screen sidebar drawer is meant to be outside the screen
  const inClosedDrawer = (el) => !!el.closest("[data-drawer], .-translate-x-full");

  const seen = new Set();
  for (const el of document.body.querySelectorAll("*")) {
    if (!visible(el) || inClosedDrawer(el)) continue;
    const r = el.getBoundingClientRect();
    if ((r.right > vw + 1 || r.left < -1) && !inScroller(el)) {
      // report the outermost offender only
      let parentAlso = false;
      for (let p = el.parentElement; p; p = p.parentElement) if (seen.has(p)) { parentAlso = true; break; }
      if (!parentAlso) {
        seen.add(el);
        out.overflowing.push({ el: describe(el), left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width) });
      }
    }
  }
  for (const el of document.body.querySelectorAll("button, a[href], input:not([type=hidden]), select, textarea, [role=button], [role=tab]")) {
    if (!visible(el) || inClosedDrawer(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.right < 0 || r.left > vw) continue;
    // A link inside a sentence is as big as the sentence line; that is fine
    if (el.tagName === "A" && getComputedStyle(el).display === "inline") continue;
    // Checkbox inputs are wrapped by a larger label in this app
    const target = el.type === "checkbox" || el.type === "radio" ? el.closest("label") || (el.labels && el.labels[0]) || el : el;
    const tr = target.getBoundingClientRect();
    if (tr.height < minTap - 1 || (tr.width < minTap - 1 && !(el.tagName === "A" && (el.innerText || "").trim().length > 3))) {
      out.tooSmall.push({ el: describe(el), width: Math.round(tr.width), height: Math.round(tr.height) });
    }
  }
  // Markup the browser repairs differently from the server (causes the "hydration" error in the console)
  for (const el of document.querySelectorAll("p div, p p, p ul, button button, a a, button a, a button")) {
    out.badNesting.push(`${describe(el)} inside ${describe(el.parentElement)}`);
  }
  out.badNesting = [...new Set(out.badNesting)].slice(0, 6);
  // Dialogs: a button the person cannot reach because the box is taller than the screen and does not scroll
  out.unreachable = [];
  const scrollableAbove = (el) => {
    for (let p = el.parentElement; p && p !== document.documentElement; p = p.parentElement) {
      const st = getComputedStyle(p);
      if (["auto", "scroll"].includes(st.overflowY) && p.scrollHeight > p.clientHeight + 1) return true;
      if (getComputedStyle(p).position === "fixed") return false;
    }
    return false;
  };
  const vh = window.innerHeight;
  for (const el of document.body.querySelectorAll("button, a[href], input, select, textarea")) {
    if (!visible(el) || !el.closest(".fixed, [role=dialog], [aria-modal=true]")) continue;
    if (el.closest("[class*='top-3'][class*='left-3']") || inClosedDrawer(el)) continue;
    const r = el.getBoundingClientRect();
    if ((r.bottom > vh + 1 || r.top < -1) && !scrollableAbove(el)) out.unreachable.push(describe(el));
  }
  out.unreachable = [...new Set(out.unreachable)].slice(0, 6);
  out.overflowing = out.overflowing.slice(0, 12);
  out.tooSmall = out.tooSmall.slice(0, 12);
  return out;
};

const results = [];
const problems = (r) => (r.error ? 1 : 0) + (r.pageScrollsSideways ? 1 : 0) + r.overflowing.length + r.tooSmall.length + (r.badNesting?.length ?? 0) + (r.unreachable?.length ?? 0) + (r.showsError ? 1 : 0) + r.consoleErrors.length;

async function main() {
  fs.mkdirSync(path.join(OUT, "screens"), { recursive: true });
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  });
  // Cookie banner and similar are not part of the admin
  const page = await context.newPage();
  let consoleErrors = [];
  page.on("console", (m) => {
    if (m.type() === "error" && !/favicon|Failed to load resource|net::ERR_/i.test(m.text())) consoleErrors.push(m.text().slice(0, 160));
  });
  page.on("pageerror", (e) => consoleErrors.push(String(e.message).slice(0, 160)));

  // ---- pages a signed-out person sees
  if (!ONLY.length || ONLY.some((o) => PUBLIC_PAGES.some(([n]) => n.includes(o)))) {
    for (const [name, route] of PUBLIC_PAGES) {
      if (ONLY.length && !ONLY.some((o) => name.includes(o))) continue;
      process.stdout.write(`${name.padEnd(28)} `);
      try {
        consoleErrors = [];
        await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
        await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
        await page.waitForTimeout(1200);
        const found = await page.evaluate(inspect, { minTap: 32 });
        const file = name.replace(/[^a-z0-9-]+/gi, "_");
        await page.screenshot({ path: path.join(OUT, "screens", `${file}.png`) });
        results.push({ name, file, ...found, consoleErrors: [...consoleErrors] });
        consoleErrors = [];
        console.log(problems(results[results.length - 1]) === 0 ? "ok" : "needs work");
      } catch (e) {
        results.push({ name, file: "", error: e.message.slice(0, 200), pageScrollsSideways: false, overflowing: [], tooSmall: [], badNesting: [], unreachable: [], consoleErrors: [] });
        console.log("failed to load");
      }
    }
  }

  // ---- sign in the way a person does
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[placeholder="Password"], input[type="password"]', PASSWORD);
  await page.click('button[type="submit"], input[type="submit"]');
  try {
    await page.waitForURL("**/dashboard", { timeout: 60000 });
  } catch {
    console.error("Could not sign in. Check the email and password, and that the backend is running.");
    console.error(`Stopped at ${page.url()}: ${(await page.locator("body").innerText().catch(() => "")).trim().replace(/\s+/g, " ").slice(0, 200)}`);
    await page.screenshot({ path: path.join(OUT, "login-failed.png") }).catch(() => {});
    await browser.close();
    process.exit(2);
  }
  const token = await page.evaluate(() => localStorage.getItem("admin_token"));

  // ---- find real ids for the detail pages
  const pages = [...STATIC_PAGES];
  for (const [name, base, listPath, keys] of DETAIL_PAGES) {
    try {
      const res = await fetch(`${API}${listPath}`, { headers: { Authorization: `Bearer ${token}` } });
      const row = firstRow(await res.json());
      const key = row && keys.find((k) => row[k]);
      if (key) pages.push([name, `${base}/${encodeURIComponent(row[key])}`]);
      else console.warn(`(skipping ${name}: the list is empty)`);
    } catch (e) {
      console.warn(`(skipping ${name}: ${e.message})`);
    }
  }

  // From here on nothing may change data: anything that is not a read is refused, so every button is safe to press
  const apiOrigin = new URL(API).origin;
  await context.route((url) => url.href.startsWith(apiOrigin), (route) => {
    const method = route.request().method();
    return ["GET", "HEAD", "OPTIONS"].includes(method) ? route.continue() : route.abort("blockedbyclient");
  });

  const audit = async (name, extra = "") => {
    await page.waitForTimeout(900);
    const found = await page.evaluate(inspect, { minTap: 32 });
    const file = `${name}${extra ? "--" + extra : ""}`.replace(/[^a-z0-9-]+/gi, "_");
    await page.screenshot({ path: path.join(OUT, "screens", `${file}.png`) });
    results.push({ name: extra ? `${name} [${extra}]` : name, file, ...found, consoleErrors: [...consoleErrors] });
    consoleErrors = [];
  };

  for (const [name, route] of pages) {
    if (ONLY.length && !ONLY.some((o) => name.includes(o))) continue;
    process.stdout.write(`${name.padEnd(28)} `);
    try {
      consoleErrors = [];
      await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
      await audit(name);

      // Every tab on a detail page
      const tabs = await page.locator("main nav button, [role=tablist] button").all();
      if ((/detail/.test(name) || /^(transaction|support|deleted)$/.test(name)) && tabs.length > 1) {
        for (let i = /detail/.test(name) ? 1 : 0; i < tabs.length; i++) {
          const label = ((await tabs[i].innerText().catch(() => "")) || `tab${i}`).trim().split("\n")[0].slice(0, 20);
          try {
            await tabs[i].scrollIntoViewIfNeeded();
            await tabs[i].click({ timeout: 4000 });
            await audit(name, label);
          } catch {}
        }
      }

      // Filter panels that start closed
      const moreFilters = page.getByRole("button", { name: /^\s*(more )?filters\s*$/i }).first();
      if (await moreFilters.isVisible().catch(() => false)) {
        await moreFilters.click().catch(() => {});
        await audit(name, "filters-open");
      }

      // Every dialog or panel a button opens
      const SKIP = /^(export|log ?out|sign ?out|previous|next|clear|search|back|show request|hide request|view all|\d+)$|export to excel|more filters/i;
      const labels = await page.evaluate((skip) => {
        const re = new RegExp(skip.source, skip.flags);
        const seenText = new Set();
        const out = [];
        for (const b of document.querySelectorAll("main button, main [role=button]")) {
          if (b.closest("nav, [role=tablist], table thead, .-translate-x-full")) continue;
          const r = b.getBoundingClientRect();
          const text = (b.innerText || b.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ");
          if (!text || text.length > 40 || r.width === 0 || r.height === 0 || re.test(text) || seenText.has(text)) continue;
          seenText.add(text);
          out.push(text);
        }
        return out.slice(0, 12);
      }, { source: SKIP.source, flags: SKIP.flags });
      for (const label of labels) {
        try {
          await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
          await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
          const button = page.locator("main button:visible, main [role=button]:visible").filter({ hasText: new RegExp(`^\\s*${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`) }).first();
          if (!(await button.isVisible().catch(() => false))) continue;
          const before = page.url();
          await button.scrollIntoViewIfNeeded().catch(() => {});
          await button.click({ timeout: 3000 });
          await page.waitForTimeout(700);
          if (page.url() !== before) continue; // it went to another page, which is audited on its own
          await audit(name, `opens: ${label}`);
        } catch {}
      }
      await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" }).catch(() => {});
      await page.waitForTimeout(500);

      // Sidebar drawer: open it and check it fits
      // The sidebar is always visible from 1024px up, so there is no menu button to test there
      if (name === "dashboard" && WIDTH < 1024) {
        const burger = page.locator("button:has(i.pi-bars)").first();
        if (await burger.isVisible().catch(() => false)) {
          await burger.click();
          await audit(name, "menu-open");
          await page.keyboard.press("Escape").catch(() => {});
          await page.mouse.click(WIDTH - 5, HEIGHT / 2).catch(() => {});
        } else {
          results.push({ name: "dashboard [menu button]", file: "", error: "No menu button on a phone-sized screen, so the sidebar cannot be opened", pageScrollsSideways: false, overflowing: [], tooSmall: [], badNesting: [], unreachable: [], consoleErrors: [] });
        }
      }
      console.log(problems(results[results.length - 1]) === 0 ? "ok" : "needs work");
    } catch (e) {
      results.push({ name, file: "", error: e.message.slice(0, 200), pageScrollsSideways: false, overflowing: [], tooSmall: [], badNesting: [], unreachable: [], consoleErrors: [] });
      console.log("failed to load");
    }
  }
  await browser.close();

  // ---- report
  const lines = [`# Mobile audit ${WIDTH}x${HEIGHT}`, "", `Base: ${BASE}`, ""];
  let bad = 0;
  for (const r of results) {
    const n = problems(r);
    if (n) bad++;
    lines.push(`## ${n ? "NEEDS WORK" : "ok"}: ${r.name}`);
    if (r.error) lines.push(`- error: ${r.error}`);
    if (r.pageScrollsSideways) lines.push("- the whole page scrolls sideways");
    for (const o of r.overflowing) lines.push(`- sticks out of the screen (left ${o.left}, right ${o.right}, width ${o.width}): ${o.el}`);
    for (const t of r.tooSmall) lines.push(`- too small to tap (${t.width}x${t.height}): ${t.el}`);
    if (r.showsError) lines.push(`- the page is showing an error: "${r.showsError}"`);
    for (const t of r.badNesting ?? []) lines.push(`- invalid markup nesting: ${t}`);
    for (const t of r.unreachable ?? []) lines.push(`- cannot be reached in the dialog (off screen, no scrolling): ${t}`);
    for (const c of r.consoleErrors) lines.push(`- console error: ${c}`);
    if (r.file) lines.push(`- screenshot: screens/${r.file}.png`);
    lines.push("");
  }
  lines.splice(4, 0, `${results.length - bad} of ${results.length} views are fine, ${bad} need work.`, "");
  fs.writeFileSync(path.join(OUT, "report.md"), lines.join("\n"));
  fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(results, null, 2));
  console.log(`\n${results.length - bad} of ${results.length} views are fine, ${bad} need work.\nReport: ${path.join(OUT, "report.md")}`);
  process.exit(bad ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
