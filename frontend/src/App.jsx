import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import SessionExpiredModal from "./components/SessionExpiredModal";
import { AUTH_EVENTS } from "./utils/authEvents";

const App = () => {
  const [sessionExpired, setSessionExpired] = useState(false);

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

  return (
    <>
      <SessionExpiredModal open={sessionExpired} />
      <Outlet />
    </>
  );
};

export default App;
