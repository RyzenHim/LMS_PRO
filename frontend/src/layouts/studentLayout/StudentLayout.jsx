import { useState } from "react";
import { Outlet } from "react-router-dom";
import StudentTopbar from "./StudentTopbar";
import StudentSidebar from "./StudentSidebar";

const StudentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        />

        <main className="flex-1 p-4 md:ml-[280px] md:p-6">
          <div className="mx-auto w-full max-w-[1500px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
