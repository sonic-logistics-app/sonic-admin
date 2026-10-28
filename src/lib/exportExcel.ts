export interface ExportColumn<T> {
  header: string;
  width?: number;
  value: (row: T) => string | number | boolean | null | undefined;
}

interface PageResult<T> {
  data: T[];
  meta: { total: number };
}

/**
 * Walk every page of a filtered list so the export contains all matching rows,
 * not just the page on screen.
 */
export async function fetchAllPages<T>(
  fetchPage: (page: number, limit: number) => Promise<PageResult<T>>,
  { pageSize = 500, maxRows = 20000 } = {},
): Promise<T[]> {
  const all: T[] = [];
  for (let page = 1; ; page += 1) {
    const result = await fetchPage(page, pageSize);
    all.push(...result.data);
    if (result.data.length < pageSize || all.length >= result.meta.total || all.length >= maxRows) break;
  }
  return all.slice(0, maxRows);
}

/** Lagos time, so exported dates match what admins see in the dashboard. */
export function formatExportDate(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-NG", {
    timeZone: "Africa/Lagos",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const yesNo = (value?: boolean | null): string => (value ? "Yes" : "No");

/**
 * Build an .xlsx in the browser and download it. exceljs is loaded on demand so it is
 * not part of the page bundle. Every cell is written as text or a number, never a formula.
 */
export async function downloadExcel<T>(
  fileBase: string,
  sheetName: string,
  columns: ExportColumn<T>[],
  rows: T[],
): Promise<void> {
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);

  sheet.columns = columns.map((c) => ({ header: c.header, width: c.width ?? 20 }));
  for (const row of rows) {
    sheet.addRow(columns.map((c) => c.value(row) ?? ""));
  }

  const header = sheet.getRow(1);
  header.font = { bold: true };
  header.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F4F6" } };
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columns.length } };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const stamp = new Date().toISOString().slice(0, 10);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileBase}-${stamp}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
