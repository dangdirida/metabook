import { BookCardSkeleton } from "@/components/ui/Skeleton";

export default function LibraryLoading() {
  return (
    <div className="min-h-screen bg-mono-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <BookCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
