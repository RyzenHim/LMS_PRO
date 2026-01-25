import AuthLayout from "../layouts/AuthLayout";
import Login from '../pages/auth/Login'
import Signup from '../pages/auth/Signup'
const { createBrowserRouter } = require("react-router-dom");


const router = createBrowserRouter([

    {
        path: "/auth",
        element: <AuthLayout />,
        children: [
            {
                index: true,
                element: <Login />
            },
            {
                path: "login",
                element: <Login />
            },
            {
                path: "signup",
                element: <Signup />

            },
        ],
    },
    {

    }




])

export default router