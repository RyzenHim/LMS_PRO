import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resetPasswordApi } from "../../services/authService";
import PageLoader from "../../components/ui/PageLoader";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await resetPasswordApi(token, { password });
      navigate("/auth/login", { replace: true });
    } catch (err) {
      setError(err?.message || "Reset failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-7">
      <div className="space-y-3">
        <span className="neu-badge inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]">
          Password Reset
        </span>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--lms-text)]">
            Reset password
          </h1>
          <p className="mt-2 text-sm text-[var(--lms-text-soft)]">
            Choose a new password for your account.
          </p>
        </div>
      </div>

      {error ? <div className="lms-status-error">{error}</div> : null}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="new-password"
            className="text-sm font-medium text-[var(--lms-text-soft)]"
          >
            New password
          </label>
          <input
            id="new-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="neu-input w-full rounded-[22px] px-4 py-3.5"
            required
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="confirm-password"
            className="text-sm font-medium text-[var(--lms-text-soft)]"
          >
            Confirm password
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="neu-input w-full rounded-[22px] px-4 py-3.5"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="neu-button neu-button-primary w-full rounded-[24px] px-5 py-3.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Resetting..." : "Reset password"}
        </button>
      </form>

      {loading ? (
        <div className="neu-panel-soft rounded-[28px] px-5 py-4">
          <PageLoader
            compact
            label="Updating"
            detail="Securing your account with the new password"
          />
        </div>
      ) : null}
    </div>
  );
};

export default ResetPassword;
