import { Link } from "react-router-dom";

const Login = () => {
    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="space-y-1">
                <h1 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
                    Sign in
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Enter your credentials to continue
                </p>
            </div>

            {/* Form */}
            <form className="space-y-5">

                {/* Email */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Email address
                    </label>
                    <input
                        type="email"
                        placeholder="you@company.com"
                        className="
              w-full px-4 py-3 rounded-xl border
              border-gray-200 dark:border-gray-700
              bg-white dark:bg-slate-800
              text-gray-900 dark:text-white
              shadow-sm
              focus:outline-none focus:ring-2 focus:ring-indigo-500
            "
                    />
                </div>

                {/* Password */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Password
                    </label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        className="
              w-full px-4 py-3 rounded-xl border
              border-gray-200 dark:border-gray-700
              bg-white dark:bg-slate-800
              text-gray-900 dark:text-white
              shadow-sm
              focus:outline-none focus:ring-2 focus:ring-indigo-500
            "
                    />
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center text-sm">
                    <label className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <input type="checkbox" className="rounded" />
                        Remember me
                    </label>

                    <Link
                        to="/auth/forgot-password"
                        className="text-indigo-600 hover:underline"
                    >
                        Forgot password?
                    </Link>
                </div>

                {/* Button */}
                <button
                    type="submit"
                    className="
            w-full py-3 rounded-xl
            bg-indigo-600 hover:bg-indigo-700
            text-white font-medium
            shadow-lg shadow-indigo-600/30
            transition
          "
                >
                    Sign in
                </button>
            </form>

            {/* Footer */}
            <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                New here?{" "}
                <Link
                    to="/auth/signup"
                    className="text-indigo-600 hover:underline font-medium"
                >
                    Create an account
                </Link>
            </p>

        </div>
    );
};

export default Login;
