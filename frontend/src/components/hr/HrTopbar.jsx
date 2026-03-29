import { useNavigate, Link } from "react-router-dom";
import { User, LogOut, Moon, Sun, Building2 } from "lucide-react";
import { useEffect, useState } from "react";
import axiosInstance from "../../api/axios";

const HrTopbar = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("light");

  const applyTheme = (nextTheme) => {
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  };

  const getSystemTheme = () =>
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";

  useEffect(() => {
    const initTheme = async () => {
      try {
        const meRes = await axiosInstance.get("/user/me");
        const userTheme = meRes.data?.theme;
        const next = ["light", "dark"].includes(userTheme)
          ? userTheme
          : getSystemTheme();

        setTheme(next);
        applyTheme(next);
      } catch {
        const fallback = getSystemTheme();
        setTheme(fallback);
        applyTheme(fallback);
      }
    };

    initTheme();
  }, []);

  const toggleTheme = async () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);

    try {
      await axiosInstance.patch("/user/profile", { theme: nextTheme });
    } catch (error) {
      console.error("HR theme update error:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    localStorage.removeItem("themeInitialized");
    navigate("/auth/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 px-4 pt-4 sm:px-6">
      <div className="neu-panel mx-auto flex h-16 w-full max-w-[1500px] items-center justify-between rounded-[28px] px-4 sm:px-6">
        <div>
          <h1 className="text-lg font-semibold text-[var(--lms-text)]">
            HR Panel
          </h1>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--lms-text-soft)]">
            People Operations
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleTheme}
            className="neu-button rounded-2xl p-3 text-[var(--lms-text)]"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Link
            to="/hr/rooms"
            className="neu-button hidden items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-[var(--lms-text)] sm:inline-flex"
          >
            <Building2 size={16} />
            Rooms
          </Link>

          <Link
            to="/hr/profile"
            className="neu-button hidden items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-[var(--lms-text)] sm:inline-flex"
          >
            <User size={16} />
            Profile
          </Link>

          <button
            onClick={handleLogout}
            className="neu-button inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-[var(--lms-text)]"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default HrTopbar;
