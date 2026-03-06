import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlassLayoutProps { children: ReactNode; }

export default function GlassLayout({ children }: GlassLayoutProps) {
  return (
    <div className="relative min-h-screen bg-[#030014] overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          animate={{ x: [0, 100, -50, 0], y: [0, -80, 60, 0], scale: [1, 1.2, 0.9, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-600/20 blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -80, 40, 0], y: [0, 100, -60, 0], scale: [1, 0.8, 1.1, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[30%] right-[-15%] w-[500px] h-[500px] rounded-full bg-indigo-500/15 blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, 60, -30, 0], y: [0, -40, 80, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10%] left-[30%] w-[400px] h-[400px] rounded-full bg-violet-500/10 blur-[80px]"
        />
      </div>
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}