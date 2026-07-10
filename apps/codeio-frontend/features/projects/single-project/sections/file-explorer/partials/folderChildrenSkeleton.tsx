import { Skeleton } from "@/components/ui/skeleton";

export default function FolderChildrenSkeleton({
  depth,
  count = 4,
}: {
  depth: number;
  count?: number;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-2 py-1"
          style={{
            paddingLeft: `${(depth + 1) * 14 + 8}px`,
          }}
        >
          <Skeleton className="h-3 w-3" />
          <Skeleton className="h-4 w-4 rounded-sm" />
          <Skeleton
            className="h-4 rounded-md"
            style={{
              width: `${70 + Math.random() * 70}px`,
            }}
          />
        </div>
      ))}
    </>
  );
}
