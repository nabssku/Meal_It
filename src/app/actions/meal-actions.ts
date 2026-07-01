"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { askGroqForMealPlan } from "@/lib/groq";
import { revalidatePath } from "next/cache";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface GeneratedMealPlan {
  breakfast: MealItem;
  lunch: MealItem;
  dinner: MealItem;
  totalPrice: number;
  totalCalories: number;
  totalProtein: number;
  reasoning: string;
  userBudget: number;
}

interface MealItem {
  id: string;
  name: string;
  price: number;
  calories: number;
  protein: number;
  fat: number | null;
  carbs: number | null;
  image: string | null;
  category: string | null;
  vendor: string;
}

// ─────────────────────────────────────────────
// Auto-Seed Default Menus if DB is empty
// ─────────────────────────────────────────────

async function seedDefaultMenusIfEmpty(): Promise<void> {
  const menuCount = await prisma.menu.count();
  if (menuCount > 0) return;

  console.log("[MealActions] No menus found in DB. Seeding default menus...");

  // Find or create a default vendor user
  let vendorUser = await prisma.user.findFirst({
    where: { email: "vendor.default@mealit.id" },
  });

  if (!vendorUser) {
    vendorUser = await prisma.user.create({
      data: {
        email: "vendor.default@mealit.id",
        name: "Mama Lita",
        role: "vendor",
      },
    });
  }

  // Find or create a default vendor
  let vendor = await prisma.vendor.findFirst({
    where: { userId: vendorUser.id },
  });

  if (!vendor) {
    vendor = await prisma.vendor.create({
      data: {
        userId: vendorUser.id,
        name: "Katering Sehat Mama Lita",
        description: "Katering sehat dan bergizi dengan harga terjangkau",
        isVerified: true,
        isActive: true,
        rating: 4.8,
        city: "Jakarta",
      },
    });
  }

  // Seed default menus
  const defaultMenus = [
    // BREAKFAST options
    {
      name: "Oatmeal Pisang Madu",
      description: "Oatmeal bergizi dengan topping pisang dan madu alami",
      price: 12000,
      calories: 280,
      protein: 8,
      fat: 5,
      carbs: 52,
      category: "sarapan",
      tags: ["Hemat", "Serat Tinggi", "Sarapan"],
      image: "https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&q=80&w=400",
    },
    {
      name: "Roti Gandum Telur Rebus",
      description: "Roti gandum whole wheat dengan 2 telur rebus dan selai kacang",
      price: 15000,
      calories: 320,
      protein: 18,
      fat: 10,
      carbs: 38,
      category: "sarapan",
      tags: ["Protein Tinggi", "Sarapan", "Hemat"],
      image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=400",
    },
    {
      name: "Salad Buah Yogurt",
      description: "Buah segar campuran dengan yogurt Greek dan granola renyah",
      price: 18000,
      calories: 240,
      protein: 10,
      fat: 4,
      carbs: 42,
      category: "sarapan",
      tags: ["Rendah Kalori", "Sarapan", "Vegetarian"],
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400",
    },
    {
      name: "Nasi Uduk Sederhana",
      description: "Nasi uduk komplit dengan tempe bacem dan kerupuk",
      price: 10000,
      calories: 380,
      protein: 12,
      fat: 8,
      carbs: 65,
      category: "sarapan",
      tags: ["Hemat", "Sarapan"],
      image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=400",
    },
    {
      name: "Ayam Penyet Sehat",
      description: "Dada ayam bakar tanpa kulit dengan nasi merah, tempe rebus, dan salad sayur",
      price: 22000,
      calories: 420,
      protein: 32,
      fat: 8,
      carbs: 45,
      category: "makan-siang",
      tags: ["Protein Tinggi", "Diet"],
      image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=400",
    },
    {
      name: "Gado-Gado Komplit",
      description: "Sayuran rebus dengan saus kacang, tahu, tempe, dan kerupuk",
      price: 18000,
      calories: 380,
      protein: 16,
      fat: 14,
      carbs: 48,
      category: "makan-siang",
      tags: ["Vegetarian", "Serat Tinggi"],
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400",
    },
    {
      name: "Nasi Pecel Sayur",
      description: "Nasi dengan berbagai sayuran rebus dan bumbu pecel kacang",
      price: 15000,
      calories: 360,
      protein: 14,
      fat: 10,
      carbs: 58,
      category: "makan-siang",
      tags: ["Vegetarian", "Hemat", "Serat Tinggi"],
      image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=400",
    },
    {
      name: "Sup Ayam Bening",
      description: "Sup ayam bening dengan wortel, kentang, dan sayuran segar",
      price: 20000,
      calories: 290,
      protein: 24,
      fat: 6,
      carbs: 28,
      category: "makan-siang",
      tags: ["Rendah Kalori", "Diet", "Protein Tinggi"],
      image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=400",
    },

    // DINNER options
    {
      name: "Ikan Bakar Kunyit",
      description: "Ikan nila bakar kunyit dengan sambal tomat dan lalapan segar",
      price: 25000,
      calories: 310,
      protein: 30,
      fat: 8,
      carbs: 22,
      category: "makan-malam",
      tags: ["Protein Tinggi", "Diet", "Rendah Kalori"],
      image: "https://images.unsplash.com/photo-1619895862022-09114b41f16f?auto=format&fit=crop&q=80&w=400",
    },
    {
      name: "Tahu Tempe Bacem",
      description: "Tahu dan tempe bacem manis gurih dengan nasi merah dan sayuran",
      price: 15000,
      calories: 340,
      protein: 20,
      fat: 12,
      carbs: 40,
      category: "makan-malam",
      tags: ["Vegetarian", "Hemat"],
      image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=400",
    },
    {
      name: "Sup Ayam Jahe",
      description: "Sup ayam hangat dengan jahe, bawang putih, dan sayuran hijau",
      price: 20000,
      calories: 280,
      protein: 26,
      fat: 7,
      carbs: 20,
      category: "makan-malam",
      tags: ["Rendah Kalori", "Diet"],
      image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=400",
    },
    {
      name: "Tumis Brokoli Tempe",
      description: "Brokoli dan tempe tumis bawang putih dengan nasi merah rendah GI",
      price: 18000,
      calories: 300,
      protein: 18,
      fat: 8,
      carbs: 38,
      category: "makan-malam",
      tags: ["Vegetarian", "Diet", "Serat Tinggi"],
      image: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&q=80&w=400",
    },
  ];

  for (const menu of defaultMenus) {
    await prisma.menu.create({
      data: {
        ...menu,
        vendorId: vendor.id,
        isAvailable: true,
      },
    });
  }

  console.log("[MealActions] Default menus seeded successfully!");
}

