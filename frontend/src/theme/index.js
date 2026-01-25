import { createTheme } from "@mui/material/styles";

/* ---------- LIGHT THEME ---------- */
export const lightTheme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#4f46e5",
        },
        secondary: {
            main: "#22c55e",
        },
        background: {
            default: "#f9fafb",
            paper: "#ffffff",
        },
    },

    typography: {
        fontFamily: "Inter, sans-serif",
        h1: {
            fontSize: "2.5rem",
            fontWeight: 700,
        },
    },

    shape: {
        borderRadius: 8,
    },
});


/* ---------- DARK THEME ---------- */
export const darkTheme = createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: "#6366f1",   // adjusted for dark contrast
        },
        secondary: {
            main: "#22c55e",
        },
        background: {
            default: "#0f172a",
            paper: "#1e293b",
        },
    },

    typography: {
        fontFamily: "Inter, sans-serif",
        h1: {
            fontSize: "2.5rem",
            fontWeight: 700,
        },
    },

    shape: {
        borderRadius: 8,
    },
});
