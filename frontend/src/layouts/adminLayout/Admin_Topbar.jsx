import React from "react";
import { useNavigate } from "react-router-dom";

const AdminTopbar = () => {

const navigate= useNavigate()
const handleLogout=()=>{
    console.log("clicekd")
    localStorage.clear("token")
navigate("/auth")
}

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      <h1 className="text-lg font-medium text-gray-800">
        Admin Panel
      </h1>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          Admin
        </span>

        <button 
        onClick={handleLogout}
        className="px-3 py-1 text-sm rounded-md border hover:bg-gray-50">
          Logout
        </button>
      </div>
    </header>
  );
};

export default AdminTopbar;