// ─────────────────────────────────────────────
// Generate Meal Plan with Groq AI
// ─────────────────────────────────────────────

export async function generateMealPlanAction(
  budgetOverride?: number,
  goalOverride?: string
): Promise<{ success: true; data: GeneratedMealPlan } | { success: false; error: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Kamu harus login terlebih dahulu." };
    }

    // Fetch user profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        dailyBudget: true,
        bodyGoal: true,
        age: true,
        gender: true,
        weight: true,
        height: true,
        allergies: true,
        preferences: true,
      },
    });

    if (!user) {
      return { success: false, error: "Profil pengguna tidak ditemukan." };
    }

    const budget = budgetOverride ?? user.dailyBudget;
    const bodyGoal = goalOverride ?? user.bodyGoal ?? "healthy_life";

    const goalMap: Record<string, string> = {
      weight_loss: "Turun berat badan (defisit kalori bergizi)",
      muscle_gain: "Menambah massa otot (tinggi protein)",
      healthy_life: "Hidup lebih sehat (seimbang, nutrisi lengkap)",
      budget_healthy: "Hemat makan sehat (nutrisi maksimal dengan budget minimal)",
    };
    const descriptiveGoal = goalMap[bodyGoal] || "Hidup lebih sehat";

    // Auto-seed menus if DB is empty
    await seedDefaultMenusIfEmpty();

    // Fetch available menus from DB
    const allMenus = await prisma.menu.findMany({
      where: { isAvailable: true },
      include: { vendor: { select: { name: true } } },
    });

    if (allMenus.length === 0) {
      return { success: false, error: "Tidak ada menu tersedia di database." };
    }

    // Group menus by category for a structured prompt
    const breakfastMenus = allMenus.filter(
      (m) => m.category === "sarapan" || m.tags.some(t => t.toLowerCase().includes("sarapan"))
    );
    const lunchMenus = allMenus.filter(
      (m) => m.category === "makan-siang" || m.tags.some(t => t.toLowerCase().includes("siang"))
    );
    const dinnerMenus = allMenus.filter(
      (m) => m.category === "makan-malam" || m.tags.some(t => t.toLowerCase().includes("malam"))
    );

    // Fallback: if categories are missing, distribute all menus
    const sarapanList = breakfastMenus.length > 0 ? breakfastMenus : allMenus.slice(0, 4);
    const siangList = lunchMenus.length > 0 ? lunchMenus : allMenus.slice(4, 8);
    const malamList = dinnerMenus.length > 0 ? dinnerMenus : allMenus.slice(8);

    const formatMenuList = (menus: typeof allMenus) =>
      menus
        .map(
          (m) =>
            `- ID: ${m.id} | Nama: ${m.name} | Harga: Rp ${m.price.toLocaleString("id-ID")} | Kalori: ${m.calories} kkal | Protein: ${m.protein}g | Vendor: ${m.vendor.name}`
        )
        .join("\n");

    // Build Groq prompt
    const prompt = `
Profil pengguna:
- Usia: ${user.age ?? "tidak diketahui"} tahun
- Jenis kelamin: ${user.gender ?? "tidak diketahui"}
- Berat badan: ${user.weight ?? "tidak diketahui"} kg
- Tinggi badan: ${user.height ?? "tidak diketahui"} cm
- Tujuan: ${descriptiveGoal}
- Alergi: ${user.allergies?.length ? user.allergies.join(", ") : "tidak ada"}
- Preferensi: ${user.preferences?.length ? user.preferences.join(", ") : "tidak ada"}
- Budget harian: Rp ${budget.toLocaleString("id-ID")}

Pilihlah SATU menu sarapan, SATU menu makan siang, dan SATU menu makan malam dari daftar berikut.
PENTING: Total harga ketiga menu HARUS kurang dari atau sama dengan Rp ${budget.toLocaleString("id-ID")}.
Pertimbangkan juga alergi dan preferensi pengguna.

MENU SARAPAN (pilih 1):
${formatMenuList(sarapanList)}

MENU MAKAN SIANG (pilih 1):
${formatMenuList(siangList)}

MENU MAKAN MALAM (pilih 1):
${formatMenuList(malamList)}

Balas HANYA dengan JSON valid:
{
  "breakfast": "<id_menu_sarapan>",
  "lunch": "<id_menu_makan_siang>",
  "dinner": "<id_menu_makan_malam>",
  "reasoning": "<penjelasan singkat dalam Bahasa Indonesia>"
}
`.trim();

    // Call Groq AI
    const rawResponse = await askGroqForMealPlan(prompt);

    // Parse JSON response
    let aiResult: { breakfast: string; lunch: string; dinner: string; reasoning: string };
    try {
      // Clean any potential markdown code block wrapping
      const cleaned = rawResponse
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      aiResult = JSON.parse(cleaned);
    } catch {
      console.error("[MealActions] Failed to parse Groq response:", rawResponse);
      return {
        success: false,
        error: "AI tidak dapat menghasilkan rencana makan yang valid. Coba lagi.",
      };
    }

    // Look up the selected menus by ID
    const findMenu = (id: string) => allMenus.find((m) => m.id === id);
    const breakfastMenu = findMenu(aiResult.breakfast);
    const lunchMenu = findMenu(aiResult.lunch);
    const dinnerMenu = findMenu(aiResult.dinner);

    if (!breakfastMenu || !lunchMenu || !dinnerMenu) {
      console.error("[MealActions] AI returned invalid menu IDs:", aiResult);
      return {
        success: false,
        error: "AI memilih menu yang tidak valid. Coba generate ulang.",
      };
    }

    const toMealItem = (menu: typeof allMenus[0]): MealItem => ({
      id: menu.id,
      name: menu.name,
      price: menu.price,
      calories: menu.calories,
      protein: menu.protein,
      fat: menu.fat ?? null,
      carbs: menu.carbs ?? null,
      image: menu.image,
      category: menu.category ?? null,
      vendor: menu.vendor.name,
    });

    const result: GeneratedMealPlan = {
      breakfast: toMealItem(breakfastMenu),
      lunch: toMealItem(lunchMenu),
      dinner: toMealItem(dinnerMenu),
      totalPrice: breakfastMenu.price + lunchMenu.price + dinnerMenu.price,
      totalCalories: breakfastMenu.calories + lunchMenu.calories + dinnerMenu.calories,
      totalProtein: breakfastMenu.protein + lunchMenu.protein + dinnerMenu.protein,
      reasoning: aiResult.reasoning,
      userBudget: budget,
    };

    return { success: true, data: result };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[MealActions] generateMealPlanAction error:", err.message);
    return {
      success: false,
      error: `Terjadi kesalahan: ${err.message ?? "Coba lagi."}`,
    };
  }
}

