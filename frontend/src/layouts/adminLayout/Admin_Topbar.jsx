import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Moon, Sun, User, LogOut, Menu } from "lucide-react";
import axiosInstance from "../../api/axios";

const AdminTopbar = ({ onOpenMobileSidebar }) => {
  const navigate = useNavigate();

  const [theme, setTheme] = useState("light");
  const [loadingTheme, setLoadingTheme] = useState(true);

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
      setLoadingTheme(true);

      const token = localStorage.getItem("token");

      // No token → fallback to system theme
      if (!token) {
        const fallback = getSystemTheme();
        setTheme(fallback);
        applyTheme(fallback);
        return;
      }

      // token exists → fetch user
      const res = await axiosInstance.get("/user/me");

      const userTheme = res.data?.theme;
      const systemTheme = getSystemTheme();
      const themeInitialized = localStorage.getItem("themeInitialized");

      let finalTheme = ["light", "dark"].includes(userTheme)
        ? userTheme
        : systemTheme;

      // First login → sync theme with system
      if (!themeInitialized) {
        finalTheme = systemTheme;

        try {
          await axiosInstance.patch("/user/profile", { theme: finalTheme });
          localStorage.setItem("themeInitialized", "true");
        } catch (err) {
          // ignore patch errors silently
          console.error("Theme first-sync error:", err);
        }
      }

      setTheme(finalTheme);
      applyTheme(finalTheme);
    } catch (error) {
      // token exists but /me failed (expired, etc.)
      const fallback = getSystemTheme();
      setTheme(fallback);
      applyTheme(fallback);

      console.error("Theme init error:", error);
    } finally {
      setLoadingTheme(false);
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
    localStorage.removeItem("theme");

    const fallback = getSystemTheme();
    setTheme(fallback);
    applyTheme(fallback);

    navigate("/auth/login", { replace: true });
  };

  return (
    <header
      className="
        sticky top-0 z-[40]
        h-16
        flex items-center justify-between
        px-4 sm:px-6
        border-b border-black/10 dark:border-white/10
        bg-white/80 dark:bg-[#101010]/85
        backdrop-blur-xl
        shadow-sm
      "
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onOpenMobileSidebar}
          className="
            lg:hidden
            inline-flex items-center justify-center
            h-10 w-10
            rounded-2xl
            border border-black/10 dark:border-white/10
            bg-white dark:bg-white/5
            hover:bg-black/5 dark:hover:bg-white/10
            transition
          "
          title="Open Menu"
        >
          <Menu size={18} className="text-black/70 dark:text-white/80" />
        </button>

        <div className="leading-tight">
          <h1 className="text-sm sm:text-base font-semibold text-black/90 dark:text-white">
            Admin Panel
          </h1>
          <p className="hidden sm:block text-xs text-black/50 dark:text-white/50">
            LMS Control Center
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme */}
        <button
          onClick={toggleTheme}
          disabled={loadingTheme}
          className="
            inline-flex items-center justify-center
            h-10 w-10
            rounded-2xl
            border border-black/10 dark:border-white/10
            bg-white dark:bg-white/5
            hover:bg-black/5 dark:hover:bg-white/10
            transition
            disabled:opacity-60
          "
          title={theme === "dark" ? "Switch to Light" : "Switch to Dark"}
        >
          {theme === "dark" ? (
            <Sun size={18} className="text-white/80" />
          ) : (
            <Moon size={18} className="text-black/70" />
          )}
        </button>

        {/* Profile */}
        <Link
          to="/admin/profile"
          className="
            hidden sm:inline-flex items-center gap-2
            h-10 px-4
            rounded-2xl
            border border-black/10 dark:border-white/10
            bg-white dark:bg-white/5
            hover:bg-black/5 dark:hover:bg-white/10
            transition
            text-sm font-medium
            text-black/70 dark:text-white/80
          "
        >
          <User size={16} />
          Profile
        </Link>

        {/* Role badge */}
        <span
          className="
            hidden sm:inline-flex
            h-10 items-center
            px-3
            rounded-2xl
            border border-black/10 dark:border-white/10
            bg-black/[0.03] dark:bg-white/[0.06]
            text-xs font-semibold tracking-wide
            text-black/60 dark:text-white/60
          "
        >
          ADMIN
        </span>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="
            inline-flex items-center gap-2
            h-10 px-4
            rounded-2xl
            border border-black/10 dark:border-white/10
            bg-white dark:bg-white/5
            hover:bg-red-500/10 dark:hover:bg-red-500/15
            transition
            text-sm font-medium
            text-black/70 dark:text-white/80
          "
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default AdminTopbar;
