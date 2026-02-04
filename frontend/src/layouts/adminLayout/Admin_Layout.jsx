import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./Admin_Sidebar";
import AdminTopbar from "./Admin_Topbar";

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#F9F7F7] dark:bg-[#112D4E]">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Area */}
      <div className="flex flex-col flex-1 ml-64">
        {/* Topbar */}
        <AdminTopbar />

        {/* Page Content */}
        <main className="flex-1 p-6 bg-[#F9F7F7] dark:bg-[#112D4E]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
