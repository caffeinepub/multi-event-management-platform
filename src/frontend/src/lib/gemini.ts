const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as
  | string
  | undefined;

const SYSTEM_PROMPT = `You are an expert event planner AI assistant. When given a user's event idea, respond with a comprehensive, well-structured event plan in JSON format with these fields:
{
  "eventTitle": "...",
  "eventType": "...",
  "description": "...",
  "suggestedVenue": "...",
  "venueDetails": "...",
  "suggestedDate": "YYYY-MM-DDTHH:mm",
  "agenda": ["item1", "item2", ...],
  "requiredItems": ["item1", "item2", ...],
  "estimatedCapacity": number,
  "budgetHints": ["hint1", "hint2", ...],
  "tips": ["tip1", "tip2", ...]
}
Always tailor requiredItems to the event type. If a location or city is mentioned, suggest realistic local venue types. Keep suggestions practical and actionable.`;

export interface EventPlan {
  eventTitle: string;
  eventType: string;
  description: string;
  suggestedVenue: string;
  venueDetails: string;
  suggestedDate: string;
  agenda: string[];
  requiredItems: string[];
  estimatedCapacity: number;
  budgetHints: string[];
  tips: string[];
}

export function isGeminiConfigured(): boolean {
  return !!(GEMINI_API_KEY && GEMINI_API_KEY.trim().length > 0);
}

export async function generateEventPlan(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY is not configured");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${SYSTEM_PROMPT}\n\nUser's event idea: ${prompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as { error?: { message?: string } }).error?.message ||
        `Gemini API error: ${response.status}`,
    );
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  if (!text) {
    throw new Error("Empty response from Gemini API");
  }

  return text;
}

export function parseEventPlan(rawText: string): EventPlan | null {
  try {
    // Try to extract JSON from the response (may be wrapped in markdown code blocks)
    const jsonMatch =
      rawText.match(/```(?:json)?\s*([\s\S]*?)```/) ||
      rawText.match(/(\{[\s\S]*\})/);
    const jsonStr = jsonMatch ? jsonMatch[1] : rawText;
    const parsed = JSON.parse(jsonStr) as EventPlan;

    // Validate required fields
    if (!parsed.eventTitle || !parsed.eventType) {
      return null;
    }

    return {
      eventTitle: parsed.eventTitle || "",
      eventType: parsed.eventType || "",
      description: parsed.description || "",
      suggestedVenue: parsed.suggestedVenue || "",
      venueDetails: parsed.venueDetails || "",
      suggestedDate: parsed.suggestedDate || "",
      agenda: Array.isArray(parsed.agenda) ? parsed.agenda : [],
      requiredItems: Array.isArray(parsed.requiredItems)
        ? parsed.requiredItems
        : [],
      estimatedCapacity:
        typeof parsed.estimatedCapacity === "number"
          ? parsed.estimatedCapacity
          : 0,
      budgetHints: Array.isArray(parsed.budgetHints) ? parsed.budgetHints : [],
      tips: Array.isArray(parsed.tips) ? parsed.tips : [],
    };
  } catch {
    return null;
  }
}
