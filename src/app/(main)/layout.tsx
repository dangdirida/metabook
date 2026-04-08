"use client";
import MobileTabBar from "@/components/ui/MobileTabBar";
import DesktopNav from "@/components/ui/DesktopNav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DesktopNav />
      <div className="pb-14 md:pb-0">{children}</div>
      <MobileTabBar />
    </>
  );
}
