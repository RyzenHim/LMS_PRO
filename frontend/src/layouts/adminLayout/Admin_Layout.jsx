import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./Admin_Sidebar";
import AdminTopbar from "./Admin_Topbar";

const AdminLayout = () => {
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
    <div className="min-h-dvh bg-slate-50 dark:bg-[#181818]">
      <AdminSidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((p) => !p)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div
        className={`
          flex min-h-dvh flex-col transition-[margin] duration-300 ease-in-out
          ${collapsed ? "lg:ml-20" : "lg:ml-64"}
        `}
      >
        <AdminTopbar onOpenMobileSidebar={() => setMobileOpen(true)} />

        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
