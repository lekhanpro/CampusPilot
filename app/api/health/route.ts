import { NextResponse } from "next/server";
import { hasFirebaseAdminEnv, hasFirebaseClientEnv, hasGroqEnv } from "@/lib/env";

export async function GET() {
  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    services: {
      groq: hasGroqEnv(),
      firebase_client: hasFirebaseClientEnv(),
      firebase_admin: hasFirebaseAdminEnv()
    }
  });
}