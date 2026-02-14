import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminTopbar = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("light");

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  // load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);

    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");

    // IMPORTANT:
    // Don't call backend here unless your backend is 100% ready.
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("theme");

    navigate("/auth/login", { replace: true });
  };

  return (
    <header className="h-16 bg-white dark:bg-[#112D4E] border-b border-gray-200 dark:border-[#3F72AF] flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
        Admin Panel
      </h1>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600 dark:text-gray-200">
          {user?.email || "Admin"}
        </span>

        <button
          onClick={toggleTheme}
          className="px-3 py-1 text-sm rounded-md border border-gray-200 dark:border-[#3F72AF] hover:bg-gray-50 dark:hover:bg-[#0a1f3a] text-gray-700 dark:text-white"
        >
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>

        <button
          onClick={handleLogout}
          className="px-3 py-1 text-sm rounded-md border border-gray-200 dark:border-[#3F72AF] hover:bg-gray-50 dark:hover:bg-[#0a1f3a] text-gray-700 dark:text-white"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default AdminTopbar;