// ─────────────────────────────────────────────
// Save Meal Plan to Database
// ─────────────────────────────────────────────

export interface MealItemConfig {
  menuId: string;
  deliveryMethod: "PICKUP" | "DELIVERY";
  paymentMethod: "WALLET" | "CASH";
}

export async function saveMealPlanAction(config: {
  breakfast: MealItemConfig;
  lunch: MealItemConfig;
  dinner: MealItemConfig;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Kamu harus login terlebih dahulu." };
    }

    // Fetch user wallet balance
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { walletBalance: true, dailyBudget: true },
    });

    if (!user) {
      return { success: false, error: "User tidak ditemukan." };
    }

    const menuIds = [config.breakfast.menuId, config.lunch.menuId, config.dinner.menuId];

    // Fetch the 3 selected menus
    const menus = await prisma.menu.findMany({
      where: { id: { in: menuIds } },
      include: { vendor: { select: { name: true } } },
    });

    const totalPrice = menus.reduce((sum, m) => sum + m.price, 0);
    const totalCalories = menus.reduce((sum, m) => sum + m.calories, 0);

    // Calculate wallet total cost (only for WALLET payment items)
    const items = [config.breakfast, config.lunch, config.dinner];
    const walletCost = items.reduce((sum, item) => {
      if (item.paymentMethod === "WALLET") {
        const menu = menus.find((m) => m.id === item.menuId);
        return sum + (menu?.price ?? 0);
      }
      return sum;
    }, 0);

    // Check wallet balance if needed
    if (walletCost > 0 && user.walletBalance < walletCost) {
      return {
        success: false,
        error: `Saldo Nutri-Wallet tidak cukup. Saldo saat ini: Rp ${user.walletBalance.toLocaleString("id-ID")}, dibutuhkan: Rp ${walletCost.toLocaleString("id-ID")}.`,
      };
    }

    // Delete any existing meal plan for today to avoid duplicates
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const existingPlan = await prisma.mealPlan.findFirst({
      where: {
        userId: session.user.id,
        date: { gte: todayStart, lt: todayEnd },
      },
    });

    if (existingPlan) {
      await prisma.mealPlanItem.deleteMany({
        where: { mealPlanId: existingPlan.id },
      });
      await prisma.mealPlan.delete({ where: { id: existingPlan.id } });
    }

    // Create new meal plan
    const newPlan = await prisma.mealPlan.create({
      data: {
        userId: session.user.id,
        date: new Date(),
        totalPrice,
        totalCalories,
        status: "PLANNED",
      },
    });

    // Helper: generate unique pickup code per meal type
    const generatePickupCode = (mealType: string) => {
      const prefix = mealType.substring(0, 2).toUpperCase(); // BF / LU / DN
      const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
      return `MP-${prefix}-${rand}`;
    };

    // Meal type labels
    const mealTypes: Record<"breakfast" | "lunch" | "dinner", string> = {
      breakfast: "BREAKFAST",
      lunch: "LUNCH",
      dinner: "DINNER",
    };

    // Create meal plan items with delivery & payment info
    for (const [key, cfg] of Object.entries(config) as ["breakfast" | "lunch" | "dinner", MealItemConfig][]) {
      const mealType = mealTypes[key];
      const isPickup = cfg.deliveryMethod === "PICKUP";
      const isWallet = cfg.paymentMethod === "WALLET";
      const pickupCode = isPickup ? generatePickupCode(mealType) : null;

      await prisma.mealPlanItem.create({
        data: {
          mealPlanId: newPlan.id,
          menuId: cfg.menuId,
          mealType,
          deliveryMethod: cfg.deliveryMethod,
          paymentMethod: cfg.paymentMethod,
          paymentStatus: isWallet ? "PAID" : "PENDING",
          status: "PENDING",
          ...(pickupCode ? { pickupCode } : {}),
        },
      });
    }

    // Deduct wallet balance for WALLET payment items
    if (walletCost > 0) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { walletBalance: { decrement: walletCost } },
      });

      await prisma.walletLog.create({
        data: {
          userId: session.user.id,
          amount: -walletCost,
          type: "EXPENSE",
          note: `Meal plan ${new Date().toLocaleDateString("id-ID")} (Nutri-Wallet)`,
        },
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/history");
    revalidatePath("/meal-planner");
    revalidatePath("/wallet");

    return { success: true };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[MealActions] saveMealPlanAction error:", err.message);
    return {
      success: false,
      error: `Gagal menyimpan meal plan: ${err.message ?? "Coba lagi."}`,
    };
  }
}

