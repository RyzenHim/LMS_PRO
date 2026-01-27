import { Link } from "react-router-dom";

const Signup = () => {
    return (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800">

            {/* Header */}
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
                Create account
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Start managing your learning today
            </p>

            {/* Form */}
            <form className="space-y-5">

                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        Full name
                    </label>
                    <input
                        type="text"
                        placeholder="John Doe"
                        className="
              w-full px-4 py-2.5 rounded-lg border
              border-gray-200 dark:border-gray-700
              bg-white dark:bg-slate-800
              text-gray-900 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-indigo-500
            "
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        Email address
                    </label>
                    <input
                        type="email"
                        placeholder="you@example.com"
                        className="
              w-full px-4 py-2.5 rounded-lg border
              border-gray-200 dark:border-gray-700
              bg-white dark:bg-slate-800
              text-gray-900 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-indigo-500
            "
                    />
                </div>

                {/* Password */}
                <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        Password
                    </label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        className="
              w-full px-4 py-2.5 rounded-lg border
              border-gray-200 dark:border-gray-700
              bg-white dark:bg-slate-800
              text-gray-900 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-indigo-500
            "
                    />
                </div>

                {/* Button */}
                <button
                    type="submit"
                    className="
            w-full py-2.5 rounded-lg
            bg-indigo-600 hover:bg-indigo-700
            text-white font-medium
            transition
          "
                >
                    Create account
                </button>
            </form>

            {/* Footer */}
            <p className="text-sm text-center text-gray-600 dark:text-gray-400 mt-6">
                Already have an account?{" "}
                <Link
                    to="/auth/login"
                    className="text-indigo-600 hover:underline font-medium"
                >
                    Sign in
                </Link>
            </p>
        </div>
    );
};

export default Signup;
