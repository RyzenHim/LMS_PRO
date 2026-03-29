import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import SessionExpiredModal from "./components/SessionExpiredModal";
import { AUTH_EVENTS } from "./utils/authEvents";

const App = () => {
  const [sessionExpired, setSessionExpired] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    document.documentElement.classList.toggle("dark", prefersDark);
  }, []);

  useEffect(() => {
    const handler = () => setSessionExpired(true);

    window.addEventListener(AUTH_EVENTS.SESSION_EXPIRED, handler);

    return () => {
      window.removeEventListener(AUTH_EVENTS.SESSION_EXPIRED, handler);
    };
  }, []);

  useEffect(() => {
    if (location.pathname.startsWith("/auth")) {
      setSessionExpired(false);
    }
  }, [location.pathname]);

  return (
    <div className="lms-app-shell">
      <SessionExpiredModal
        open={sessionExpired}
        onClose={() => setSessionExpired(false)}
      />
      <Outlet />
    </div>
  );
};

export default App;
