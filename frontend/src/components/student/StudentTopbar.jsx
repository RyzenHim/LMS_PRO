import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, LogOut } from "lucide-react";

const StudentTopbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    localStorage.removeItem("themeInitialized");

    navigate("/auth/login", { replace: true });
  };

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm">
      <h1 className="text-lg font-medium text-gray-900">Student Panel</h1>

      <div className="flex items-center gap-4">
        <Link
          to="/student"
          className="flex items-center gap-2 px-3 py-1 text-sm rounded-md border hover:bg-gray-100 transition-colors"
        >
          <User size={16} />
          Dashboard
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1 text-sm rounded-md border hover:bg-gray-100 transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
};

export default StudentTopbar;
