import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { Mail, Lock, Loader } from "lucide-react";
import { toast } from "react-toastify";

import Input from "../components/Input";
import { useLoginMutation } from "../redux/userApi";
import { setCredentials } from "../redux/userSlice";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Using the login mutation from RTK Query
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();

  const handleLogin = async e => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      const { data } = await login({ email, password }).unwrap();
      dispatch(setCredentials(data));
      toast.success("Logged in successfully");
    } catch (err) {
      toast.error(err?.data?.message);
    }
  };

  const handleTestUserLogin = async e => {
    e.preventDefault();

    // Set test credentials
    const email = "testuser@auth.com";
    const password = "Qwerty@123";

    try {
      const { data } = await login({ email, password }).unwrap();
      dispatch(setCredentials(data));
      toast.success("Logged in as Test User");
    } catch (err) {
      toast.error(err?.data?.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md w-full bg-gray-800 bg-opacity-60 backdrop-filter backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden"
    >
      <div className="p-8">
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
          Welcome Back
        </h2>

        <form onSubmit={handleLogin}>
          <Input
            icon={Mail}
            type="email"
            placeholder="Email Address"
            value={email}
            required
            onChange={e => setEmail(e.target.value)}
          />

          <Input
            icon={Lock}
            type="password"
            placeholder="Password"
            value={password}
            required
            onChange={e => setPassword(e.target.value)}
          />

          <div className="flex items-center mb-6">
            <Link
              to="/forgot-password"
              className="text-sm text-green-400 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? <Loader className="animate-spin mx-auto" /> : "Login"}
          </motion.button>

          {/* Test User Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 px-4 mt-4 bg-gray-700 text-white font-bold rounded-lg shadow-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200"
            onClick={handleTestUserLogin}
            disabled={isLoading}
          >
            Login as Test User
          </motion.button>
        </form>
      </div>
      <div className="px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center">
        <p className="text-sm text-gray-400">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-green-400 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default LoginPage;
