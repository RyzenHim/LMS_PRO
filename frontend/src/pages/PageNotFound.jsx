import { Link } from "react-router-dom";

const NotFound = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-950 text-center px-6">

            <h1 className="text-7xl font-bold text-indigo-600 mb-4">
                404
            </h1>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Page not found
            </h2>

            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
                The page you are looking for does not exist or may have been moved.
            </p>

            <div className="flex gap-4">
                <Link
                    to="/"
                    className="px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                >
                    Go to Home
                </Link>

                <Link
                    to="/auth/login"
                    className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-slate-800"
                >
                    Login
                </Link>
            </div>

        </div>
    );
};

export default NotFound;
