import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  // Check if token exists in LocalStorage
  const token = localStorage.getItem("token");
  
  if (!token) {
    // If no token, redirect to Login
    return <Navigate to="/login" replace />;
  }

  // If token exists, render the Feed
  return children;
};

export default ProtectedRoute;