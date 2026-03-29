import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginApi } from "../../services/authService";
import PageLoader from "../../components/ui/PageLoader";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await loginApi(form);

      if (!data?.token || !data?.user) {
        setError("Invalid login response from server.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate(data.redirectTo || "/", { replace: true });
    } catch (err) {
      setError(err?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-7">
      <div className="space-y-3">
        <span className="neu-badge inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]">
          Secure Sign In
        </span>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--lms-text)]">
            Welcome back
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--lms-text-soft)]">
            Enter your credentials to access the LMS workspace.
          </p>
        </div>
      </div>

      {error ? <div className="lms-status-error">{error}</div> : null}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-[var(--lms-text-soft)]"
          >
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@company.com"
            className="neu-input w-full rounded-[22px] px-4 py-3.5"
            required
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-[var(--lms-text-soft)]"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            className="neu-input w-full rounded-[22px] px-4 py-3.5"
            required
          />
        </div>

        <div className="flex items-center justify-between gap-3 text-sm">
          <label className="flex items-center gap-2 text-[var(--lms-text-soft)]">
            <input type="checkbox" className="accent-[var(--lms-accent-strong)]" />
            Remember me
          </label>

          <Link
            to="/auth/forgot-password"
            className="font-medium text-[var(--lms-accent-strong)] hover:opacity-80"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="neu-button neu-button-primary w-full rounded-[24px] px-5 py-3.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {loading ? (
        <div className="neu-panel-soft rounded-[28px] px-5 py-4">
          <PageLoader
            compact
            label="Authorizing"
            detail="Validating your session and preparing your dashboard"
          />
        </div>
      ) : null}
    </div>
  );
};

export default Login;
