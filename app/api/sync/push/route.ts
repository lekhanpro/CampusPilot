import { NextResponse } from "next/server";
import { z } from "zod";
import { syncQueueItemSchema } from "@/lib/validation";
import { nowIso } from "@/lib/time";
import { getFirebaseAdmin } from "@/services/firebase-admin";

const payloadSchema = z.object({
  items: z.array(syncQueueItemSchema)
});

const collectionMap = {
  subjects: "subjects",
  classSessions: "classSessions",
  assignments: "assignments",
  attendanceRecords: "attendanceRecords",
  notes: "notes",
  pomodoroSessions: "pomodoroSessions",
  exams: "exams",
  studyPlans: "studyPlans",
  userPreferences: "userPreferences"
} as const;

async function getAuthenticatedUser(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.replace("Bearer ", "").trim();
  const firebase = getFirebaseAdmin();
  if (!firebase || !token) return { firebase: null, user: null };

  try {
    const user = await firebase.auth.verifyIdToken(token);
    return { firebase, user };
  } catch {
    return { firebase: null, user: null };
  }
}

export async function POST(request: Request) {
  try {
    const { firebase, user } = await getAuthenticatedUser(request);
    if (!firebase || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = payloadSchema.parse(await request.json());

    for (const [entity, collection] of Object.entries(collectionMap)) {
      const rows = body.items
        .filter((item) => item.entity === entity)
        .map((item) => ({
          ...item.payload,
          user_id: user.uid,
          updated_at: typeof item.payload.updated_at === "string" ? item.payload.updated_at : nowIso(),
          deleted_at:
            item.operation === "delete"
              ? typeof item.payload.deleted_at === "string"
                ? item.payload.deleted_at
                : nowIso()
              : item.payload.deleted_at ?? null
        }));

      if (!rows.length) continue;

      for (const row of rows) {
        const rowRecord = row as Record<string, unknown>;
        const docId = typeof rowRecord.id === "string" ? rowRecord.id : null;
        if (!docId) continue;
        await firebase.db.collection(collection).doc(docId).set(rowRecord, { merge: true });
      }
    }

    return NextResponse.json({ ok: true, pushed: body.items.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync push failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}