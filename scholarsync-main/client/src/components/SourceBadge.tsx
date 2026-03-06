import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import type { Source } from "../types";

interface SourceBadgeProps {
  source: Source;
  index: number;
  onOpen?: (filename: string, page: number) => void;
}

export default function SourceBadge({ source, index, onOpen }: SourceBadgeProps) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9, y: 5 }} animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.08 }} className="group relative">
      <button
        onClick={() => onOpen?.(source.filename, source.page_number)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 hover:bg-violet-500/20 hover:border-violet-400/30 transition-all cursor-pointer"
      >
        <FileText className="w-3.5 h-3.5 text-violet-400" />
        <span className="text-xs text-violet-300 font-medium truncate max-w-[160px]">{source.filename}</span>
        <span className="text-[10px] text-violet-400/60 font-mono">p.{source.page_number}</span>
      </button>
      <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-50 w-72">
        <div className="glass-card rounded-lg p-3 shadow-2xl">
          <p className="text-xs text-white/60 leading-relaxed">{source.excerpt}</p>
          <span className="text-[10px] text-violet-400/60">Relevance: {Math.round(source.similarity * 100)}%</span>
        </div>
      </div>
    </motion.div>
  );
}
