import React, { useEffect, useState } from "react";
import { Menu, LogOut, Sun, Moon, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axios";
import { Link } from "react-router-dom";

const StudentTopbar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  // Theme
  const [dark, setDark] = useState(false);

  const toggleTheme = async () => {
    const next = !dark;
    setDark(next);

    if (next) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");

    try {
      await axiosInstance.patch("/user/profile", {
        theme: next ? "dark" : "light",
      });
    } catch (error) {
      console.error("Student theme update error:", error);
    }
  };

  // Fetch student info
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await axiosInstance.get("/user/me");
        const meData = res.data?.user || res.data;
        setMe(meData);

        const nextTheme = meData?.theme === "dark";
        setDark(nextTheme);
        document.documentElement.classList.toggle("dark", nextTheme);
      } catch (err) {
        console.error("Student topbar me error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth/login");
  };

  return (
    <header className="sticky top-0 z-30 h-16 w-full bg-white dark:bg-[#112D4E] border-b border-[#DBE2EF] dark:border-[#3F72AF] shadow-sm">
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-3">
          {/* Mobile menu */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] hover:bg-[#DBE2EF] dark:hover:bg-[#0a1f3a] transition"
          >
            <Menu size={18} className="text-[#112D4E] dark:text-[#DBE2EF]" />
          </button>

          {/* Title */}
          <div>
            <h1 className="text-lg font-semibold text-[#112D4E] dark:text-[#DBE2EF] leading-tight">
              Student Dashboard
            </h1>
            <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">
              Welcome back 👋
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Theme */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] hover:bg-[#DBE2EF] dark:hover:bg-[#0a1f3a] transition"
            title="Toggle theme"
          >
            {dark ? (
              <Sun size={18} className="text-[#DBE2EF]" />
            ) : (
              <Moon size={18} className="text-[#112D4E]" />
            )}
          </button>

          <Link
            to="/student/profile"
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] hover:bg-[#DBE2EF] dark:hover:bg-[#0a1f3a] transition text-[#112D4E] dark:text-[#DBE2EF] text-sm font-medium"
          >
            <User size={16} />
            <span className="hidden sm:block">Profile</span>
          </Link>

          {/* Student Info */}
          <div className="hidden sm:flex items-center gap-3 px-3 py-2 rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] bg-[#F9F7F7] dark:bg-[#0a1f3a]">
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-[#3F72AF] flex items-center justify-center text-white font-semibold">
              {me?.name ? me.name.charAt(0).toUpperCase() : "S"}
            </div>

            <div className="leading-tight">
              <p className="text-sm font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
                {loading ? "Loading..." : me?.name || "Student"}
              </p>
              <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF] truncate max-w-[160px]">
                {me?.email || ""}
              </p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white text-sm font-medium transition"
          >
            <LogOut size={16} />
            <span className="hidden sm:block">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default StudentTopbar;
