import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface DocumentPreviewProps {
  url: string;
  initialPage?: number;
  onClose: () => void;
}

export default function DocumentPreview({ url, initialPage = 1, onClose }: DocumentPreviewProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [page, setPage] = useState<number>(initialPage);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-[#0c0d12] rounded-3xl border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <button
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="w-4 h-4 text-white/60" />
            </button>
            <div className="text-xs text-white/40">
              Page
              <input
                className="ml-2 w-14 bg-white/5 rounded-lg px-2 py-1 text-white/80 text-xs outline-none border border-white/10"
                value={page}
                onChange={(e) => setPage(Number(e.target.value) || 1)}
              />
              <span className="ml-2">/ {numPages || "-"}</span>
            </div>
            <button
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10"
              onClick={() => setPage((p) => (numPages ? Math.min(numPages, p + 1) : p + 1))}
            >
              <ChevronRight className="w-4 h-4 text-white/60" />
            </button>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10">
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>
        <div className="p-6 overflow-auto max-h-[80vh]">
          <Document
            file={url}
            onLoadSuccess={(doc) => {
              setNumPages(doc.numPages);
              if (page > doc.numPages) setPage(doc.numPages);
            }}
            loading={<p className="text-white/40 text-sm">Loading document...</p>}
          >
            <Page pageNumber={page} width={900} />
          </Document>
        </div>
      </div>
    </div>
  );
}