// Get User Settings (for prefilling the budget and goal)
// ─────────────────────────────────────────────

export async function getUserSettingsAction(): Promise<{
  budget: number;
  bodyGoal: string;
  walletBalance: number;
  age?: number;
  height?: number;
  weight?: number;
  gender?: string;
  plannerPeriod: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { budget: 50000, bodyGoal: "healthy_life", walletBalance: 0, plannerPeriod: "daily" };

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        dailyBudget: true,
        bodyGoal: true,
        walletBalance: true,
        age: true,
        height: true,
        weight: true,
        gender: true,
        plannerPeriod: true,
      },
    });

    const rawBudget = user?.dailyBudget ?? 50000;
    return {
      budget: rawBudget < 40000 ? 40000 : rawBudget,
      bodyGoal: user?.bodyGoal ?? "healthy_life",
      walletBalance: user?.walletBalance ?? 0,
      age: user?.age ?? undefined,
      height: user?.height ?? undefined,
      weight: user?.weight ?? undefined,
      gender: user?.gender ?? undefined,
      plannerPeriod: user?.plannerPeriod ?? "daily",
    };
  } catch {
    return { budget: 50000, bodyGoal: "healthy_life", walletBalance: 0, plannerPeriod: "daily" };
  }
}

// ─────────────────────────────────────────────
// Get Meal Plan Item by Pickup Code (for Vendor scan)
// ─────────────────────────────────────────────

export async function getMealPlanItemByPickupCode(
  pickupCode: string
): Promise<{
  success: boolean;
  data?: {
    id: string;
    mealType: string;
    status: string;
    paymentMethod: string;
    paymentStatus: string;
    deliveryMethod: string;
    pickupCode: string;
    menuName: string;
    menuPrice: number;
    menuImage: string | null;
    userName: string | null;
    userEmail: string | null;
    vendorName: string;
    mealPlanDate: Date;
  };
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Kamu harus login sebagai vendor." };
    }

    const item = await prisma.mealPlanItem.findUnique({
      where: { pickupCode },
      include: {
        menu: {
          include: { vendor: { select: { name: true, userId: true } } },
        },
        mealPlan: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    if (!item) {
      return { success: false, error: "Kode pickup tidak ditemukan. Pastikan kode sudah benar." };
    }

    if (item.status === "PICKED_UP" || item.status === "DELIVERED") {
      return { success: false, error: "Pesanan ini sudah pernah dikonfirmasi sebelumnya." };
    }

    return {
      success: true,
      data: {
        id: item.id,
        mealType: item.mealType,
        status: item.status,
        paymentMethod: item.paymentMethod,
        paymentStatus: item.paymentStatus,
        deliveryMethod: item.deliveryMethod,
        pickupCode: item.pickupCode!,
        menuName: item.menu.name,
        menuPrice: item.menu.price,
        menuImage: item.menu.image,
        userName: item.mealPlan.user.name,
        userEmail: item.mealPlan.user.email,
        vendorName: item.menu.vendor.name,
        mealPlanDate: item.mealPlan.date,
      },
    };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: `Error: ${err.message}` };
  }
}

export async function checkAndUpdateMealPlanStatus(mealPlanId: string) {
  try {
    const mealPlan = await prisma.mealPlan.findUnique({
      where: { id: mealPlanId },
      include: { items: true },
    });

    if (!mealPlan) return;

    const allCompleted = mealPlan.items.length > 0 && mealPlan.items.every(
      (item) => item.status === "PICKED_UP" || item.status === "DELIVERED"
    );

    if (allCompleted) {
      await prisma.mealPlan.update({
        where: { id: mealPlanId },
        data: { status: "COMPLETED" },
      });
    } else {
      if (mealPlan.status === "COMPLETED") {
        await prisma.mealPlan.update({
          where: { id: mealPlanId },
          data: { status: "PLANNED" },
        });
      }
    }
  } catch (error) {
    console.error("[MealActions] checkAndUpdateMealPlanStatus error:", error);
  }
}

// ─────────────────────────────────────────────
// Confirm Meal Pickup (Vendor Action)
// ─────────────────────────────────────────────

