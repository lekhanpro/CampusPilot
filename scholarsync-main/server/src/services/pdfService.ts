import fs from "fs/promises";
import path from "path";
import { createCanvas } from "canvas";
import Tesseract from "tesseract.js";

async function getPdfParse() {
  const module = await import("pdf-parse");
  return module.default || module;
}

async function getPdfJs() {
  const module = await import("pdfjs-dist/legacy/build/pdf.mjs");
  return module;
}

export interface ParsedPDF {
  text: string;
  pages: PageContent[];
  totalPages: number;
  metadata: {
    title?: string;
    author?: string;
    extractionMethod: "text" | "ocr";
  };
}

export interface PageContent {
  pageNumber: number;
  text: string;
  extractionMethod?: "text" | "ocr";
}

const OCR_ENABLED = (process.env.OCR_ENABLED || "true").toLowerCase() !== "false";
const OCR_LANG = process.env.OCR_LANG || "eng";

async function extractTextWithOCR(buffer: Buffer): Promise<ParsedPDF> {
  const pdfjs = await getPdfJs();
  const loadingTask = pdfjs.getDocument({ data: buffer });
  const pdf = await loadingTask.promise;

  const pages: PageContent[] = [];
  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.6 });
    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext("2d");

    await page.render({ canvasContext: context as any, viewport }).promise;
    const image = canvas.toBuffer("image/png");
    const result = await Tesseract.recognize(image, OCR_LANG);
    const text = normalizeExtractedText(result.data.text || "");
    if (text.length > 0) {
      pages.push({ pageNumber: i, text, extractionMethod: "ocr" });
      fullText += `\n${text}`;
    }
  }

  return {
    text: fullText.trim(),
    pages,
    totalPages: pdf.numPages,
    metadata: {
      extractionMethod: "ocr",
    },
  };
}

async function parsePDFFromBuffer(fileBuffer: Buffer): Promise<ParsedPDF> {
  if (fileBuffer.length === 0) {
    throw new Error("PDF file is empty");
  }

  const pdfParse = await getPdfParse();

  try {
    const data = await pdfParse(fileBuffer, { max: 500 });
    const normalizedDocumentText = normalizeExtractedText(data.text || "");

    if (!normalizedDocumentText) {
      if (OCR_ENABLED) {
        return extractTextWithOCR(fileBuffer);
      }
      throw new Error("PDF appears to be scanned/image-based - no extractable text found");
    }

    const rawPages = (data.text || "").split(/\f/);
    const pages: PageContent[] = rawPages
      .map((pageText: string, index: number) => ({
        pageNumber: index + 1,
        text: normalizeExtractedText(pageText),
        extractionMethod: "text" as const,
      }))
      .filter((page: PageContent) => page.text.length > 20);

    if (pages.length === 0) {
      pages.push({
        pageNumber: 1,
        text: normalizedDocumentText,
        extractionMethod: "text",
      });
    }

    return {
      text: normalizedDocumentText,
      pages,
      totalPages: data.numpages || pages.length,
      metadata: {
        title: data.info?.Title || undefined,
        author: data.info?.Author || undefined,
        extractionMethod: "text",
      },
    };
  } catch (error: any) {
    if (error.message.includes("no extractable text")) {
      throw error;
    }
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
}

function normalizeExtractedText(text: string): string {
  return text
    .replace(/\r/g, "\n")
    .replace(/[\t\f\v]+/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

export async function parsePDF(filePath: string): Promise<ParsedPDF> {
  const absolutePath = path.resolve(filePath);

  try {
    await fs.access(absolutePath);
  } catch {
    throw new Error(`PDF file not found: ${absolutePath}`);
  }

  const fileBuffer = await fs.readFile(absolutePath);
  return parsePDFFromBuffer(fileBuffer);
}

export async function parsePDFBuffer(buffer: Buffer): Promise<ParsedPDF> {
  return parsePDFFromBuffer(buffer);
}
