import { motion } from "framer-motion";

export default function LoadingDots() {
  return (
    <div className="flex items-center gap-1.5 py-2">
      {[0, 1, 2].map((i) => (
        <motion.div key={i}
          animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
          className="w-2 h-2 rounded-full bg-violet-400"
        />
      ))}
      <span className="ml-2 text-sm text-white/40 font-light">Thinking...</span>
    </div>
  );
}