import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { apiClient, setAccessToken } from "@/api/client";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem("lms_login_error");
    } catch {
      return null;
    }
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await apiClient.post("/auth/login", { email, password });
      const accessToken = res.data?.accessToken as string | undefined;
      if (accessToken) setAccessToken(accessToken);
      const userRole = res.data?.user?.role as "learner" | "instructor" | undefined;
      if (userRole) window.localStorage.setItem("lms_user_role", userRole);
      navigate("/courses");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-24 pb-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-6 rounded-2xl bg-card border border-border shadow-card"
      >
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Login</h1>
        <p className="text-sm text-muted-foreground mb-6">Access your learning dashboard.</p>

        {error ? (
          <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-destructive text-sm">
            {error}
          </div>
        ) : null}

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl gradient-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

