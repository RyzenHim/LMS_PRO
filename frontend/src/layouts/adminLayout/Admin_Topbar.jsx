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
    <header className="h-16 bg-white dark:bg-[#112D4E] border-b dark:border-[#3F72AF] flex items-center justify-between px-6 shadow-sm">
      <h1 className="text-lg font-medium text-[#112D4E] dark:text-[#DBE2EF]">
        Admin Panel
      </h1>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-[#DBE2EF] dark:hover:bg-[#3F72AF] text-[#3F72AF] dark:text-[#DBE2EF] transition-colors"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <Link
          to="/admin/profile"
          className="flex items-center gap-2 px-3 py-1 text-sm rounded-md border dark:border-[#3F72AF] hover:bg-[#DBE2EF] dark:hover:bg-[#3F72AF] text-[#3F72AF] dark:text-[#DBE2EF] transition-colors"
        >
          <User size={16} />
          Profile
        </Link>

        <span className="text-sm text-[#3F72AF] dark:text-[#DBE2EF]">
          Admin
        </span>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1 text-sm rounded-md border dark:border-[#3F72AF] hover:bg-[#DBE2EF] dark:hover:bg-[#3F72AF] text-[#3F72AF] dark:text-[#DBE2EF] transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
};

export default AdminTopbar;