export async function confirmMealPickupAction(
  itemId: string,
  pickupCode: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify vendor owns this menu item
    const item = await prisma.mealPlanItem.findUnique({
      where: { id: itemId },
      include: {
        menu: { include: { vendor: { select: { userId: true, name: true, id: true } } } },
        mealPlan: { include: { user: { select: { id: true } } } },
      },
    });

    if (!item) {
      return { success: false, error: "Item tidak ditemukan." };
    }

    if (item.pickupCode !== pickupCode) {
      return { success: false, error: "Kode pickup tidak cocok." };
    }

    if (item.status === "PICKED_UP") {
      return { success: false, error: "Pesanan ini sudah dikonfirmasi." };
    }

    // Update item status
    await prisma.mealPlanItem.update({
      where: { id: itemId },
      data: {
        status: "PICKED_UP",
        paymentStatus: "PAID", // Mark as paid regardless of method (cash paid on-site)
      },
    });

    // Check parent MealPlan status
    if (item.mealPlanId) {
      await checkAndUpdateMealPlanStatus(item.mealPlanId);
    }

    // ─── Create an Order record so vendor dashboard stats are updated ───
    // The vendor dashboard reads from the Order table for Total Orders & Revenue.
    // We create a COMPLETED Order here to reflect this confirmed pickup.
    // NOTE: Nested create is split into two queries because HTTP-mode Prisma
    //       drivers (e.g. Neon, Accelerate) don't support implicit transactions.
    const createdOrder = await prisma.order.create({
      data: {
        userId: item.mealPlan.user.id,
        vendorId: item.menu.vendor.id,
        totalAmount: item.menu.price,
        status: "COMPLETED",
        paymentMethod: item.paymentMethod,
        paymentStatus: "PAID",
      },
    });

    await prisma.orderItem.create({
      data: {
        orderId: createdOrder.id,
        menuId: item.menuId,
        quantity: 1,
        price: item.menu.price,
      },
    });

    // Log vendor revenue as wallet log if cash payment
    if (item.paymentMethod === "CASH") {
      // Create wallet log for the user (cash expense tracking)
      await prisma.walletLog.create({
        data: {
          userId: item.mealPlan.user.id,
          amount: -item.menu.price,
          type: "EXPENSE",
          note: `${item.mealType === "BREAKFAST" ? "Sarapan" : item.mealType === "LUNCH" ? "Makan Siang" : "Makan Malam"}: ${item.menu.name} (Tunai di ${item.menu.vendor.name})`,
        },
      });

      // Deduct user wallet balance for cash tracking
      await prisma.user.update({
        where: { id: item.mealPlan.user.id },
        data: { walletBalance: { decrement: 0 } }, // Cash doesn't affect digital wallet
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/vendor/dashboard");
    revalidatePath("/vendor/orders");
    revalidatePath("/wallet");
    revalidatePath("/profile");

    return { success: true };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[MealActions] confirmMealPickupAction error:", err.message);
    return { success: false, error: `Gagal konfirmasi: ${err.message}` };
  }
}

// ─────────────────────────────────────────────
// Get All Menus (for Menus page)
// ─────────────────────────────────────────────

export async function getMenusAction(): Promise<{
  id: string;
  name: string;
  price: number;
  calories: number;
  protein: number;
  fat: number | null;
  carbs: number | null;
  image: string | null;
  category: string | null;
  tags: string[];
  vendorName: string;
  vendorId: string;
  rating: number;
}[]> {
  try {
    await seedDefaultMenusIfEmpty();

    const menus = await prisma.menu.findMany({
      where: { isAvailable: true },
      include: { vendor: { select: { name: true, id: true, rating: true } } },
      orderBy: { name: "asc" },
    });

    return menus.map((m) => ({
      id: m.id,
      name: m.name,
      price: m.price,
      calories: m.calories,
      protein: m.protein,
      fat: m.fat,
      carbs: m.carbs,
      image: m.image,
      category: m.category,
      tags: m.tags,
      vendorName: m.vendor.name,
      vendorId: m.vendor.id,
      rating: m.vendor.rating,
    }));
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────
// Get Vendor + All Menus (for Vendor Detail page)
// ─────────────────────────────────────────────

export async function getVendorWithMenusAction(vendorId: string): Promise<{
  vendor: {
    id: string;
    name: string;
    description: string | null;
    logo: string | null;
    category: string | null;
    rating: number;
    address: string | null;
    city: string | null;
    isDeliveryEnabled: boolean;
    deliveryFee: number;
    latitude: number | null;
    longitude: number | null;
  };
  menus: {
    id: string;
    name: string;
    price: number;
    calories: number;
    protein: number;
    fat: number | null;
    carbs: number | null;
    image: string | null;
    category: string | null;
    tags: string[];
    rating: number;
    isAvailable: boolean;
  }[];
} | null> {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId, isActive: true },
      include: {
        menus: {
          where: { isAvailable: true },
          orderBy: { name: "asc" },
        },
      },
    });

    if (!vendor) return null;

    return {
      vendor: {
        id: vendor.id,
        name: vendor.name,
        description: vendor.description,
        logo: vendor.logo,
        category: vendor.category,
        rating: vendor.rating,
        address: vendor.address,
        city: vendor.city,
        isDeliveryEnabled: vendor.isDeliveryEnabled,
        deliveryFee: vendor.deliveryFee,
        latitude: vendor.latitude,
        longitude: vendor.longitude,
      },
      menus: vendor.menus.map((m) => ({
        id: m.id,
        name: m.name,
        price: m.price,
        calories: m.calories,
        protein: m.protein,
        fat: m.fat,
        carbs: m.carbs,
        image: m.image,
        category: m.category,
        tags: m.tags,
        rating: vendor.rating,
        isAvailable: m.isAvailable,
      })),
    };
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// Get Menu by ID (for Detail page)
// ─────────────────────────────────────────────

export async function getMenuByIdAction(menuId: string): Promise<{
  id: string;
  name: string;
  description: string | null;
  price: number;
  calories: number;
  protein: number;
  fat: number | null;
  carbs: number | null;
  image: string | null;
  category: string | null;
  tags: string[];
  vendorName: string;
  vendorId: string;
  vendorRating: number;
  isAvailable: boolean;
  vendorDeliveryEnabled: boolean;
  vendorDeliveryFee: number;
  vendorHasPakasir: boolean;
  vendorAddress: string | null;
} | null> {
  try {
    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
      include: {
        vendor: {
          select: {
            name: true,
            id: true,
            rating: true,
            isDeliveryEnabled: true,
            deliveryFee: true,
            pakasirSlug: true,
            pakasirApiKey: true,
            address: true,
          },
        },
      },
    });

    if (!menu) return null;

    return {
      id: menu.id,
      name: menu.name,
      description: menu.description,
      price: menu.price,
      calories: menu.calories,
      protein: menu.protein,
      fat: menu.fat,
      carbs: menu.carbs,
      image: menu.image,
      category: menu.category,
      tags: menu.tags,
      vendorName: menu.vendor.name,
      vendorId: menu.vendor.id,
      vendorRating: menu.vendor.rating,
      isAvailable: menu.isAvailable,
      vendorDeliveryEnabled: menu.vendor.isDeliveryEnabled,
      vendorDeliveryFee: menu.vendor.deliveryFee,
      vendorHasPakasir: !!(menu.vendor.pakasirSlug && menu.vendor.pakasirApiKey),
      vendorAddress: menu.vendor.address,
    };
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// Order Menu Directly (Pesan Langsung, Bayar di Tempat)
// ─────────────────────────────────────────────

export async function orderMenuDirectlyAction(
  menuId: string,
  paymentMethod: "WALLET" | "CASH"
): Promise<{ success: boolean; pickupCode?: string; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Kamu harus login terlebih dahulu." };
    }

    const [user, menu] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { walletBalance: true },
      }),
      prisma.menu.findUnique({
        where: { id: menuId },
        include: { vendor: { select: { id: true, name: true } } },
      }),
    ]);

    if (!user) return { success: false, error: "User tidak ditemukan." };
    if (!menu) return { success: false, error: "Menu tidak ditemukan." };
    if (!menu.isAvailable) return { success: false, error: "Menu tidak tersedia saat ini." };

    if (paymentMethod === "WALLET") {
      if (user.walletBalance < menu.price) {
        return {
          success: false,
          error: `Saldo Nutri-Wallet tidak cukup. Saldo: Rp ${user.walletBalance.toLocaleString("id-ID")}, butuh: Rp ${menu.price.toLocaleString("id-ID")}.`,
        };
      }
    }

    // Detect meal type from category
    const categoryToMealType: Record<string, string> = {
      "sarapan": "BREAKFAST",
      "makan-siang": "LUNCH",
      "makan-malam": "DINNER",
    };
    const mealType = categoryToMealType[menu.category ?? ""] ?? "LUNCH";

    // Generate pickup code
    const prefix = mealType.substring(0, 2).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    const pickupCode = `PO-${prefix}-${rand}`;

    // Find or create today's meal plan
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    let mealPlan = await prisma.mealPlan.findFirst({
      where: {
        userId: session.user.id,
        date: { gte: todayStart, lt: todayEnd },
      },
    });

    if (!mealPlan) {
      mealPlan = await prisma.mealPlan.create({
        data: {
          userId: session.user.id,
          date: new Date(),
          totalPrice: menu.price,
          totalCalories: menu.calories,
          status: "PLANNED",
        },
      });
    } else {
      // Update totals
      await prisma.mealPlan.update({
        where: { id: mealPlan.id },
        data: {
          totalPrice: { increment: menu.price },
          totalCalories: { increment: menu.calories },
        },
      });
    }

    // Create meal plan item
    await prisma.mealPlanItem.create({
      data: {
        mealPlanId: mealPlan.id,
        menuId,
        mealType,
        deliveryMethod: "PICKUP",
        paymentMethod,
        paymentStatus: paymentMethod === "WALLET" ? "PAID" : "PENDING",
        status: "PENDING",
        pickupCode,
      },
    });

    // Deduct wallet if wallet payment
    if (paymentMethod === "WALLET") {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { walletBalance: { decrement: menu.price } },
      });

      await prisma.walletLog.create({
        data: {
          userId: session.user.id,
          amount: -menu.price,
          type: "EXPENSE",
          note: `Pesanan langsung: ${menu.name} (${menu.vendor.name})`,
        },
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/wallet");
    revalidatePath("/history");

    return { success: true, pickupCode };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[MealActions] orderMenuDirectlyAction error:", err.message);
    return { success: false, error: `Gagal memesan: ${err.message}` };
  }
}

