import { Skeleton } from "@/components/ui/skeleton";

export default function FileTreeSkeleton({ rows = 12 }: { rows?: number }) {
  return (
    <div className="space-y-1 px-2 py-1">
      {Array.from({ length: rows }).map((_, index) => {
        const indent = (index % 4) * 14;

        return (
          <div
            key={index}
            className="flex items-center gap-2 py-1"
            style={{ paddingLeft: `${indent}px` }}
          >
            <Skeleton className="h-3 w-3 rounded-sm" />
            <Skeleton className="h-4 w-4 rounded-sm" />
            <Skeleton
              className="h-4 rounded-md"
              style={{
                width: `${80 + Math.random() * 90}px`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
