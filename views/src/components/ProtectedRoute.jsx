import { Navigate } from "react-router-dom";

import { useVerifyTokenQuery } from "../redux/userApi";
import LoadingSpinner from "./LoadingSpinner";

// A higher-order component to protect routes that require authentication and email verification
const ProtectedRoute = ({ children }) => {
  const { isLoading, data, error } = useVerifyTokenQuery();

  if (isLoading) return <LoadingSpinner />; // While verifying the token, show a loading state or skeleton

  if (error) return <Navigate to="/login" replace />; // If there is an error (like token is invalid), redirect to login page

  if (!data?.user.isVerified) return <Navigate to="/verify-email" replace />; // If user is authenticated but hasn't verified their email, redirect to email verification page

  return children; // If user is authenticated and email is verified, render the protected child components
};

export default ProtectedRoute;
