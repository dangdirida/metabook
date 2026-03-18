"use client";

import LeftPanel from "@/components/panels/LeftPanel";
import CenterPanel from "@/components/panels/CenterPanel";
import RightPanel from "@/components/panels/RightPanel";
import TopTabs from "@/components/ui/TopTabs";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { usePanelStore } from "@/store/panelStore";

export default function BookDetailPage() {
  const { activePanel } = usePanelStore();

  return (
    <>
      {/* 데스크탑: 3패널 동시 표시 */}
      <div className="hidden md:contents">
        <ErrorBoundary>
          <LeftPanel />
        </ErrorBoundary>
        <div className="flex-1 flex flex-col overflow-hidden">
          <ErrorBoundary>
            <TopTabs />
          </ErrorBoundary>
          <ErrorBoundary>
            <CenterPanel />
          </ErrorBoundary>
        </div>
        <ErrorBoundary>
          <RightPanel />
        </ErrorBoundary>
      </div>

      {/* 모바일: activePanel에 따라 한 패널만 표시 */}
      <div className="md:hidden w-full">
        <ErrorBoundary>
          {activePanel === "library" && <LeftPanel />}
          {activePanel === "content" && (
            <div className="flex flex-col h-full">
              <TopTabs />
              <CenterPanel />
            </div>
          )}
          {activePanel === "chat" && <RightPanel />}
        </ErrorBoundary>
      </div>
    </>
  );
}
