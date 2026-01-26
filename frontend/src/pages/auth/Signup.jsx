import { Link } from "react-router-dom";

const Signup = () => {
    return (
        <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 p-8 rounded-xl shadow-md">

            {/* Title */}
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Signup
            </h1>

            {/* Subtitle */}
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Create your account to get started.
            </p>

            {/* Form */}
            <form className="space-y-4">

                {/* Full Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Full Name
                    </label>
                    <input
                        type="text"
                        placeholder="John Doe"
                        className="
              w-full px-3 py-2 rounded-md border
              border-gray-300 dark:border-gray-700
              bg-white dark:bg-slate-800
              text-gray-900 dark:text-white
              placeholder-gray-400 dark:placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-indigo-500
            "
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        placeholder="you@example.com"
                        className="
              w-full px-3 py-2 rounded-md border
              border-gray-300 dark:border-gray-700
              bg-white dark:bg-slate-800
              text-gray-900 dark:text-white
              placeholder-gray-400 dark:placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-indigo-500
            "
                    />
                </div>

                {/* Password */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Password
                    </label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        className="
              w-full px-3 py-2 rounded-md border
              border-gray-300 dark:border-gray-700
              bg-white dark:bg-slate-800
              text-gray-900 dark:text-white
              placeholder-gray-400 dark:placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-indigo-500
            "
                    />
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    className="
            w-full mt-4 py-2 rounded-md
            bg-indigo-600 hover:bg-indigo-700
            text-white font-medium
            transition-colors
          "
                >
                    Signup
                </button>
            </form>

            {/* Footer */}
            <p className="text-sm text-center text-gray-600 dark:text-gray-400 mt-6">
                Already have an account?{" "}
                <Link
                    to="/auth/login"
                    className="text-indigo-600 hover:underline font-medium"
                >
                    Login
                </Link>
            </p>
        </div>
    );
};

export default Signup;
