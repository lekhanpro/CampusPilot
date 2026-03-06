import { motion } from "framer-motion";
import { GraduationCap, Github, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";
  const { user, signOut } = useAuth();
  return (
    <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="glass-card rounded-2xl px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-shadow">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">
              Scholar<span className="text-violet-400">Sync</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            {!isDashboard && (
              <Link to="/dashboard"
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40">
                <Sparkles className="w-4 h-4" /> Launch App
              </Link>
            )}
            {user ? (
              <button
                onClick={() => signOut()}
                className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                Sign out
              </button>
            ) : (
              <Link
                to="/auth"
                className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                Sign in
              </Link>
            )}
            <a href="https://github.com/lekhanpro/scholarsync" target="_blank" rel="noopener noreferrer"
              className="p-2.5 rounded-xl hover:bg-white/5 transition-colors">
              <Github className="w-5 h-5 text-white/40 hover:text-white/70" />
            </a>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
