import React from "react";
import StatCard from "@/components/cards/StatCard";
import Button from "@/components/ui/Button";
import { Wallet, Flame, Target, Sparkles, ChevronRight, Truck, Package, Clock } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import MealScheduleReminder from "@/components/dashboard/MealScheduleReminder";
import SponsorStories from "@/components/dashboard/SponsorStories";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  let user;
  let ads: any[] = [];
  let activeOrders: any[] = [];
  try {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        mealPlans: {
          where: {
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt:  new Date(new Date().setHours(23, 59, 59, 999)),
            },
          },
          include: {
            items: {
              include: { menu: { include: { vendor: { select: { name: true } } } } },
            },
          },
        },
      },
    });

    const allAds = await prisma.advertisement.findMany({
      where: { isActive: true },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const vendorMap = new Map();
    allAds.forEach((ad) => {
      if (!vendorMap.has(ad.vendorId)) {
        vendorMap.set(ad.vendorId, {
          vendorId: ad.vendor.id,
          vendorName: ad.vendor.name,
          vendorLogo: ad.vendor.logo,
          slides: [],
        });
      }
      vendorMap.get(ad.vendorId).slides.push({
        id: ad.id,
        title: ad.title,
        description: ad.description,
        imageUrl: ad.imageUrl,
        targetUrl: ad.targetUrl,
      });
    });
    ads = Array.from(vendorMap.values());

    activeOrders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
        status: { notIn: ["COMPLETED", "CANCELLED", "REJECTED"] },
      },
      include: {
        vendor: { select: { name: true } },
        items: { include: { menu: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error: any) {
    console.error("[Dashboard] DB error:", error.code, error.message);
    redirect("/profile-setup");
  }

  if (!user) {
    redirect("/profile-setup");
  }

  if (user.role === "vendor") {
    redirect("/vendor/dashboard");
  }

  if (user.role === "admin") {
    redirect("/admin/dashboard");
  }

  if (!user.bodyGoal || !user.age || !user.address) {
    redirect("/profile-setup");
  }

  const todayPlan = user.mealPlans[0];
  const todayMeals = todayPlan?.items.map((item: any) => ({
    id: item.menu.id,
    time: item.mealType,
    name: item.menu.name,
    calories: item.menu.calories,
    protein: item.menu.protein,
    price: item.menu.price,
    image: item.menu.image || "https://images.unsplash.com/photo-1594911772124-d1a21b15de4a?auto=format&fit=crop&q=80&w=200",
    vendorName: item.menu.vendor?.name || "Vendor",
    // Pickup / delivery fields
    itemId: item.id,
    deliveryMethod: item.deliveryMethod || "PICKUP",
    status: item.status || "PENDING",
    paymentMethod: item.paymentMethod || "CASH",
    paymentStatus: item.paymentStatus || "PENDING",
    pickupCode: item.pickupCode || null,
  })) || [];

  const spentToday = todayPlan?.totalPrice || 0;
  const progressPercent = Math.min((spentToday / user.dailyBudget) * 100, 100);

  // Dynamic Calorie & Protein Target Calculation
  const weight = user.weight || 60;
  const height = user.height || 165;
  const age = user.age || 25;
  const gender = user.gender || "male";
  const bodyGoal = user.bodyGoal || "healthy_life";

  // Mifflin-St Jeor Formula
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  if (gender === "male") {
    bmr += 5;
  } else {
    bmr -= 161;
  }

  // Active multiplier (Lightly active: 1.375)
  const tdee = Math.round(bmr * 1.375);

  let targetCalories = tdee;
  let targetProtein = Math.round(weight * 1.5);

  if (bodyGoal === "weight_loss") {
    targetCalories = Math.max(tdee - 500, 1200);
    targetProtein = Math.round(weight * 1.8);
  } else if (bodyGoal === "muscle_gain") {
    targetCalories = tdee + 300;
    targetProtein = Math.round(weight * 2.0);
  } else if (bodyGoal === "budget_healthy") {
    targetCalories = tdee;
    targetProtein = Math.round(weight * 1.3);
  }

  const totalProteinToday = todayPlan?.items.reduce((sum: number, item: any) => sum + (item.menu.protein || 0), 0) || 0;

  return (
    <div className="flex flex-col gap-8 pb-32">
      <header className="flex justify-between items-center px-4 pt-6">
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">Selamat Pagi,</span>
          <h1 className="text-xl font-bold text-foreground">{user.name || "Sobat Mealit"} 👋</h1>
        </div>
        <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary overflow-hidden shadow-inner">
          <img
            src={user.image || `https://ui-avatars.com/api/?name=${user.name || 'User'}&background=0F5238&color=fff`}
            alt="User"
            className="w-full h-full object-cover"
          />
        </div>
      </header>

      {/* Sponsor Advertisements (Instagram Story Style) */}
      <SponsorStories ads={ads} />

      <section className="bg-primary rounded-3xl p-6 text-white shadow-xl shadow-primary/20 relative overflow-hidden mx-4">
        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex flex-col">
            <span className="text-xs text-white/70 font-bold uppercase tracking-widest">Sisa Budget Hari Ini</span>
            <div className="text-4xl font-black">Rp {(user.dailyBudget - spentToday).toLocaleString('id-ID')}</div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider opacity-80">
              <span>Pengeluaran: Rp {spentToday.toLocaleString('id-ID')}</span>
              <span>Limit: Rp {user.dailyBudget.toLocaleString('id-ID')}</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              <div
                className="h-full bg-orange-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(251,146,60,0.5)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -left-8 -bottom-8 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl" />
      </section>

      {/* Active Orders Section */}
      {activeOrders && activeOrders.length > 0 && (
        <section className="flex flex-col gap-4 px-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex justify-between items-center px-1">
            <h2 className="font-bold text-foreground text-sm flex items-center gap-1.5">
              <span className="w-2 h-2 bg-[#0F5238] rounded-full animate-pulse" />
              Pesanan Terkini
            </h2>
            <Link href="/orders" className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5">
              Semua <ChevronRight size={14} />
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {activeOrders.map((order: any) => {
              const itemsText = order.items.map((i: any) => `${i.quantity}x ${i.menu.name}`).join(", ");
              const isDelivery = order.deliveryMethod === "DELIVERY";

              const statusLabels: Record<string, string> = {
                PENDING: "Menunggu Konfirmasi",
                CONFIRMED: "Dikonfirmasi",
                PROCESSING: "Sedang Dimasak",
                READY: isDelivery ? "Siap Dikirim" : "Siap Diambil",
                ON_DELIVERY: "Sedang Diantar",
              };

              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="flex items-center gap-3.5 p-4 bg-white border border-[#E8EAF0] rounded-3xl shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="p-3 bg-[#0F5238]/5 rounded-2xl text-[#0F5238] flex-shrink-0">
                    {isDelivery ? <Truck size={20} /> : <Package size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold text-foreground truncate">{order.vendor.name}</span>
                      <span className="text-[9px] font-bold px-2 py-0.5 bg-[#0F5238]/10 text-[#0F5238] rounded-full flex-shrink-0">
                        {statusLabels[order.status] || order.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6B7280] truncate">{itemsText}</p>
                  </div>
                  <ChevronRight size={16} className="text-[#9CA3AF] group-hover:text-[#0F5238] transition-colors flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="grid grid-cols-2 gap-4 px-4">
        <StatCard
          label="Kalori Terpakai"
          value={(todayPlan?.totalCalories || 0).toString()}
          subValue={`/ ${targetCalories.toLocaleString("id-ID")} kkal`}
          icon={Flame}
          color="warning"
        />
        <StatCard
          label="Protein"
          value={`${totalProteinToday}g`}
          subValue={`/ ${targetProtein}g`}
          icon={Target}
          color="success"
        />
      </section>

      {/* AI Meal Planner CTA — show only if no plan today */}
      {todayMeals.length === 0 && (
        <section className="card-premium p-8 flex flex-col items-center text-center gap-4 border-dashed border-primary/30 bg-primary/5 rounded-[32px] mx-4">
          <div className="p-4 bg-white rounded-2xl text-primary shadow-lg">
            <Sparkles size={28} />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-bold text-foreground text-lg">Butuh Ide Makan?</h3>
            <p className="text-sm text-muted-foreground">Biarkan AI kami menyusun rencana makan bergizi sesuai sisa budgetmu.</p>
          </div>
          <Link href="/meal-planner" className="w-full mt-2">
            <Button variant="primary" size="lg" className="w-full rounded-2xl py-6 font-bold shadow-lg shadow-primary/20">Buat Meal Plan AI</Button>
          </Link>
        </section>
      )}

      {/* Today's Meals - Meal Schedule Reminder Timeline */}
      <MealScheduleReminder todayMeals={todayMeals} />
    </div>
  );
}
