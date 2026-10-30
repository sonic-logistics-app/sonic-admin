import AuthService from "../../../services/AuthService";

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api/admin";
const authService = new AuthService();

export type DeletedKind = "vendors" | "users" | "drivers";

export interface DeletedAccount {
  id: string | number;
  short_code: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  deleted_at: string | null;
}

export interface DeletedPage {
  data: DeletedAccount[];
  meta: { total: number; page: number; limit: number };
}

const PATH: Record<DeletedKind, string> = { vendors: "vendor", users: "user", drivers: "driver" };

async function readJson(res: Response) {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.message || `Request failed (${res.status})`);
  return body;
}

interface RawAccount {
  id: string | number;
  short_code?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  deleted_at?: string | null;
}

function toAccount(kind: DeletedKind, row: RawAccount): DeletedAccount {
  const personName = [row.first_name, row.last_name].filter(Boolean).join(" ").trim();
  return {
    id: row.id,
    short_code: row.short_code ?? null,
    name: (kind === "vendors" ? row.name : personName || row.full_name || row.name) || row.email || "Unnamed",
    email: row.email ?? null,
    phone: row.phone ?? null,
    deleted_at: row.deleted_at ?? null,
  };
}

export default class DeletedAccountsService {
  async list(kind: DeletedKind, params: { page: number; limit: number; search?: string }): Promise<DeletedPage> {
    const query = new URLSearchParams({
      deleted: "only",
      page: String(params.page),
      limit: String(params.limit),
    });
    if (params.search) query.set("search", params.search);

    const body = await readJson(await fetch(`${apiUrl}/${PATH[kind]}?${query}`, { headers: authService.getAuthHeaders() }));
    const rows: RawAccount[] = body.data?.[kind] ?? [];
    return {
      data: rows.map((row) => toAccount(kind, row)),
      meta: body.meta ?? { total: rows.length, page: params.page, limit: params.limit },
    };
  }

  async restore(kind: DeletedKind, id: string | number) {
    return readJson(
      await fetch(`${apiUrl}/${PATH[kind]}/${encodeURIComponent(String(id))}/restore`, {
        method: "PUT",
        headers: authService.getAuthHeaders(),
      }),
    );
  }

  /** Permanent: removes the row. The existing admin endpoints take a different shape per type. */
  async deleteForever(kind: DeletedKind, id: string | number) {
    if (kind === "vendors") {
      return readJson(
        await fetch(`${apiUrl}/vendor/${encodeURIComponent(String(id))}/hard-delete`, {
          method: "DELETE",
          headers: authService.getAuthHeaders(),
        }),
      );
    }
    const field = kind === "users" ? "user_id" : "driver_id";
    return readJson(
      await fetch(`${apiUrl}/${PATH[kind]}/hard-delete`, {
        method: "DELETE",
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({ [field]: id }),
      }),
    );
  }
}
