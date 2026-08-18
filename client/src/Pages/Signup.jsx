import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/auth.service";

const Signup = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreedToTerms: false,
    role: "mentee",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const { username, email, password, confirmPassword, agreedToTerms, role } = formData;

    if (!username || !email || !password || !confirmPassword) {
      return setError("All fields are required.");
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    if (!agreedToTerms) {
      return setError("You must agree to the terms.");
    }

    try {
      const res = await axios.post("http://localhost:8000/api/auth/signup", {
       username: formData.username, 
       email: formData.email,
       password: formData.password,
       role: formData.role,
      });

      setSuccess(res.data.message);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed.");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    try {
      const data = await authService.googleAuth(credentialResponse.credential);
      localStorage.setItem("token", data.token);
      setUser(data.user);
      navigate(data.user.roleConfirmed ? "/" : "/choose-role");
    } catch (err) {
      setError(err.message || "Failed to sign up with Google");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Top Section with Signup Form and Carousel */}
      <div className="w-full flex min-h-[600px]">
        {/* Left Side with Carousel */}
        <div className="w-1/2 bg-[#3B364C] rounded-3xl m-4 p-8 flex flex-col justify-between text-white relative overflow-hidden">
          <Carousel
            showArrows={true}
            showStatus={false}
            showThumbs={false}
            infiniteLoop={true}
            autoPlay={true}
            interval={5000}
            className="h-full flex flex-col justify-center"
            showIndicators={false}
            renderArrowPrev={(clickHandler, hasPrev) => (
              <button
                onClick={clickHandler}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all"
                style={{ display: hasPrev ? 'block' : 'none' }}
              >
                <FiChevronLeft className="w-6 h-6 text-white" />
              </button>
            )}
            renderArrowNext={(clickHandler, hasNext) => (
              <button
                onClick={clickHandler}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all"
                style={{ display: hasNext ? 'block' : 'none' }}
              >
                <FiChevronRight className="w-6 h-6 text-white" />
              </button>
            )}
          >
            {/* Slide 1 */}
            <div className="flex flex-col items-center justify-center h-full">
              <h2 className="text-4xl font-bold text-center mb-4">
                Connect, Learn, and Grow Together
              </h2>
              <p className="text-lg text-gray-300 text-center">
                Start your journey of growth and learning
              </p>
            </div>

            {/* Slide 2 */}
            <div className="flex flex-col items-center justify-center h-full px-8">
              <p className="text-xl text-center leading-relaxed">
                SkillSync brings together mentors and learners in a collaborative community. Share knowledge, develop skills, and build meaningful connections.
              </p>
        </div>

            {/* Slide 3 */}
            <div className="flex flex-col items-center justify-center h-full">
              <h2 className="text-4xl font-bold text-center mb-6">
                Let's Get Started
              </h2>
              <button 
                onClick={() => document.getElementById('signup-form').scrollIntoView({ behavior: 'smooth' })}
                className="bg-purple-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-purple-700 transition-all transform hover:scale-105"
              >
                Get Started
              </button>
        </div>
          </Carousel>
      </div>

        {/* Right Side - Signup Form */}
        <div className="w-1/2 bg-black rounded-3xl m-4 p-8 flex flex-col justify-center">
          <div id="signup-form" className="w-full max-w-md mx-auto">
          <h2 className="text-3xl font-bold text-white text-center">Create an account</h2>
          <p className="text-center text-zinc-400 text-sm mt-2">
            Already have an account?{" "}
            <Link to="/login" className="text-purple-400 hover:underline">
              Log in
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && <div className="text-green-500 text-sm">{success}</div>}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-white mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                autoComplete="username"
                value={formData.username}
                onChange={handleChange}
                  placeholder="Enter your username"
                  className="w-full px-3 py-2 bg-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border border-zinc-700"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                  placeholder="Enter your email address"
                  className="w-full px-3 py-2 bg-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border border-zinc-700"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                  placeholder="Create a strong password"
                  className="w-full px-3 py-2 bg-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border border-zinc-700"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                  placeholder="Re-enter your password"
                  className="w-full px-3 py-2 bg-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border border-zinc-700"
                required
              />
            </div>

              {/* Role Selection */}
              <div className="flex space-x-4 bg-zinc-800 p-3 rounded-lg border border-zinc-700">
              <label className="text-sm text-white flex items-center space-x-2">
                <input
                  type="radio"
                  name="role"
                  value="mentee"
                  checked={formData.role === "mentee"}
                  onChange={handleChange}
                  className="text-purple-600"
                />
                <span>Mentee</span>
              </label>
              <label className="text-sm text-white flex items-center space-x-2">
                <input
                  type="radio"
                  name="role"
                  value="mentor"
                  checked={formData.role === "mentor"}
                  onChange={handleChange}
                  className="text-purple-600"
                />
                <span>Mentor</span>
              </label>
            </div>

              <div className="flex items-center text-sm text-zinc-400 bg-zinc-800 p-3 rounded-lg border border-zinc-700">
              <input
                type="checkbox"
                name="agreedToTerms"
                checked={formData.agreedToTerms}
                onChange={handleChange}
                className="w-4 h-4 text-purple-600 bg-zinc-800 border-zinc-700 rounded focus:ring-purple-500 cursor-pointer"
              />
              <label htmlFor="terms" className="ml-2 cursor-pointer">
                I agree to the{" "}
                <a href="#" className="text-purple-400 hover:underline">
                  Terms & Conditions
                </a>
              </label>
            </div>

            <button
              type="submit"
                className="w-full px-4 py-3 font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition"
            >
              Create account
            </button>

            <div className="flex items-center justify-between text-zinc-500 mt-4">
              <hr className="flex-grow border-zinc-700" />
              <span className="mx-2 text-sm">Or register with</span>
              <hr className="flex-grow border-zinc-700" />
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google sign-up failed")}
                theme="filled_black"
                text="signup_with"
              />
            </div>
          </form>
          </div>
        </div>
      </div>

      {/* Getting Started Steps Section */}
      <div className="w-full bg-zinc-900 mt-8 p-12 rounded-t-3xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-row gap-12">
            {/* Left side - Illustration */}
            <div className="w-1/2 bg-[#3B364C] rounded-3xl p-8 flex items-center justify-center">
              <img 
                src="/getting-started-illustration.svg" 
                alt="Getting Started" 
                className="w-full h-auto max-w-lg"
              />
            </div>

            {/* Right side - Steps */}
            <div className="w-1/2 flex flex-col justify-center space-y-8">
              <h1 className="text-4xl font-bold text-white">Getting Started is Easy</h1>
              
              {/* Step 1 */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Create your profile</h3>
                  <p className="text-gray-400 mt-1">Sign up and build your profile highlighting your skills, interests, and learning goals.</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">2</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Connect with Mentors</h3>
                  <p className="text-gray-400 mt-1">Browse mentors by category, read reviews, and request sessions with those who match your needs.</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">3</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Learn and Grow</h3>
                  <p className="text-gray-400 mt-1">Schedule sessions, participate in discussions, and track your progress as you develop new skills.</p>
                </div>
              </div>

              <button
                onClick={() => document.getElementById('signup-form').scrollIntoView({ behavior: 'smooth' })}
                className="mt-8 px-8 py-3 bg-purple-600 text-white rounded-full text-lg font-semibold hover:bg-purple-700 transition-all transform hover:scale-105 w-fit"
              >
                Get Started Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
