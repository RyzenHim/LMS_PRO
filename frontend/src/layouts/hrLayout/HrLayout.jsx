import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import HrSidebar from "../../components/hr/HrSidebar";
import HrTopbar from "../../components/hr/HrTopbar";

const HrLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="lms-app-shell min-h-dvh">
      <HrSidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div
        className={`flex min-h-dvh flex-col transition-[margin] duration-300 ease-in-out ${
          collapsed ? "lg:ml-24" : "lg:ml-[18rem]"
        }`}
      >
        <HrTopbar onOpenMobileSidebar={() => setMobileOpen(true)} />

        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default HrLayout;
