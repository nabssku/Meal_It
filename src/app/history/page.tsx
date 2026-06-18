import React from "react";
import { History, Calendar, RefreshCw, Utensils, Flame, Target } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  let mealPlans: Array<{
    id: string;
    date: Date;
    totalPrice: number;
    totalCalories: number;
    status: string;
    items: Array<{
      id: string;
      menu: { name: string; protein: number };
    }>;
  }> = [];

  try {
    mealPlans = await prisma.mealPlan.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
      take: 30,
      include: {
        items: {
          include: {
            menu: {
              select: { name: true, protein: true },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("[HistoryPage] DB error:", error);
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const totalProtein = (items: Array<{ menu: { protein: number } }>) =>
    items.reduce((sum, item) => sum + (item.menu.protein || 0), 0);

  return (
    <div className="flex flex-col gap-6 pb-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Riwayat Makan</h1>
        <p className="text-sm text-muted-foreground">
          Lacak konsumsi dan budget harianmu.
        </p>
      </header>

      {mealPlans.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-4 py-12 px-4 text-center bg-muted/20 rounded-2xl border border-dashed border-border">
          <History size={48} className="text-muted-foreground opacity-30" />
          <div className="flex flex-col gap-1">
            <h3 className="font-bold text-foreground">Belum Ada Riwayat</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Buat meal plan pertamamu dan mulai perjalanan hidup sehat hari ini!
            </p>
          </div>
          <Link href="/meal-planner" className="w-full">
            <Button size="md" className="w-full rounded-2xl">
              Buat Meal Plan AI Sekarang
            </Button>
          </Link>
        </div>
      ) : (
        <section className="flex flex-col gap-4">
          {mealPlans.map((plan) => {
            const isCompleted = plan.status === "COMPLETED";
            return (
              <div key={plan.id} className="card-premium p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-primary">
                    <Calendar size={18} />
                    <span className="text-sm font-bold">{formatDate(plan.date)}</span>
                  </div>
                  <div
                    className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                      isCompleted
                        ? "bg-success/10 text-success"
                        : plan.status === "ACTIVE"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? "Selesai" : plan.status === "ACTIVE" ? "Aktif" : plan.status}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-muted/30 rounded-xl p-2.5 flex flex-col items-center gap-1">
                    <Utensils size={14} className="text-muted-foreground" />
                    <span className="text-xs font-black text-foreground">{plan.items.length}</span>
                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wide">Menu</span>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-2.5 flex flex-col items-center gap-1">
                    <Flame size={14} className="text-warning" />
                    <span className="text-xs font-black text-foreground">{plan.totalCalories || 0}</span>
                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wide">kkal</span>
                  </div>
                  <div className="bg-primary/5 rounded-xl p-2.5 flex flex-col items-center gap-1">
                    <Target size={14} className="text-primary" />
                    <span className="text-xs font-black text-foreground">{totalProtein(plan.items)}g</span>
                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wide">Protein</span>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-border/50 pt-3">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                    Total Pengeluaran
                  </span>
                  <span className="text-base font-black text-budget">
                    Rp {(plan.totalPrice || 0).toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Link href="/meal-planner" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full flex gap-2 rounded-xl text-xs">
                      <RefreshCw size={14} />
                      Buat Lagi
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {mealPlans.length > 0 && (
        <div className="mt-4 flex flex-col items-center gap-4 py-8 px-4 text-center bg-muted/20 rounded-2xl border border-dashed border-border">
          <History size={36} className="text-muted-foreground opacity-30" />
          <div className="flex flex-col gap-1">
            <h3 className="font-bold text-foreground">Terus Konsisten!</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {mealPlans.length} rencana makan tercatat. Terus catat meal planmu untuk statistik nutrisi yang lebih akurat.
            </p>
          </div>
          <Link href="/meal-planner" className="w-full">
            <Button size="md" className="w-full rounded-2xl">Buat Meal Plan Baru</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
