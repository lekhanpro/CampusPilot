import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Bot, User } from "lucide-react";
import SourceBadge from "./SourceBadge";
import type { ChatMessage as ChatMessageType } from "../types";

interface ChatMessageProps {
  message: ChatMessageType;
  onOpenSource?: (filename: string, page: number) => void;
}

export default function ChatMessage({ message, onOpenSource }: ChatMessageProps) {
  const isUser = message.role === "user";
  return (
    <motion.div initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <Bot className="w-5 h-5 text-white" />
        </div>
      )}
      <div className={`max-w-[75%] ${isUser
        ? "bg-gradient-to-br from-violet-600/80 to-indigo-600/80 border border-violet-500/30"
        : "glass-card"} rounded-2xl px-5 py-4`}>
        {isUser ? (
          <p className="text-white text-sm leading-relaxed">{message.content}</p>
        ) : (
          <div className="chat-markdown text-sm text-gray-200 leading-relaxed">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-4 pt-3 border-t border-white/5">
            <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-2">Sources</p>
            <div className="flex flex-wrap gap-2">
              {message.sources.map((source, i) => (
                <SourceBadge key={i} source={source} index={i} onOpen={onOpenSource} />
              ))}
            </div>
          </div>
        )}
        {message.model && (
          <div className="mt-2 flex justify-end">
            <span className="text-[10px] text-white/20 font-mono">{message.model}</span>
          </div>
        )}
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
    </motion.div>
  );
}
