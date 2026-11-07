/**
 * Loading placeholders that copy the real layout (same grid, card padding, heights and column count) so the
 * page does not jump when the data arrives. Build a screen's skeleton from these, not from generic boxes.
 */

export function Bar({ className = "" }: { className?: string }) {
  return <span className={`block animate-pulse rounded-md bg-[#E9ECF1] ${className}`} aria-hidden="true" />;
}

const Dot = ({ className = "w-10 h-10" }: { className?: string }) => (
  <div className={`animate-pulse rounded-full bg-[#E9ECF1] flex-shrink-0 ${className}`} aria-hidden="true" />
);

/** The big number tiles on the dashboard (Total orders, New today…): label, number, icon, one line of detail. */
export function KpiTileSkeleton() {
  return (
    <div className="flex flex-col justify-center gap-3 p-4 rounded-2xl border border-[#E1E4EA] bg-white">
      <div className="flex justify-between items-center gap-2">
        <div className="flex flex-col gap-2 flex-1">
          <Bar className="h-3 w-24" />
          <Bar className="h-7 w-20" />
        </div>
        <Dot className="w-10 h-10" />
      </div>
      <Bar className="h-3 w-3/4" />
    </div>
  );
}

/** The smaller tiles under them (Revenue, Avg order…). */
export function MetricTileSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-[#E1E4EA] bg-white">
      <Dot className="w-10 h-10" />
      <div className="flex flex-col gap-1.5 flex-1">
        <Bar className="h-2.5 w-16" />
        <Bar className="h-4 w-24" />
        <Bar className="h-2.5 w-10" />
      </div>
    </div>
  );
}

/** The row of filter cards above a list (matches StatCards). */
export function StatCardsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(170px,1fr))]" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border border-[#E1E4EA] bg-white rounded-xl px-4 py-3 flex flex-col gap-2">
          <Bar className="h-3 w-20" />
          <Bar className="h-6 w-12" />
        </div>
      ))}
    </div>
  );
}

// Widths vary a little from cell to cell so the rows look like text, not a grid of identical bars
const CELL_WIDTHS = ["w-4/5", "w-3/5", "w-2/3", "w-1/2", "w-3/4"];

