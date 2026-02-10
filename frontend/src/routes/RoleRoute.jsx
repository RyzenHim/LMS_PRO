import React from "react";
import { Navigate } from "react-router-dom";

const RoleRoute = ({ allowedRoles = [], children }) => {
  const userStr = localStorage.getItem("user");

  if (!userStr) {
    return <Navigate to="/auth/login" replace />;
  }

  let user = null;

  try {
    user = JSON.parse(userStr);
  } catch (err) {
    localStorage.clear();
    return <Navigate to="/auth/login" replace />;
  }

  if (!user?.role) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "hr") return <Navigate to="/hr" replace />;
    if (user.role === "instructor")
      return <Navigate to="/instructor" replace />;
    if (user.role === "student") return <Navigate to="/student" replace />;

    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleRoute;
