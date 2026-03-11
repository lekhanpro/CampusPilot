import { z } from "zod";

export const aiTaskSchema = z.object({
  title: z.string(),
  reason: z.string(),
  duration_minutes: z.number().min(5),
  subject: z.string().optional(),
  due_hint: z.string().optional()
});

export const aiTimeBlockSchema = z.object({
  start: z.string(),
  end: z.string(),
  focus: z.string(),
  action: z.string(),
  breaks: z.string().optional()
});

export const aiStudyPlanOutputSchema = z.object({
  summary: z.string(),
  priorities: z.array(aiTaskSchema),
  schedule: z.array(aiTimeBlockSchema),
  risks: z.array(z.string()),
  recovery_tips: z.array(z.string())
});

export const aiDailyPlanOutputSchema = z.object({
  headline: z.string(),
  agenda: z.array(aiTimeBlockSchema),
  must_do: z.array(aiTaskSchema),
  stretch: z.array(aiTaskSchema)
});

export type AiStudyPlanOutput = z.infer<typeof aiStudyPlanOutputSchema>;
export type AiDailyPlanOutput = z.infer<typeof aiDailyPlanOutputSchema>;
