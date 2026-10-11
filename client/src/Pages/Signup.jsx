import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiEye, FiEyeOff, FiUser, FiUsers } from "react-icons/fi";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/auth.service";
import { useTheme } from "../contexts/ThemeContext";
import { API_URL } from "../lib/env";
import AuthLayout from "../components/auth/AuthLayout";
import SignupCarousel from "../components/auth/SignupCarousel";
import PasswordStrengthMeter from "../components/auth/PasswordStrengthMeter";
import { Card } from "../components/ui/Card";
import { FormField } from "../components/ui/FormField";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Button } from "../components/ui/Button";
import { Checkbox } from "../components/ui/Checkbox";
import { RadioGroup, RadioGroupItem } from "../components/ui/RadioGroup";
import { toast } from "../components/ui/Toast";

const Signup = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const { resolvedTheme } = useTheme();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreedToTerms: false,
    role: "mentee",
  });

  const [touched, setTouched] = useState({});
  const [termsTouched, setTermsTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const markTouched = (field) => setTouched((prev) => ({ ...prev, [field]: true }));

  const usernameError = touched.username && !formData.username ? "Username is required." : "";
  const emailError = touched.email && !formData.email ? "Email is required." : "";
  const passwordError = touched.password && !formData.password ? "Password is required." : "";
  const confirmPasswordError = touched.confirmPassword
    ? !formData.confirmPassword
      ? "Confirm your password."
      : formData.password !== formData.confirmPassword
      ? "Passwords do not match."
      : ""
    : "";
  const termsError = termsTouched && !formData.agreedToTerms ? "You must agree to the terms." : "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ username: true, email: true, password: true, confirmPassword: true });
    setTermsTouched(true);

    const { username, email, password, confirmPassword, agreedToTerms } = formData;
    if (!username || !email || !password || !confirmPassword || password !== confirmPassword || !agreedToTerms) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post(`${API_URL}/auth/signup`, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      toast.success(res.data.message);
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed.");
      setSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const data = await authService.googleAuth(credentialResponse.credential);
      localStorage.setItem("token", data.token);
      setUser(data.user);
      navigate(data.user.roleConfirmed ? "/feed" : "/choose-role");
    } catch (err) {
      toast.error(err.message || "Failed to sign up with Google");
    }
  };

  const scrollToForm = () =>
    document.getElementById("signup-form")?.scrollIntoView({ behavior: "smooth" });

  return (
    <AuthLayout panel={<SignupCarousel onGetStarted={scrollToForm} />}>
      <Card raised id="signup-form" className="w-full max-w-md p-8 space-y-6">
        <h2 className="text-h3 font-display font-bold text-text text-center">Create an account</h2>
        <p className="text-center text-text-muted text-body-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-brand hover:underline">
            Log in
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <FormField label="Username" htmlFor="username" required error={usernameError}>
            <Input
              type="text"
              id="username"
              name="username"
              autoComplete="username"
              value={formData.username}
              onChange={handleChange}
              onBlur={() => markTouched("username")}
              placeholder="Enter your username"
              aria-describedby={usernameError ? "username-error" : undefined}
            />
          </FormField>

          <FormField label="Email" htmlFor="email" required error={emailError}>
            <Input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={() => markTouched("email")}
              placeholder="Enter your email address"
              aria-describedby={emailError ? "email-error" : undefined}
            />
          </FormField>

          <FormField label="Password" htmlFor="password" required error={passwordError}>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                onBlur={() => markTouched("password")}
                placeholder="Create a strong password"
                className="pr-10"
                aria-describedby={passwordError ? "password-error" : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            <PasswordStrengthMeter password={formData.password} />
          </FormField>

          <FormField label="Confirm Password" htmlFor="confirmPassword" required error={confirmPasswordError}>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={() => markTouched("confirmPassword")}
                placeholder="Re-enter your password"
                className="pr-10"
                aria-describedby={confirmPasswordError ? "confirmPassword-error" : undefined}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </FormField>

          <div>
            <Label>I want to join as</Label>
            <RadioGroup
              value={formData.role}
              onValueChange={(role) => setFormData((prev) => ({ ...prev, role }))}
              className="grid grid-cols-2 gap-3"
            >
              <RadioGroupItem value="mentee" className="p-4">
                <div className="flex items-center gap-3">
                  <FiUser className="text-brand shrink-0" size={20} />
                  <span className="font-medium text-text text-body-sm">Mentee</span>
                </div>
              </RadioGroupItem>
              <RadioGroupItem value="mentor" className="p-4">
                <div className="flex items-center gap-3">
                  <FiUsers className="text-brand shrink-0" size={20} />
                  <span className="font-medium text-text text-body-sm">Mentor</span>
                </div>
              </RadioGroupItem>
            </RadioGroup>
          </div>

          <div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                checked={formData.agreedToTerms}
                onCheckedChange={(checked) => {
                  setFormData((prev) => ({ ...prev, agreedToTerms: checked === true }));
                  setTermsTouched(true);
                }}
                className="mt-0.5"
                aria-describedby={termsError ? "terms-error" : undefined}
              />
              <Label htmlFor="terms" className="mb-0 font-normal cursor-pointer">
                I agree to the{" "}
                <a href="#" className="text-brand hover:underline">
                  Terms &amp; Conditions
                </a>
              </Label>
            </div>
            {termsError && (
              <p id="terms-error" role="alert" className="mt-1 text-caption text-danger">
                {termsError}
              </p>
            )}
          </div>

          <Button type="submit" variant="primary" className="w-full" loading={submitting}>
            Create account
          </Button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-caption text-text-subtle">Or register with</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google sign-up failed")}
              theme={resolvedTheme === "light" ? "outline" : "filled_black"}
              text="signup_with"
            />
          </div>
        </form>
      </Card>
    </AuthLayout>
  );
};

export default Signup;
