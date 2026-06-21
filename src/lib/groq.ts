import "server-only";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export interface GroqMealPlanResponse {
  breakfast: string; // menu id 
  lunch: string;     // menu id
  dinner: string;    // menu id
  reasoning: string;
}

/**
 * Asks the Groq AI to select the best breakfast, lunch, and dinner
 * from the available menus, within the given budget and user constraints.
 */
export async function askGroqForMealPlan(prompt: string): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `Kamu adalah asisten nutrisi cerdas bernama MealIt AI. 
Tugasmu adalah merekomendasikan menu makan pagi, siang, dan malam yang sehat, lezat, dan sesuai budget pengguna.
Kamu HARUS merespons HANYA dengan JSON yang valid, tanpa teks tambahan, tanpa markdown, tanpa penjelasan di luar JSON.
Format respons yang diharapkan:
{
  "breakfast": "<menu_id>",
  "lunch": "<menu_id>",
  "dinner": "<menu_id>",
  "reasoning": "<penjelasan singkat dalam Bahasa Indonesia mengapa kamu memilih kombinasi ini>"
}`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_completion_tokens: 1024,
    top_p: 1,
    stream: false,
    stop: null,
  });

  return completion.choices[0]?.message?.content ?? "{}";
}
