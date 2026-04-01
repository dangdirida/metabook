export function SkeletonBox({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-[var(--color-mono-080)] rounded-xl ${className}`} />;
}

export function BookCardSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <SkeletonBox className="aspect-[3/4] w-full rounded-xl" />
      <SkeletonBox className="h-4 w-3/4" />
      <SkeletonBox className="h-3 w-1/2" />
    </div>
  );
}

export function ChatMessageSkeleton() {
  return (
    <div className="flex gap-2 items-start">
      <SkeletonBox className="w-8 h-8 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonBox className="h-4 w-1/3" />
        <SkeletonBox className="h-16 w-4/5" />
      </div>
    </div>
  );
}
