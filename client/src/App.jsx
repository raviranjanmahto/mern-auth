import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import FloatingShape from "./components/FloatingShape";
import ProtectedRoute from "./components/ProtectedRoute";
import RedirectAuthenticatedUser from "./components/RedirectAuthenticatedUser";

import DashboardPage from "./pages/DashboardPage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import { useCurrentUserQuery } from "./redux/userApi";
import LoadingSpinner from "./components/LoadingSpinner";
import { setCredentials } from "./redux/userSlice";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

function App() {
  const { data, isLoading } = useCurrentUserQuery();
  const dispatch = useDispatch();

  useEffect(() => {
    if (data) dispatch(setCredentials(data.data));
  }, [data, dispatch]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div
      className="min-h-screen bg-gradient-to-br
from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center relative overflow-hidden"
    >
      <FloatingShape
        color="bg-green-500"
        size="w-64 h-64"
        top="-5%"
        left="10%"
        delay={0}
      />
      <FloatingShape
        color="bg-emerald-500"
        size="w-48 h-48"
        top="70%"
        left="80%"
        delay={5}
      />
      <FloatingShape
        color="bg-lime-500"
        size="w-32 h-32"
        top="40%"
        left="-10%"
        delay={2}
      />

      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element=<ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          />
          <Route
            path="/signup"
            element=<RedirectAuthenticatedUser>
              <SignUpPage />
            </RedirectAuthenticatedUser>
          />
          <Route
            path="/login"
            element=<RedirectAuthenticatedUser>
              <LoginPage />
            </RedirectAuthenticatedUser>
          />
          <Route
            path="/verify-email"
            element=<ProtectedRoute>
              <EmailVerificationPage />
            </ProtectedRoute>
          />
          <Route
            path="/forgot-password"
            element=<RedirectAuthenticatedUser>
              <ForgotPasswordPage />
            </RedirectAuthenticatedUser>
          />

          <Route
            path="/reset-password/:token"
            element=<RedirectAuthenticatedUser>
              <ResetPasswordPage />
            </RedirectAuthenticatedUser>
          />
          <Route path="*" element=<Navigate to="/" replace /> />
        </Routes>
      </BrowserRouter>

      <ToastContainer />
    </div>
  );
}

export default App;
