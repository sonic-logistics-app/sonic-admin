/**
 * API Docs is a developer tool. It shows outside production, and in production
 * only when NEXT_PUBLIC_SHOW_DEV_TOOLS is "true". The backend enforces the same rule.
 */
export const devToolsVisible = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_SHOW_DEV_TOOLS === "true";
