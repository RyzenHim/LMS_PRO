import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPasswordApi } from "../../services/authService";
import PageLoader from "../../components/ui/PageLoader";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await forgotPasswordApi({ email });
      setMessage("Password reset link sent to your email.");
      setEmail("");
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-7">
      <div className="space-y-3">
        <span className="neu-badge inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]">
          Recovery
        </span>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--lms-text)]">
            Forgot password
          </h1>
          <p className="mt-2 text-sm text-[var(--lms-text-soft)]">
            Enter your email and we&apos;ll send a reset link.
          </p>
        </div>
      </div>

      {message ? <div className="lms-status-success">{message}</div> : null}
      {error ? <div className="lms-status-error">{error}</div> : null}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="forgot-email"
            className="text-sm font-medium text-[var(--lms-text-soft)]"
          >
            Email address
          </label>
          <input
            id="forgot-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="neu-input w-full rounded-[22px] px-4 py-3.5"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="neu-button neu-button-primary w-full rounded-[24px] px-5 py-3.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>

      {loading ? (
        <div className="neu-panel-soft rounded-[28px] px-5 py-4">
          <PageLoader
            compact
            label="Sending"
            detail="Creating a secure password recovery link"
          />
        </div>
      ) : null}

      <p className="text-sm text-center text-[var(--lms-text-soft)]">
        Remembered your password?{" "}
        <Link
          to="/auth/login"
          className="font-medium text-[var(--lms-accent-strong)] hover:opacity-80"
        >
          Back to login
        </Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
