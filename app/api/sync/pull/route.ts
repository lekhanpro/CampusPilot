import { NextResponse } from "next/server";
import { z } from "zod";
import { getFirebaseAdmin } from "@/services/firebase-admin";

const requestSchema = z.object({
  since: z.string().nullable().optional()
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

    const body = requestSchema.parse(await request.json());
    const since = body.since ?? null;
    const payload: Record<string, unknown[]> = {};

    for (const [entity, collection] of Object.entries(collectionMap)) {
      let query = firebase.db.collection(collection).where("user_id", "==", user.uid);
      if (since) {
        query = query.where("updated_at", ">", since);
      }

      const snapshot = await query.get();
      payload[entity] = snapshot.docs.map((doc) => doc.data());
    }

    return NextResponse.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync pull failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}