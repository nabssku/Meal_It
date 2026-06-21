import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const GOAL_MAP: Record<string, string> = {
  weight_loss: "turun berat badan",
  muscle_gain: "menambah massa otot",
  healthy_life: "hidup lebih sehat",
  budget_healthy: "makan sehat hemat",
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const messages: { role: "user" | "assistant"; content: string }[] = body.messages ?? [];

    // Only send last 5 messages to save tokens
    const recentMessages = messages.slice(-5);

    // Fetch user context server-side
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        bodyGoal: true,
        dailyBudget: true,
        walletBalance: true,
        age: true,
        gender: true,
        weight: true,
        height: true,
        allergies: true,
        preferences: true,
      },
    });

    // Get today's meal plan
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayPlan = await prisma.mealPlan.findFirst({
      where: {
        userId: session.user.id,
        date: { gte: todayStart, lt: todayEnd },
      },
      include: {
        items: {
          include: {
            menu: { select: { name: true, calories: true, protein: true } },
          },
        },
      },
    });

    // Build compact user context
    const goal = GOAL_MAP[user?.bodyGoal ?? ""] ?? "hidup sehat";
    const planSummary = todayPlan
      ? `Plan hari ini: ${todayPlan.items.map(i => `${i.mealType.toLowerCase()} = ${i.menu.name}`).join(", ")}. Total: ${todayPlan.totalCalories} kkal, Rp ${todayPlan.totalPrice.toLocaleString("id-ID")}. Status: ${todayPlan.status}.`
      : "Belum ada meal plan hari ini.";

    const systemPrompt = `Kamu adalah MealIt AI, asisten nutrisi dan meal planning untuk aplikasi Meal-It. 
Kamu HANYA boleh membahas topik seputar Meal-It: meal plan, nutrisi, menu, budget, kesehatan makan, dan fitur aplikasi.
Tolak pertanyaan di luar konteks dengan sopan dan arahkan kembali ke topik Meal-It.
Jawab dalam Bahasa Indonesia, singkat dan ramah.

Data pengguna:
- Nama: ${user?.name ?? "Pengguna"}
- Tujuan: ${goal}
- Budget harian: Rp ${user?.dailyBudget?.toLocaleString("id-ID") ?? "50.000"}
- Saldo wallet: Rp ${user?.walletBalance?.toLocaleString("id-ID") ?? "0"}
- Umur: ${user?.age ?? "-"} th, ${user?.gender ?? "-"}, ${user?.weight ?? "-"}kg/${user?.height ?? "-"}cm
- Alergi: ${user?.allergies?.length ? user.allergies.join(", ") : "tidak ada"}
- ${planSummary}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...recentMessages,
      ],
      temperature: 0.7,
      max_completion_tokens: 512,
      top_p: 1,
      stream: false,
    });

    const reply = completion.choices[0]?.message?.content ?? "Maaf, saya tidak bisa menjawab saat ini. Coba lagi ya!";

    return NextResponse.json({ reply });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[AI Chat] error:", err.message);
    return NextResponse.json(
      { error: "Terjadi kesalahan. Coba lagi." },
      { status: 500 }
    );
  }
}
