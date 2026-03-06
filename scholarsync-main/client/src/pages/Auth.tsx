import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isSignup) await signUp(email, password);
      else await signIn(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-10 w-full max-w-md border border-white/10"
      >
        <h1 className="text-2xl font-bold text-white mb-2">
          {isSignup ? "Create your account" : "Welcome back"}
        </h1>
        <p className="text-white/40 text-sm mb-6">
          {isSignup
            ? "Start building your private study library."
            : "Sign in to your ScholarSync workspace."}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-white/40">Email</label>
            <input
              className="w-full mt-1 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white text-sm outline-none focus:border-violet-500/40"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs text-white/40">Password</label>
            <input
              className="w-full mt-1 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white text-sm outline-none focus:border-violet-500/40"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold py-3 hover:from-violet-500 hover:to-indigo-500 transition-all disabled:opacity-50"
          >
            {loading ? "Please wait..." : isSignup ? "Create account" : "Sign in"}
          </button>
        </form>
        <button
          onClick={() => setIsSignup((v) => !v)}
          className="mt-4 text-xs text-white/40 hover:text-white/60"
        >
          {isSignup ? "Already have an account? Sign in" : "New here? Create an account"}
        </button>
      </motion.div>
    </div>
  );
}