/** A list table: the real column headers, then rows of text-shaped bars. */
export function TableSkeleton({ headers, rows = 8, className = "" }: { headers: string[]; rows?: number; className?: string }) {
  return (
    <div className={`rounded-2xl border border-[#E1E4EA] bg-white overflow-hidden w-full ${className}`} role="status" aria-label="Loading">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white border-b border-[#E1E4EA]">
            <tr>
              {headers.map((header, i) => (
                <th key={i} className="text-left px-5 py-4 text-[13px] font-semibold text-[#525866] whitespace-nowrap">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, row) => (
              <tr key={row} className="border-b border-[#E1E4EA] last:border-b-0">
                {headers.map((_, col) => (
                  <td key={col} className="px-5 py-4 align-middle">
                    {col === 0 ? (
                      <div className="flex items-center gap-3">
                        <Dot className="w-9 h-9" />
                        <div className="flex flex-col gap-2 flex-1">
                          <Bar className="h-3.5 w-32" />
                          <Bar className="h-3 w-20" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <Bar className={`h-3.5 ${CELL_WIDTHS[(row + col) % CELL_WIDTHS.length]}`} />
                        <Bar className={`h-3 ${CELL_WIDTHS[(row + col + 2) % CELL_WIDTHS.length]} opacity-60`} />
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-5 py-4 border-t border-[#E1E4EA]">
        <Bar className="h-4 w-44" />
        <div className="flex gap-2">
          <Bar className="h-9 w-20" />
          <Bar className="h-9 w-9" />
          <Bar className="h-9 w-16" />
        </div>
      </div>
    </div>
  );
}

/** A chart card: title, a few legend chips, bars rising from a baseline. */
export function ChartSkeleton({ height = 260, className = "" }: { height?: number; className?: string }) {
  const heights = [40, 62, 48, 80, 55, 92, 66, 74, 45, 85, 58, 70];
  return (
    <div className={`rounded-2xl border border-[#E1E4EA] bg-white p-4 flex flex-col gap-4 ${className}`} role="status" aria-label="Loading chart">
      <div className="flex items-center justify-between gap-3">
        <Bar className="h-4 w-44" />
        <div className="flex gap-2">
          <Bar className="h-7 w-24" />
          <Bar className="h-7 w-24" />
        </div>
      </div>
      <div className="flex items-end gap-2 border-b border-[#EEF0F3]" style={{ height }}>
        {heights.map((h, i) => (
          <div key={i} className="flex-1 animate-pulse rounded-t-md bg-[#E9ECF1]" style={{ height: `${h}%` }} />
        ))}
      </div>
      <Bar className="h-3 w-56" />
    </div>
  );
}

/** A card with a title and a handful of label / value rows (order status, system health, refunds…). */
export function PanelSkeleton({ rows = 5, className = "" }: { rows?: number; className?: string }) {
  return (
    <div className={`rounded-2xl border border-[#E1E4EA] bg-white p-4 flex flex-col gap-3 ${className}`} role="status" aria-label="Loading">
      <Bar className="h-5 w-36" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-3 py-2">
          <div className="flex items-center gap-3 flex-1">
            <Dot className="w-8 h-8" />
            <Bar className="h-3.5 w-28" />
          </div>
          <Bar className="h-4 w-10" />
        </div>
      ))}
    </div>
  );
}

/** Whole dashboard registrations block: three account cards, the trend chart and the attention grid. */
export function RegistrationOverviewSkeleton() {
  return (
    <div className="flex flex-col gap-4 mb-4" role="status" aria-label="Loading registrations">
      <div className="flex items-center justify-between">
        <Bar className="h-5 w-32" />
        <Bar className="h-3 w-48" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="p-4 rounded-2xl border border-[#E1E4EA] bg-white flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Bar className="h-3 w-20" />
              <Dot className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-2">
              <Bar className="h-7 w-24" />
              <Bar className="h-3 w-4/5" />
              <Bar className="h-3 w-1/3" />
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-[#E1E4EA] pt-3">
              {Array.from({ length: 4 }).map((_, r) => (
                <Bar key={r} className="h-4 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
      <ChartSkeleton height={180} />
      <div className="p-4 rounded-2xl border border-[#E1E4EA] bg-white flex flex-col gap-3">
        <Bar className="h-4 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg border border-[#E1E4EA]">
              <Bar className="h-3.5 w-3/5" />
              <Bar className="h-4 w-6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** A detail page (business partner, mover, user, order): header, a profile card, tabs and two content cards. */
export function DetailPageSkeleton({ tabs = 5 }: { tabs?: number }) {
  return (
    <div className="flex flex-col gap-6" role="status" aria-label="Loading details">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Bar className="h-10 w-24 rounded-full" />
          <div className="flex flex-col gap-2">
            <Bar className="h-6 w-48" />
            <Bar className="h-3 w-32" />
          </div>
        </div>
        <div className="flex gap-3">
          <Bar className="h-9 w-24 rounded-full" />
          <Bar className="h-9 w-32 rounded-full" />
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-[#E1E4EA] p-6 flex items-center gap-6">
        <Dot className="w-20 h-20" />
        <div className="flex flex-col gap-2 flex-1">
          <Bar className="h-6 w-56" />
          <Bar className="h-3.5 w-72 max-w-full" />
          <div className="flex gap-2 mt-1">
            <Bar className="h-6 w-20 rounded-full" />
            <Bar className="h-6 w-24 rounded-full" />
          </div>
        </div>
      </div>
      <div className="flex gap-6 border-b border-[#E1E4EA] pb-3">
        {Array.from({ length: tabs }).map((_, i) => (
          <Bar key={i} className="h-4 w-20" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <div key={i} className="border border-[#E1E4EA] rounded-lg p-6 bg-white flex flex-col gap-4">
            <Bar className="h-5 w-40" />
            {Array.from({ length: 4 }).map((_, r) => (
              <div key={r} className="flex flex-col gap-1.5">
                <Bar className="h-2.5 w-20" />
                <Bar className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
