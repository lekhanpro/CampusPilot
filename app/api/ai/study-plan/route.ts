import { NextResponse } from "next/server";
import { aiPlanInputSchema } from "@/lib/validation";
import { generateGroqJson } from "@/services/groq";
import { aiStudyPlanOutputSchema } from "@/types/ai";

export async function POST(request: Request) {
  try {
    const body = aiPlanInputSchema.parse(await request.json());
    const prompt = `Generate a ${body.mode.replace("_", " ")} for a student.
Available study hours today: ${body.availableHours}
Weak subjects: ${body.weakSubjects.join(", ") || "none stated"}
Planner notes: ${body.notes || "none"}
Preferences: ${body.snapshot.preferences ? JSON.stringify(body.snapshot.preferences) : "none"}
Subjects: ${JSON.stringify(body.snapshot.subjects)}
Assignments: ${JSON.stringify(body.snapshot.assignments)}
Exams: ${JSON.stringify(body.snapshot.exams)}
Attendance concerns: ${JSON.stringify(body.snapshot.attendanceRecords)}
Timetable: ${JSON.stringify(body.snapshot.classSessions)}
Return concise, actionable steps with realistic time blocks and reasons.`;

    const result = await generateGroqJson(prompt, "CampusPilotStudyPlanOutput");
    const parsed = aiStudyPlanOutputSchema.parse(result);
    return NextResponse.json(parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Study plan generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
