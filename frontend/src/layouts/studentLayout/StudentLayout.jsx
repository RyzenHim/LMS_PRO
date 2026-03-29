import { useState } from "react";
import { Outlet } from "react-router-dom";
import StudentTopbar from "./StudentTopbar";
import StudentSidebar from "./StudentSidebar";

const StudentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="lms-app-shell min-h-dvh">
      <StudentTopbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex">
        <StudentSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((prev) => !prev)}
        />

        <main
          className={`flex-1 p-4 transition-[margin] duration-300 md:p-6 ${
            collapsed ? "md:ml-24" : "md:ml-[280px]"
          }`}
        >
          <div className="mx-auto w-full max-w-[1500px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
