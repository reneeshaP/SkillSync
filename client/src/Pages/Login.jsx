import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/auth.service";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handlesubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await authService.login(email, password);
      localStorage.setItem("token", data.token);
      setUser(data.user);
      navigate("/");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to login");
      console.error("Login error:", error);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    try {
      const data = await authService.googleAuth(credentialResponse.credential);
      localStorage.setItem("token", data.token);
      setUser(data.user);
      navigate(data.user.roleConfirmed ? "/" : "/choose-role");
    } catch (error) {
      setError(error.message || "Failed to sign in with Google");
    }
  };

  return (
    <div className="h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 text-white p-8 rounded-3xl shadow-md space-y-6">
        <h2 className="text-3xl font-bold text-center">Login to your account</h2>
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-3 text-sm">
            {error}
          </div>
        )}
        <p className="text-center text-zinc-400 text-sm">
          Don't have an account?{" "}
          <Link to="/signup" className="text-purple-400 hover:underline">
            Sign up
          </Link>
        </p>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google sign-in failed")}
            theme="filled_black"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-zinc-800" />
          <span className="text-xs text-zinc-500">OR</span>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        <form onSubmit={handlesubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition duration-200"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
