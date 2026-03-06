import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, CheckCircle2, XCircle, Loader2, Trash2 } from "lucide-react";
import type { Document } from "../types";

interface FileUploadProps {
  documents: Document[];
  uploading: Map<string, boolean>;
  errors: Map<string, string>;
  onUpload: (files: File[]) => void;
  onDelete: (id: string) => void;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onPreview: (id: string, page?: number) => void;
}

export default function FileUpload({
  documents,
  uploading,
  errors,
  onUpload,
  onDelete,
  selectedIds,
  onToggleSelect,
  onPreview,
}: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => { onUpload(acceptedFiles); }, [onUpload]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { "application/pdf": [".pdf"] }, maxSize: 50 * 1024 * 1024,
  });

  const statusIcon = (status: Document["status"]) => {
    switch (status) {
      case "processing": return <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />;
      case "ready": return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case "error": return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  return (
    <div className="space-y-4">
      <div {...getRootProps()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] ${
          isDragActive ? "border-violet-400/60 bg-violet-500/10" : "border-white/10 hover:border-white/20 bg-white/[0.02]"}`}>
        <input {...getInputProps()} />
        <motion.div animate={isDragActive ? { y: -4, scale: 1.1 } : { y: 0, scale: 1 }}>
          <Upload className={`w-10 h-10 mx-auto mb-3 ${isDragActive ? "text-violet-400" : "text-white/20"}`} />
        </motion.div>
        <p className="text-sm text-white/50 font-medium">
          {isDragActive ? <span className="text-violet-300">Drop PDFs here...</span>
            : <>Drag & drop PDFs here, or <span className="text-violet-400 underline">browse</span></>}
        </p>
        <p className="text-xs text-white/25 mt-1">PDF files up to 50MB</p>
      </div>

      <AnimatePresence>
        {Array.from(uploading.entries()).map(([name, isUp]) => isUp ? (
          <motion.div key={`up-${name}`} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} className="glass-card rounded-xl px-4 py-3 flex items-center gap-3">
            <Loader2 className="w-4 h-4 text-violet-400 animate-spin flex-shrink-0" />
            <span className="text-sm text-white/60 truncate flex-1">{name}</span>
            <span className="text-xs text-violet-400/60 animate-pulse">Processing...</span>
          </motion.div>
        ) : null)}
      </AnimatePresence>

      <AnimatePresence>
        {Array.from(errors.entries()).map(([name, error]) => (
          <motion.div key={`err-${name}`} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} className="rounded-xl px-4 py-3 bg-red-500/10 border border-red-500/20 flex items-start gap-3">
            <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div><p className="text-sm text-red-300 font-medium">{name}</p><p className="text-xs text-red-400/60">{error}</p></div>
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        <AnimatePresence>
          {documents.map((doc) => (
            <motion.div key={doc.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="glass-card glass-card-hover rounded-xl px-4 py-3 flex items-center gap-3 group transition-all">
              <input
                type="checkbox"
                checked={selectedIds.includes(doc.id)}
                onChange={() => onToggleSelect(doc.id)}
                className="accent-violet-500"
                disabled={doc.status !== "ready"}
              />
              <FileText className="w-4 h-4 text-violet-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/80 font-medium truncate">{doc.original_name}</p>
                <p className="text-[11px] text-white/30">
                  {doc.total_pages > 0 && `${doc.total_pages} pages · `}
                  {doc.total_chunks > 0 && `${doc.total_chunks} chunks`}
                  {doc.error_message && <span className="text-red-400/60"> · {doc.error_message}</span>}
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onPreview(doc.id, 1); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded-lg bg-white/5 text-[10px] text-white/50 hover:text-white/80"
              >
                Preview
              </button>
              {statusIcon(doc.status)}
              <button onClick={(e) => { e.stopPropagation(); onDelete(doc.id); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-500/10">
                <Trash2 className="w-3.5 h-3.5 text-red-400/60" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
