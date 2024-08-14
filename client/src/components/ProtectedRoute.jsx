import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import LoadingSpinner from "./LoadingSpinner";

const ProtectedRoute = ({ children }) => {
  const { user } = useSelector(state => state.user); // Access the user state from the Redux store
  const navigate = useNavigate(); // Hook to programmatically navigate between routes

  useEffect(() => {
    // Redirect to the login page if the user is not logged in
    if (!user) navigate("/login", { replace: true });
    else if (user && !user.isVerified)
      navigate("/verify-email", { replace: true });
  }, [user, navigate]); // Dependency array ensures this effect runs when the user state or navigate function changes

  if (user === null) return <LoadingSpinner />; // Show a loading spinner while waiting for user data to load

  return children; // If the user is authenticated and their email is verified, render the protected child components
};

export default ProtectedRoute;
