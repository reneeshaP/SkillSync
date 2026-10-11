import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/auth.service";
import { useTheme } from "../contexts/ThemeContext";
import AuthLayout from "../components/auth/AuthLayout";
import { Card } from "../components/ui/Card";
import { FormField } from "../components/ui/FormField";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { toast } from "../components/ui/Toast";

const PANEL_POINTS = [
  "Matched on skills, not keywords",
  "Real-time chat and scheduled sessions",
  "Free while in beta",
];

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { setUser } = useAuth();
  const { resolvedTheme } = useTheme();
  const navigate = useNavigate();

  const emailError = touched.email && !email.trim() ? "Email is required." : "";
  const passwordError = touched.password && !password ? "Password is required." : "";

  const handlesubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!email.trim() || !password) return;

    setSubmitting(true);
    try {
      const data = await authService.login(email, password);
      localStorage.setItem("token", data.token);
      setUser(data.user);
      navigate("/feed");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to login");
      console.error("Login error:", error);
      setSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const data = await authService.googleAuth(credentialResponse.credential);
      localStorage.setItem("token", data.token);
      setUser(data.user);
      navigate(data.user.roleConfirmed ? "/feed" : "/choose-role");
    } catch (error) {
      toast.error(error.message || "Failed to sign in with Google");
    }
  };

  return (
    <AuthLayout
      panelTitle="Get matched with the mentor who actually fits you."
      panelSubtitle="SkillSync pairs mentors and mentees by skills and goals, then gets you straight to scheduled sessions and real-time chat."
      panelPoints={PANEL_POINTS}
    >
      <Card raised className="w-full max-w-md p-8 space-y-6">
        <h2 className="text-h3 font-display font-bold text-text text-center">Login to your account</h2>
        <p className="text-center text-text-muted text-body-sm">
          Don't have an account?{" "}
          <Link to="/signup" className="text-brand hover:underline">
            Sign up
          </Link>
        </p>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => toast.error("Google sign-in failed")}
            theme={resolvedTheme === "light" ? "outline" : "filled_black"}
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-caption text-text-subtle">OR</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={handlesubmit} className="space-y-4" noValidate>
          <FormField label="Email" htmlFor="email" required error={emailError}>
            <Input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
              aria-describedby={emailError ? "email-error" : undefined}
            />
          </FormField>

          <FormField label="Password" htmlFor="password" required error={passwordError}>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
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
          </FormField>

          <Button type="submit" variant="primary" className="w-full" loading={submitting}>
            Login
          </Button>
        </form>
      </Card>
    </AuthLayout>
  );
};

export default Login;
