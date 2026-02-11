import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import StudentTopbar from "./StudentTopbar";
import StudentSidebar from "./StudentSidebar";

const StudentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F9F7F7] dark:bg-[#0a1f3a]">
      {/* Topbar */}
      <StudentTopbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex">
        {/* Sidebar */}
        <StudentSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Page */}
        <main className="flex-1 p-4 md:p-6 md:ml-[260px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
