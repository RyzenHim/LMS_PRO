import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginApi } from '../../services/authService'
import axiosInstance from "../../api/axios";
const Login = () => {
    const navigate = useNavigate()
    const [form, setForm] = useState({
        email: "",
        password: ""
    })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleChange = (e) => {
        setForm(
            {
                ...form,
                [e.target.name]: e.target.value
            }
        )
    }


    const handleSubmit = async (e) => {

        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const loginData = await axiosInstance.post("/user/login",form)
            localStorage.setItem("token", loginData.data.token);
            console.log("Login success:", loginData);
            navigate("/")

        } catch (err) {
            setError(err.message || "Login Failed")
        } finally {
            setLoading(false)
            console.log("logged in ");
        }
    }



    return (
        <div className="space-y-6">

            <div className="space-y-1">
                <h1 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
                    Sign in
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Enter your credentials to continue
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="space-y-5">

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Email address
                    </label>
                    <input
                        name="email"
                        value={form.email}
                        onChange={handleChange}
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

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Password
                    </label>
                    <input
                        name="password"
                        value={form.password}
                        onChange={handleChange}
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
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>

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
