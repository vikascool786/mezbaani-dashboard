import React from "react";
import { Navigate } from "react-router-dom";

type Props = {
  children: React.ReactElement;
};

const isAuthenticated = () => Boolean(localStorage.getItem("authToken"));

export default function ProtectedRoute({ children }: Props) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}