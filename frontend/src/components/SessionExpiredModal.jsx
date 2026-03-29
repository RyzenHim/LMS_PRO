import { useNavigate } from "react-router-dom";
import { resetSessionExpiredTrigger } from "../utils/authEvents";

const SessionExpiredModal = ({ open }) => {
  const navigate = useNavigate();

  if (!open) return null;

  const handleLoginAgain = () => {
    localStorage.removeItem("token");
    resetSessionExpiredTrigger();
    navigate("/auth/login", { replace: true });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      <div className="lms-modal-backdrop absolute inset-0" />

      <div className="neu-panel relative z-10 w-full max-w-md rounded-[32px] p-7">
        <div className="space-y-3">
          <span className="neu-badge inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]">
            Session Notice
          </span>
          <h2 className="text-2xl font-semibold text-[var(--lms-text)]">
            Session expired
          </h2>
          <p className="text-sm leading-relaxed text-[var(--lms-text-soft)]">
            Your session has ended. Please log in again to continue securely.
          </p>
        </div>

        <button
          onClick={handleLoginAgain}
          className="neu-button neu-button-primary mt-6 w-full rounded-[24px] px-5 py-3.5 text-sm font-semibold"
        >
          Login again
        </button>
      </div>
    </div>
  );
};

export default SessionExpiredModal;
