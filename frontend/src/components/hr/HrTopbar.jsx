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

  const getSystemTheme = () => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

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
    <header className="h-16 bg-white dark:bg-[#112D4E] border-b dark:border-[#3F72AF] flex items-center justify-between px-6 shadow-sm">
      <h1 className="text-lg font-medium text-[#112D4E] dark:text-[#DBE2EF]">HR Panel</h1>

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
          to="/hr/rooms"
          className="flex items-center gap-2 px-3 py-1 text-sm rounded-md border dark:border-[#3F72AF] hover:bg-[#DBE2EF] dark:hover:bg-[#3F72AF] text-[#3F72AF] dark:text-[#DBE2EF] transition-colors"
        >
          <Building2 size={16} />
          Rooms
        </Link>

        <Link
          to="/hr/profile"
          className="flex items-center gap-2 px-3 py-1 text-sm rounded-md border dark:border-[#3F72AF] hover:bg-[#DBE2EF] dark:hover:bg-[#3F72AF] text-[#3F72AF] dark:text-[#DBE2EF] transition-colors"
        >
          <User size={16} />
          Profile
        </Link>

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

export default HrTopbar;
