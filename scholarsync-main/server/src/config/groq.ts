import Groq from "groq-sdk";
import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: "../.env" });
}

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  throw new Error("Missing GROQ_API_KEY in environment variables");
}

export const groq = new Groq({ apiKey });

export const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
export const GROQ_TEMPERATURE = parseFloat(process.env.GROQ_TEMPERATURE || "0.3");
export const GROQ_MAX_TOKENS = parseInt(process.env.GROQ_MAX_TOKENS || "4096", 10);
