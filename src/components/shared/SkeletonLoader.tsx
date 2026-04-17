interface SkeletonLoaderProps {
  type?: 'card' | 'table' | 'list' | 'stats';
  rows?: number;
  className?: string;
}

export default function SkeletonLoader({ type = 'card', rows = 3, className = '' }: SkeletonLoaderProps) {
  if (type === 'stats') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-[#E1E4EA] rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-[#F3F4F6] rounded w-3/4 mb-3"></div>
            <div className="h-8 bg-[#F3F4F6] rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-[#F3F4F6] rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className={`bg-white border border-[#E1E4EA] rounded-lg overflow-hidden ${className}`}>
        <div className="p-4 border-b border-[#E1E4EA] animate-pulse">
          <div className="h-4 bg-[#F3F4F6] rounded w-1/4"></div>
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 border-b border-[#E1E4EA] animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#F3F4F6] rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[#F3F4F6] rounded w-1/3"></div>
                <div className="h-3 bg-[#F3F4F6] rounded w-1/2"></div>
              </div>
              <div className="h-6 bg-[#F3F4F6] rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="bg-white border border-[#E1E4EA] rounded-lg p-4 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#F3F4F6] rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[#F3F4F6] rounded w-1/4"></div>
                <div className="h-3 bg-[#F3F4F6] rounded w-1/2"></div>
                <div className="h-3 bg-[#F3F4F6] rounded w-1/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default card skeleton
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-white border border-[#E1E4EA] rounded-lg p-6 animate-pulse">
          <div className="h-6 bg-[#F3F4F6] rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-[#F3F4F6] rounded w-full mb-2"></div>
          <div className="h-4 bg-[#F3F4F6] rounded w-2/3"></div>
        </div>
      ))}
    </div>
  );
}