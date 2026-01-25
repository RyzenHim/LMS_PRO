import React from 'react'
import { Outlet } from "react-router-dom"


const AuthLayout = () => {
    return (
        <div className="auth-container">
            {/* Left side – branding */}
            <div className="auth-left">
                <h1>LMS Portal</h1>
                <p>Welcome to the learning platform</p>
            </div>

            {/* Right side – dynamic form */}
            <div className="auth-right">
                <Outlet />
            </div>
        </div>
    );
}

export default AuthLayout