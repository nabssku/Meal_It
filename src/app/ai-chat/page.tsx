import { getAIChatContextAction } from "@/app/actions/meal-actions";
import AIChatPage from "@/components/ai/AIChatPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MealIt AI - Chat Asisten Nutrisi",
  description: "Tanya MealIt AI soal meal plan, nutrisi, budget, dan rekomendasi menu sehat.",
};

export default async function AIChatRoute() {
  const result = await getAIChatContextAction();
  const context = result.success ? result.data ?? null : null;

  return <AIChatPage context={context} />;
}
