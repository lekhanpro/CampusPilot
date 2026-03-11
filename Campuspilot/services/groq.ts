import { env, hasGroqEnv } from "@/lib/env";

type GroqResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

function extractJsonBlock(content: string) {
  const firstBrace = content.indexOf("{");
  const lastBrace = content.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("Model did not return JSON.");
  }
  return content.slice(firstBrace, lastBrace + 1);
}

export async function generateGroqJson<T>(prompt: string, schemaName: string): Promise<T> {
  if (!hasGroqEnv()) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.groqApiKey}`
        },
        body: JSON.stringify({
          model: env.groqModel,
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                "You are CampusPilot's study planning engine. Return only strict JSON with practical time-aware planning. No markdown."
            },
            {
              role: "user",
              content: `${prompt}\nReturn JSON matching schema: ${schemaName}`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Groq request failed with ${response.status}`);
      }

      const data = (await response.json()) as GroqResponse;
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("Groq returned an empty response.");
      }

      return JSON.parse(extractJsonBlock(content)) as T;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown Groq error");
    }
  }

  throw lastError ?? new Error("Groq generation failed.");
}
