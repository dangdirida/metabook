"use client";

import { useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import LeftPanel from "@/components/panels/LeftPanel";
import CenterPanel from "@/components/panels/CenterPanel";
import RightPanel from "@/components/panels/RightPanel";
import TopTabs from "@/components/ui/TopTabs";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { usePanelStore } from "@/store/panelStore";

export default function BookDetailPage() {
  const { bookId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activePanel } = usePanelStore();

  // intro를 거치지 않고 직접 접근한 경우 → intro로 리다이렉트
  useEffect(() => {
    const fromIntro = searchParams.get("from") === "intro";
    const chapterParam = searchParams.get("chapter");
    if (!fromIntro && !chapterParam) {
      router.replace(`/library/${bookId}/intro`);
    }
  }, [bookId, router, searchParams]);

  return (
    <>
      <div className="hidden md:contents">
        <ErrorBoundary><LeftPanel /></ErrorBoundary>
        <div className="flex-1 flex flex-col overflow-hidden">
          <ErrorBoundary><TopTabs /></ErrorBoundary>
          <ErrorBoundary><CenterPanel /></ErrorBoundary>
        </div>
        <ErrorBoundary><RightPanel /></ErrorBoundary>
      </div>
      <div className="md:hidden w-full">
        <ErrorBoundary>
          {activePanel === "library" && <LeftPanel />}
          {activePanel === "content" && (<div className="flex flex-col h-full"><TopTabs /><CenterPanel /></div>)}
          {activePanel === "chat" && <RightPanel />}
        </ErrorBoundary>
      </div>
    </>
  );
}