// ─────────────────────────────────────────────
// Get Available Menus For Plan (Profile Setup Calendar)
// ─────────────────────────────────────────────

export interface PlanMenuItem {
  id: string;
  name: string;
  price: number;
  calories: number;
  protein: number;
  fat: number | null;
  carbs: number | null;
  image: string | null;
  category: string | null;
  vendor: string;
}

export interface CategorizedMenus {
  breakfast: PlanMenuItem[];
  lunch: PlanMenuItem[];
  dinner: PlanMenuItem[];
}

export async function getAvailableMenusForPlanAction(): Promise<
  { success: true; data: CategorizedMenus } | { success: false; error: string }
> {
  try {
    await seedDefaultMenusIfEmpty();

    const allMenus = await prisma.menu.findMany({
      where: { isAvailable: true },
      include: { vendor: { select: { name: true } } },
    });

    const toItem = (m: (typeof allMenus)[0]): PlanMenuItem => ({
      id: m.id,
      name: m.name,
      price: m.price,
      calories: m.calories,
      protein: m.protein,
      fat: m.fat ?? null,
      carbs: m.carbs ?? null,
      image: m.image,
      category: m.category,
      vendor: m.vendor.name,
    });

    const breakfastMenus = allMenus.filter(
      (m) => m.category === "sarapan" || m.tags.some((t) => t.toLowerCase().includes("sarapan"))
    );
    const lunchMenus = allMenus.filter(
      (m) => m.category === "makan-siang" || m.tags.some((t) => t.toLowerCase().includes("siang"))
    );
    const dinnerMenus = allMenus.filter(
      (m) => m.category === "makan-malam" || m.tags.some((t) => t.toLowerCase().includes("malam"))
    );

    // Fallback if categories missing
    const bfList = breakfastMenus.length > 0 ? breakfastMenus : allMenus.slice(0, 4);
    const lnList = lunchMenus.length > 0 ? lunchMenus : allMenus.slice(4, 8);
    const dnList = dinnerMenus.length > 0 ? dinnerMenus : allMenus.slice(8);

    return {
      success: true,
      data: {
        breakfast: bfList.map(toItem),
        lunch: lnList.map(toItem),
        dinner: dnList.map(toItem),
      },
    };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────
// Save Multi-Day Meal Plan (Weekly / Monthly)
// ─────────────────────────────────────────────

export interface DayPlanToSave {
  date: string; // ISO string
  breakfastMenuId: string;
  lunchMenuId: string;
  dinnerMenuId: string;
}

export async function saveMultiDayMealPlanAction(
  days: DayPlanToSave[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Kamu harus login terlebih dahulu." };
    }

    const allMenuIds = days.flatMap((d) => [d.breakfastMenuId, d.lunchMenuId, d.dinnerMenuId]);
    const uniqueIds = [...new Set(allMenuIds)];

    const menuMap = new Map<string, { price: number; calories: number }>();
    const menus = await prisma.menu.findMany({ where: { id: { in: uniqueIds } } });
    menus.forEach((m) => menuMap.set(m.id, { price: m.price, calories: m.calories }));

    const generatePickupCode = (mealType: string) => {
      const prefix = mealType.substring(0, 2).toUpperCase();
      const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
      return `MP-${prefix}-${rand}`;
    };

    for (const day of days) {
      const date = new Date(day.date);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      // Remove existing plan for that day if any
      const existing = await prisma.mealPlan.findFirst({
        where: { userId: session.user.id, date: { gte: dayStart, lt: dayEnd } },
      });
      if (existing) {
        await prisma.mealPlanItem.deleteMany({ where: { mealPlanId: existing.id } });
        await prisma.mealPlan.delete({ where: { id: existing.id } });
      }

      const bfMenu = menuMap.get(day.breakfastMenuId);
      const lnMenu = menuMap.get(day.lunchMenuId);
      const dnMenu = menuMap.get(day.dinnerMenuId);

      const totalPrice = (bfMenu?.price ?? 0) + (lnMenu?.price ?? 0) + (dnMenu?.price ?? 0);
      const totalCalories =
        (bfMenu?.calories ?? 0) + (lnMenu?.calories ?? 0) + (dnMenu?.calories ?? 0);

      const plan = await prisma.mealPlan.create({
        data: {
          userId: session.user.id,
          date,
          totalPrice,
          totalCalories,
          status: "PLANNED",
        },
      });

      const items = [
        { menuId: day.breakfastMenuId, mealType: "BREAKFAST" },
        { menuId: day.lunchMenuId, mealType: "LUNCH" },
        { menuId: day.dinnerMenuId, mealType: "DINNER" },
      ];

      for (const item of items) {
        await prisma.mealPlanItem.create({
          data: {
            mealPlanId: plan.id,
            menuId: item.menuId,
            mealType: item.mealType,
            deliveryMethod: "PICKUP",
            paymentMethod: "CASH",
            paymentStatus: "PENDING",
            status: "PENDING",
            pickupCode: generatePickupCode(item.mealType),
          },
        });
      }
    }

    revalidatePath("/dashboard");
    revalidatePath("/meal-planner");
    revalidatePath("/history");

    return { success: true };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[MealActions] saveMultiDayMealPlanAction error:", err.message);
    return { success: false, error: `Gagal menyimpan rencana makan: ${err.message}` };
  }
}

export async function completeProfileSetupAction(params: {
  gender: string;
  age: number;
  height: number;
  weight: number;
  bodyGoal: string;
  dailyBudget: number;
  address: string;
  latitude: number;
  longitude: number;
  mealPlans?: DayPlanToSave[];
}): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Kamu harus login terlebih dahulu." };
    }

    // 1. Validate profile fields
    if (
      isNaN(params.age)    || params.age    <= 0 ||
      isNaN(params.height) || params.height <= 0 ||
      isNaN(params.weight) || params.weight <= 0 ||
      isNaN(params.dailyBudget) || params.dailyBudget < 40000 ||
      !params.address ||
      isNaN(params.latitude) ||
      isNaN(params.longitude)
    ) {
      return {
        success: false,
        error: "Data tidak valid: pastikan umur, tinggi, berat, alamat, dan koordinat peta diisi dengan benar, dan budget harian minimal Rp 40.000."
      };
    }

    // 2. Save user profile
    await prisma.user.upsert({
      where: { id: session.user.id },
      update: {
        gender:      params.gender,
        age:         params.age,
        height:      params.height,
        weight:      params.weight,
        bodyGoal:    params.bodyGoal,
        dailyBudget: params.dailyBudget,
        address:     params.address,
        latitude:    params.latitude,
        longitude:   params.longitude,
      },
      create: {
        id:          session.user.id,
        email:       session.user.email ?? undefined,
        name:        session.user.name  ?? undefined,
        image:       session.user.image ?? undefined,
        gender:      params.gender,
        age:         params.age,
        height:      params.height,
        weight:      params.weight,
        bodyGoal:    params.bodyGoal,
        dailyBudget: params.dailyBudget,
        address:     params.address,
        latitude:    params.latitude,
        longitude:   params.longitude,
      },
    });

    // 3. Save meal plans if present
    if (params.mealPlans && params.mealPlans.length > 0) {
      const daysToSave = params.mealPlans;
      const allMenuIds = daysToSave.flatMap((d) => [d.breakfastMenuId, d.lunchMenuId, d.dinnerMenuId]);
      const uniqueIds = [...new Set(allMenuIds)];

      const menuMap = new Map<string, { price: number; calories: number }>();
      const menus = await prisma.menu.findMany({ where: { id: { in: uniqueIds } } });
      menus.forEach((m) => menuMap.set(m.id, { price: m.price, calories: m.calories }));

      const generatePickupCode = (mealType: string) => {
        const prefix = mealType.substring(0, 2).toUpperCase();
        const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `MP-${prefix}-${rand}`;
      };

      for (const day of daysToSave) {
        const date = new Date(day.date);
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        // Remove existing plan for that day if any
        const existing = await prisma.mealPlan.findFirst({
          where: { userId: session.user.id, date: { gte: dayStart, lt: dayEnd } },
        });
        if (existing) {
          await prisma.mealPlanItem.deleteMany({ where: { mealPlanId: existing.id } });
          await prisma.mealPlan.delete({ where: { id: existing.id } });
        }

        const bfMenu = menuMap.get(day.breakfastMenuId);
        const lnMenu = menuMap.get(day.lunchMenuId);
        const dnMenu = menuMap.get(day.dinnerMenuId);

        const totalPrice = (bfMenu?.price ?? 0) + (lnMenu?.price ?? 0) + (dnMenu?.price ?? 0);
        const totalCalories =
          (bfMenu?.calories ?? 0) + (lnMenu?.calories ?? 0) + (dnMenu?.calories ?? 0);

        const plan = await prisma.mealPlan.create({
          data: {
            userId: session.user.id,
            date,
            totalPrice,
            totalCalories,
            status: "PLANNED",
          },
        });

        const items = [
          { menuId: day.breakfastMenuId, mealType: "BREAKFAST" },
          { menuId: day.lunchMenuId, mealType: "LUNCH" },
          { menuId: day.dinnerMenuId, mealType: "DINNER" },
        ];

        for (const item of items) {
          await prisma.mealPlanItem.create({
            data: {
              mealPlanId: plan.id,
              menuId: item.menuId,
              mealType: item.mealType,
              deliveryMethod: "PICKUP",
              paymentMethod: "CASH",
              paymentStatus: "PENDING",
              status: "PENDING",
              pickupCode: generatePickupCode(item.mealType),
            },
          });
        }
      }
    }

    // 4. Revalidate all related paths
    revalidatePath("/dashboard");
    revalidatePath("/profile");
    revalidatePath("/meal-planner");
    revalidatePath("/history");

    return { success: true };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[MealActions] completeProfileSetupAction error:", err.message);
    return { success: false, error: `Gagal menyelesaikan setup profil: ${err.message}` };
  }
}

