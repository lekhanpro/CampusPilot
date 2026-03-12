import { NextResponse } from "next/server";
import { aiDailyPlanInputSchema } from "@/lib/validation";
import { generateGroqJson } from "@/services/groq";
import { aiDailyPlanOutputSchema } from "@/types/ai";

export async function POST(request: Request) {
  try {
    const body = aiDailyPlanInputSchema.parse(await request.json());
    const prompt = `Generate a day plan for ${body.date}.
Available hours: ${body.availableHours}
Preferences: ${body.snapshot.preferences ? JSON.stringify(body.snapshot.preferences) : "none"}
Subjects: ${JSON.stringify(body.snapshot.subjects)}
Assignments: ${JSON.stringify(body.snapshot.assignments)}
Exams: ${JSON.stringify(body.snapshot.exams)}
Timetable: ${JSON.stringify(body.snapshot.classSessions)}
Ground the agenda in actual classes, deadlines, and exam urgency. Keep it compact and return only JSON.`;

    const result = await generateGroqJson(prompt, "CampusPilotDailyPlanOutput");
    const parsed = aiDailyPlanOutputSchema.parse(result);
    return NextResponse.json(parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Daily plan generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
