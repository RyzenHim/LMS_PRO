import { Link } from "react-router-dom";

const Unauthorized = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-slate-950 px-6">

            <h1 className="text-6xl font-bold text-red-500 mb-4">
                403
            </h1>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Access Denied
            </h2>

            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
                You do not have permission to access this page.
            </p>

            <Link
                to="/"
                className="px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
                Go to Home
            </Link>

        </div>
    );
};

export default Unauthorized;
