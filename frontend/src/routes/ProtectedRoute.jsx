import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children }) => {

    const token= localStorage.getItem("token")


    if (!token) {
        return <Navigate to={"/auth/login"} replace />
    }

    return children;
}

export default ProtectedRoute