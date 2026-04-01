"use client";
import MobileTabBar from "@/components/ui/MobileTabBar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="pb-14 md:pb-0">{children}</div>
      <MobileTabBar />
    </>
  );
}
