import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Moon, Sun, User, LogOut } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const AdminTopbar = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    console.log("clicked");
    localStorage.clear();
    navigate("/auth");
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex items-center justify-between px-6">
      <h1 className="text-lg font-medium text-gray-800 dark:text-white">
        Admin Panel
      </h1>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <Link
          to="/admin/profile"
          className="flex items-center gap-2 px-3 py-1 text-sm rounded-md border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
        >
          <User size={16} />
          Profile
        </Link>

        <span className="text-sm text-gray-600 dark:text-gray-300">
          Admin
        </span>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1 text-sm rounded-md border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
};

export default AdminTopbar;
