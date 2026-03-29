import { useEffect, useState } from "react";
import { Menu, LogOut, Sun, Moon, User } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../../api/axios";

const StudentTopbar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(false);

  const toggleTheme = async () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);

    try {
      await axiosInstance.patch("/user/profile", {
        theme: next ? "dark" : "light",
      });
    } catch (error) {
      console.error("Student theme update error:", error);
    }
  };

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
    <header className="sticky top-0 z-30 px-4 pt-4 md:px-6">
      <div className="neu-panel mx-auto flex h-16 w-full max-w-[1500px] items-center justify-between rounded-[28px] px-4 md:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="neu-button rounded-2xl p-3 md:hidden"
          >
            <Menu size={18} className="text-[var(--lms-text)]" />
          </button>

          <div>
            <h1 className="text-lg font-semibold leading-tight text-[var(--lms-text)]">
              Student Dashboard
            </h1>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--lms-text-soft)]">
              Welcome back
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="neu-button rounded-2xl p-3"
            title="Toggle theme"
          >
            {dark ? (
              <Sun size={18} className="text-[var(--lms-text)]" />
            ) : (
              <Moon size={18} className="text-[var(--lms-text)]" />
            )}
          </button>

          <Link
            to="/student/profile"
            className="neu-button hidden items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-[var(--lms-text)] sm:inline-flex"
          >
            <User size={16} />
            <span>Profile</span>
          </Link>

          <div className="neu-panel-soft hidden items-center gap-3 rounded-[24px] px-3 py-2 sm:flex">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--lms-accent-soft)] font-semibold text-[var(--lms-accent-strong)]">
              {me?.name ? me.name.charAt(0).toUpperCase() : "S"}
            </div>

            <div className="leading-tight">
              <p className="text-sm font-semibold text-[var(--lms-text)]">
                {loading ? "Loading..." : me?.name || "Student"}
              </p>
              <p className="max-w-[160px] truncate text-xs text-[var(--lms-text-soft)]">
                {me?.email || ""}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="neu-button neu-button-primary flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium"
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
