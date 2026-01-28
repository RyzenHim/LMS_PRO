import { useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axios";

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
      await axiosInstance.post("/user/forgot-password", { email });
      setMessage("Password reset link sent to your email");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">
          Forgot password
        </h1>
        <p className="text-sm text-gray-500">
          Enter your email to receive a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-sm font-medium text-gray-600">
            Email address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        {message && <p className="text-sm text-green-600">{message}</p>}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <p className="text-sm text-center">
        Remembered your password?{" "}
        <Link to="/auth/login" className="text-indigo-600 hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
