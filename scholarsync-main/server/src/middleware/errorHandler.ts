import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(`[Error] ${err.message}`);

  if (err.message.includes("Only PDF files")) {
    res.status(400).json({ error: err.message });
    return;
  }

  if (err.message.includes("File too large")) {
    res.status(400).json({ error: "File size must be under 50MB" });
    return;
  }

  res.status(500).json({
    error: "Internal server error",
    details: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
}