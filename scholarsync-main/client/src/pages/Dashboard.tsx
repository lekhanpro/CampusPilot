import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Trash2, ChevronLeft, ChevronRight, Sparkles, BookOpen } from "lucide-react";
import { useChat } from "../hooks/useChat";
import { useFileUpload } from "../hooks/useFileUpload";
import FileUpload from "../components/FileUpload";
import ChatMessage from "../components/ChatMessage";
import LoadingDots from "../components/LoadingDots";
import DocumentPreview from "../components/DocumentPreview";
import { capture } from "../lib/posthog";

export default function Dashboard() {
  const { messages, isLoading, send, clearChat } = useChat();
  const { documents, uploading, errors, upload, removeDocument, fetchDocuments, getDocumentUrl } = useFileUpload();
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewPage, setPreviewPage] = useState<number>(1);
  const [filter, setFilter] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isLoading]);
  useEffect(() => {
    if (selectedIds.length === 0) {
      setSelectedIds(documents.filter((d) => d.status === "ready").map((d) => d.id));
    }
  }, [documents, selectedIds.length]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    const readySelected = selectedIds.filter((id) =>
      documents.find((d) => d.id === id && d.status === "ready")
    );
    send(input.trim(), readySelected.length > 0 ? readySelected : undefined);
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 150) + "px";
  };

  const readyCount = documents.filter((d) => d.status === "ready").length;
  const filteredDocuments = documents.filter((d) =>
    d.original_name.toLowerCase().includes(filter.toLowerCase())
  );

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handlePreview = async (id: string, page = 1) => {
    const url = await getDocumentUrl(id);
    setPreviewUrl(url);
    setPreviewPage(page);
    capture("document_preview", { document_id: id, page });
  };

  const handleOpenSource = (filename: string, page: number) => {
    const doc = documents.find((d) => d.original_name === filename || d.filename === filename);
    if (doc) {
      handlePreview(doc.id, page);
    }
  };

  return (
    <div className="h-screen flex pt-[76px]">
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside initial={{ width: 0, opacity: 0 }} animate={{ width: 360, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }}
            className="h-full border-r border-white/5 overflow-hidden flex-shrink-0">
            <div className="w-[360px] h-full flex flex-col p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-violet-400" /> Documents
                  {readyCount > 0 && <span className="text-xs font-mono text-violet-400/60 bg-violet-500/10 px-2 py-0.5 rounded-lg">{readyCount}</span>}
                </h2>
                <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                  <ChevronLeft className="w-4 h-4 text-white/30" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="mb-3">
                  <input
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white/70 outline-none focus:border-violet-500/30"
                    placeholder="Filter documents..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  />
                </div>
                <FileUpload
                  documents={filteredDocuments}
                  uploading={uploading}
                  errors={errors}
                  onUpload={upload}
                  onDelete={removeDocument}
                  selectedIds={selectedIds}
                  onToggleSelect={handleToggleSelect}
                  onPreview={handlePreview}
                />
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-3 px-6 py-3 border-b border-white/5">
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
              <ChevronRight className="w-4 h-4 text-white/40" />
            </button>
          )}
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white/30 font-mono">Groq LLaMA 3.3 70B</span>
          </div>
          {messages.length > 0 && (
            <button onClick={clearChat} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-white/30 hover:text-red-400/60">
              <Trash2 className="w-3.5 h-3.5" /><span className="text-xs">Clear</span>
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
                <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/10 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-violet-400/50" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Ready to study</h3>
                <p className="text-white/30 leading-relaxed mb-6">
                  {documents.length === 0 ? "Upload your PDFs in the sidebar, then ask any question."
                    : readyCount > 0 ? `${readyCount} document${readyCount > 1 ? "s" : ""} indexed. Ask me anything!`
                    : "Documents are still processing..."}
                </p>
                {readyCount > 0 && (
                  <div className="flex flex-wrap justify-center gap-2">
                    {["Summarize my notes", "What are the key concepts?", "Compare topics across files"].map((s) => (
                      <button key={s} onClick={() => { setInput(s); inputRef.current?.focus(); }}
                        className="px-4 py-2 rounded-xl glass-card glass-card-hover text-sm text-white/40 hover:text-white/70 transition-colors">{s}</button>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} onOpenSource={handleOpenSource} />
              ))}
              {isLoading && (
                <div className="flex gap-4">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="glass-card rounded-2xl px-5 py-4"><LoadingDots /></div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        <div className="px-6 pb-6">
          <div className="max-w-3xl mx-auto">
            <div className="glass-card rounded-2xl p-3 flex items-end gap-3 focus-within:border-violet-500/30 transition-colors">
              <textarea ref={inputRef} value={input} onChange={handleTextareaInput} onKeyDown={handleKeyDown}
                placeholder={readyCount > 0 ? "Ask about your documents..." : "Upload PDFs first, then ask questions..."}
                rows={1} className="flex-1 bg-transparent text-white text-sm placeholder-white/20 resize-none outline-none py-2 px-2 max-h-[150px]"
                disabled={isLoading} />
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/20">
                <Send className="w-4 h-4" />
              </motion.button>
            </div>
            <p className="text-center text-[11px] text-white/15 mt-2">ScholarSync can make mistakes. Verify important information.</p>
          </div>
        </div>
      </main>

      {previewUrl && (
        <DocumentPreview
          url={previewUrl}
          initialPage={previewPage}
          onClose={() => setPreviewUrl(null)}
        />
      )}
    </div>
  );
}
