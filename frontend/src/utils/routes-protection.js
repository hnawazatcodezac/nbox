import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export const PrivateRoute = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    return <Outlet />;
  } else {
    localStorage.setItem("redirected_url", window.location.pathname);
    return <Navigate to="/" />;
  }
};

export const PublicRoute = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    return <Navigate to="/profile" />;
  } else {
    return <Outlet />;
  }
};
