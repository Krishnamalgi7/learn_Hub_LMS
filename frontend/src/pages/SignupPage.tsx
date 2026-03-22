import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { apiClient } from "@/api/client";

export default function SignupPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"learner" | "instructor">("learner");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiClient.post("/auth/signup", { name, email, password, role });
      // Do NOT auto-login after signup.
      navigate("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
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
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Create account</h1>
        <p className="text-sm text-muted-foreground mb-6">Sign up to start learning.</p>

        {error ? (
          <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-destructive text-sm">
            {error}
          </div>
        ) : null}

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              required
              className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

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

          <div className="space-y-2 pt-2">
            <label className="text-sm text-muted-foreground">Role</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("learner")}
                className={`w-full py-3.5 rounded-xl border transition-opacity ${
                  role === "learner"
                    ? "gradient-primary text-primary-foreground border-border"
                    : "bg-background text-foreground hover:bg-secondary"
                }`}
              >
                Learner
              </button>
              <button
                type="button"
                onClick={() => setRole("instructor")}
                className={`w-full py-3.5 rounded-xl border transition-opacity ${
                  role === "instructor"
                    ? "gradient-primary text-primary-foreground border-border"
                    : "bg-background text-foreground hover:bg-secondary"
                }`}
              >
                Instructor
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl gradient-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

