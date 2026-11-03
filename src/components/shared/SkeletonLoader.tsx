import { Bar, KpiTileSkeleton, TableSkeleton } from "./Skeleton";

interface SkeletonLoaderProps {
  type?: "card" | "table" | "list" | "stats";
  rows?: number;
  className?: string;
}

/** Kept for pages that still ask for a generic loader. New screens should compose the pieces in ./Skeleton. */
export default function SkeletonLoader({ type = "card", rows = 3, className = "" }: SkeletonLoaderProps) {
  if (type === "stats") {
    return (
      <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 ${className}`} role="status" aria-label="Loading">
        {Array.from({ length: 4 }).map((_, i) => (
          <KpiTileSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (type === "table") {
    return <TableSkeleton headers={["Name", "Details", "Status", "Date", "Actions"]} rows={rows} className={className} />;
  }

  if (type === "list") {
    return (
      <div className={`space-y-3 ${className}`} role="status" aria-label="Loading">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="bg-white border border-[#E1E4EA] rounded-lg p-4 flex items-center gap-4">
            <Bar className="w-12 h-12 rounded-full" />
            <div className="flex-1 flex flex-col gap-2">
              <Bar className="h-4 w-1/4" />
              <Bar className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`} role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-white border border-[#E1E4EA] rounded-lg p-6 flex flex-col gap-3">
          <Bar className="h-5 w-1/3" />
          <Bar className="h-4 w-full" />
          <Bar className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}
