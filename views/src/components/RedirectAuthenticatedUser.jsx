import { Navigate } from "react-router-dom";
import { useVerifyTokenQuery } from "../redux/userApi";
import LoadingSpinner from "./LoadingSpinner";

// A component to redirect authenticated and verified users away from certain routes (e.g., login or signup)
const RedirectAuthenticatedUser = ({ children }) => {
  const { data, isLoading } = useVerifyTokenQuery();

  if (isLoading) return <LoadingSpinner />; // While verifying the token, show a loading state or skeleton

  if (data?.user.isVerified) return <Navigate to="/" replace />; // If the user is authenticated and their email is verified, redirect them to the home page

  if (!data?.user.isVerified) return <Navigate to="/verify-email" replace />; // If the user is authenticated but not verified, redirect them to the verify-email page

  return children; // If the user is not authenticated, render the child components (e.g., login or signup forms)
};

export default RedirectAuthenticatedUser;