// ─────────────────────────────────────────────
// Get AI Chat Context (for MealIt AI Chat)
// ─────────────────────────────────────────────

export interface AIChatContext {
  userName: string | null;
  bodyGoal: string | null;
  dailyBudget: number;
  walletBalance: number;
  age: number | null;
  gender: string | null;
  weight: number | null;
  height: number | null;
  allergies: string[];
  preferences: string[];
  todayPlan: {
    status: string;
    totalCalories: number;
    totalPrice: number;
    items: {
      mealType: string;
      menuName: string;
      vendorName: string;
      calories: number;
      protein: number;
      status: string;
    }[];
  } | null;
}

export async function getAIChatContextAction(): Promise<{
  success: boolean;
  data?: AIChatContext;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Kamu harus login terlebih dahulu." };
    }

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

    if (!user) {
      return { success: false, error: "Profil tidak ditemukan." };
    }

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
            menu: {
              include: {
                vendor: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    return {
      success: true,
      data: {
        userName: user.name,
        bodyGoal: user.bodyGoal,
        dailyBudget: user.dailyBudget,
        walletBalance: user.walletBalance,
        age: user.age,
        gender: user.gender,
        weight: user.weight,
        height: user.height,
        allergies: user.allergies || [],
        preferences: user.preferences || [],
        todayPlan: todayPlan
          ? {
              status: todayPlan.status,
              totalCalories: todayPlan.totalCalories,
              totalPrice: todayPlan.totalPrice,
              items: todayPlan.items.map((item) => ({
                mealType: item.mealType,
                menuName: item.menu.name,
                vendorName: item.menu.vendor.name,
                calories: item.menu.calories,
                protein: item.menu.protein,
                status: item.status,
              })),
            }
          : null,
      },
    };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: `Gagal memuat konteks: ${err.message}` };
  }
}
