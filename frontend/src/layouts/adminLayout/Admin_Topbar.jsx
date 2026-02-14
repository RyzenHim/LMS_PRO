import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Moon, Sun, User, LogOut } from "lucide-react";
import axiosInstance from "../../api/axios";

const AdminTopbar = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("light");

  const applyTheme = (nextTheme) => {
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  };

  const getSystemTheme = () => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  const fetchAndInitTheme = async () => {
    try {
      const token = localStorage.getItem("token");

      // No token → fallback to system theme
      if (!token) {
        const fallback = getSystemTheme();
        setTheme(fallback);
        applyTheme(fallback);
        return;
      }

      // axiosInstance already sends token via interceptor
      const res = await axiosInstance.get("/user/me");

      const userTheme = res.data?.theme;
      const systemTheme = getSystemTheme();
      const themeInitialized = localStorage.getItem("themeInitialized");

      let finalTheme = ["light", "dark"].includes(userTheme)
        ? userTheme
        : systemTheme;

      // First time user login → sync theme with system theme
      if (!themeInitialized) {
        finalTheme = systemTheme;

        await axiosInstance.patch("/user/profile", { theme: finalTheme });

        localStorage.setItem("themeInitialized", "true");
      }

      setTheme(finalTheme);
      applyTheme(finalTheme);
    } catch (error) {
      const fallback = getSystemTheme();
      setTheme(fallback);
      applyTheme(fallback);
      console.error("Theme init error:", error);
    }
  };

  useEffect(() => {
    fetchAndInitTheme();
  }, []);

  const toggleTheme = async () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // ✅ FIX: PATCH instead of PUT
      await axiosInstance.patch("/user/profile", { theme: nextTheme });
    } catch (error) {
      console.error("Theme update error:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    localStorage.removeItem("themeInitialized");

    const fallback = getSystemTheme();
    setTheme(fallback);
    applyTheme(fallback);

    navigate("/auth/login", { replace: true });
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
          title={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
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
