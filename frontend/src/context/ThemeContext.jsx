import { createContext, useContext, useEffect, useState } from "react";

/**
 * ThemeContext
 * Responsibility:
 * - Resolve initial theme (local → system)
 * - Apply theme to <html>
 * - Persist to localStorage
 * - Expose clean API to UI
 */

const ThemeContext = createContext(null);

/* ---------------------------------------------
   Utility: Resolve Initial Theme
   Priority:
   1. localStorage
   2. system preference
---------------------------------------------- */
function resolveInitialTheme() {
    const stored = localStorage.getItem("theme");

    if (stored === "light" || stored === "dark") {
        return stored;
    }

    const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
    ).matches;

    return prefersDark ? "dark" : "light";
}

/* ---------------------------------------------
   Theme Provider
---------------------------------------------- */
export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => resolveInitialTheme());

    /* Apply theme + persist */
    useEffect(() => {
        // Tailwind dark mode works by toggling "dark" class on <html>
        document.documentElement.classList.toggle("dark", theme === "dark");

        // Persist preference
        localStorage.setItem("theme", theme);
    }, [theme]);

    /* Toggle helper */
    const toggleTheme = () => {
        setTheme(prev => (prev === "light" ? "dark" : "light"));
    };

    const value = {
        theme,        // "light" | "dark"
        setTheme,     // setTheme("dark")
        toggleTheme,  // toggle
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

/* ---------------------------------------------
   Custom Hook
---------------------------------------------- */
export function useTheme() {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error("useTheme must be used inside ThemeProvider");
    }

    return context;
}
