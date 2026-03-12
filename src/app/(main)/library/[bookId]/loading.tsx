import { Skeleton } from "@/components/ui/Skeleton";

export default function BookDetailLoading() {
  return (
    <div className="flex w-full h-full">
      <div className="w-[280px] border-r border-mono-200 p-4 space-y-3 hidden md:block">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex-1 p-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="w-[380px] border-l border-mono-200 p-4 space-y-3 hidden md:block">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}
