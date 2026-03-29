import { useEffect, useState } from "react";
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

  const getSystemTheme = () =>
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";

  const fetchAndInitTheme = async () => {
    try {
      setLoadingTheme(true);
      const token = localStorage.getItem("token");

      if (!token) {
        const fallback = getSystemTheme();
        setTheme(fallback);
        applyTheme(fallback);
        return;
      }

      const res = await axiosInstance.get("/user/me");
      const userTheme = res.data?.theme;
      const systemTheme = getSystemTheme();
      const themeInitialized = localStorage.getItem("themeInitialized");

      let finalTheme = ["light", "dark"].includes(userTheme)
        ? userTheme
        : systemTheme;

      if (!themeInitialized) {
        finalTheme = systemTheme;

        try {
          await axiosInstance.patch("/user/profile", { theme: finalTheme });
          localStorage.setItem("themeInitialized", "true");
        } catch (err) {
          console.error("Theme first-sync error:", err);
        }
      }

      setTheme(finalTheme);
      applyTheme(finalTheme);
    } catch (error) {
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
      if (!localStorage.getItem("token")) return;
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
    <header className="sticky top-0 z-[40] px-4 pt-4 sm:px-6 lg:px-8">
      <div className="neu-panel flex h-16 items-center justify-between rounded-[28px] px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="neu-button inline-flex h-11 w-11 items-center justify-center rounded-2xl lg:hidden"
            title="Open Menu"
          >
            <Menu size={18} className="text-[var(--lms-text)]" />
          </button>

          <div className="leading-tight">
            <h1 className="text-sm font-semibold text-[var(--lms-text)] sm:text-base">
              Admin Panel
            </h1>
            <p className="hidden text-xs uppercase tracking-[0.18em] text-[var(--lms-text-soft)] sm:block">
              LMS Control Center
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleTheme}
            disabled={loadingTheme}
            className="neu-button inline-flex h-11 w-11 items-center justify-center rounded-2xl disabled:opacity-60"
            title={theme === "dark" ? "Switch to Light" : "Switch to Dark"}
          >
            {theme === "dark" ? (
              <Sun size={18} className="text-[var(--lms-text)]" />
            ) : (
              <Moon size={18} className="text-[var(--lms-text)]" />
            )}
          </button>

          <Link
            to="/admin/profile"
            className="neu-button hidden items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-[var(--lms-text)] sm:inline-flex"
          >
            <User size={16} />
            Profile
          </Link>

          <span className="neu-badge hidden rounded-2xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] sm:inline-flex">
            Admin
          </span>

          <button
            onClick={handleLogout}
            className="neu-button inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-[var(--lms-text)] hover:text-[var(--lms-danger)]"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminTopbar;
