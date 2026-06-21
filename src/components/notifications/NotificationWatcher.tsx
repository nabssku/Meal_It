"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { getRecentUserActivitiesAction } from "@/app/actions/user-actions";
import { addNotification, getNotificationHistory } from "@/lib/notifications";

const NUTRITION_TIPS = [
  "Minum air putih minimal 2-3 liter per hari untuk menjaga hidrasi tubuh dan fungsi ginjal.",
  "Konsumsi cukup protein harian (seperti telur, dada ayam, tempe) membantu menjaga massa otot.",
  "Kurangi konsumsi makanan tinggi garam dan gula olahan demi kesehatan jantung jangka panjang.",
  "Serat dari sayuran hijau dan buah-buahan sangat baik untuk melancarkan sistem pencernaan.",
  "Makan secara perlahan membantu otak menerima sinyal kenyang lebih cepat sehingga mencegah makan berlebih.",
  "Istirahat dan tidur yang cukup (7-8 jam) berkontribusi besar bagi metabolisme tubuh yang sehat.",
  "Lemak sehat seperti pada alpukat, kacang-kacangan, dan olive oil bagus untuk penyerapan vitamin.",
];

const MEAL_LABELS: Record<string, string> = {
  BREAKFAST: "Sarapan",
  LUNCH: "Makan Siang",
  DINNER: "Makan Malam",
};

export default function NotificationWatcher() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) return;

    // 1. Daily Nutrition Tip Check
    const checkDailyTip = () => {
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
      const tipKey = `notif_nutrition_tips_${dateStr}`;

      // Get history to check if already triggered today
      const history = getNotificationHistory(userId);
      const alreadySent = history.some((item: any) => item.id === tipKey);

      if (!alreadySent) {
        const randomTip = NUTRITION_TIPS[Math.floor(Math.random() * NUTRITION_TIPS.length)];
        addNotification("nutrition_tips", "Tips Nutrisi Harian", randomTip, tipKey, userId);
      }
    };

    // 2. Active Orders & Meal Plan Status Check
    const checkActivities = async () => {
      const result = await getRecentUserActivitiesAction();
      if (!result.success || !result.data) return;

      const { todayPlan } = result.data;
      if (!todayPlan) return;

      // Check if Meal Plan is ready notification needs to be sent
      const planKey = `notif_plan_ready_${todayPlan.id}`;
      addNotification(
        "plan_ready",
        "Meal Plan AI Siap!",
        "AI telah berhasil menyusun rencana makan sehat harianmu sesuai budget.",
        planKey,
        userId
      );

      // Check each meal item status
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
      const hour = today.getHours();

      todayPlan.items.forEach((item: any) => {
        // Status updates: READY
        if (item.status === "READY") {
          const readyKey = `notif_order_ready_${item.id}_READY`;
          addNotification(
            "order_ready",
            "Pesanan Siap Diambil! 📍",
            `Menu ${item.menuName} di ${item.vendorName} sudah siap diambil. Silakan tunjukkan barcode di kasir.`,
            readyKey,
            userId
          );
        }

        // Status updates: DELIVERED
        if (item.status === "DELIVERED") {
          const deliveredKey = `notif_order_delivered_${item.id}_DELIVERED`;
          addNotification(
            "order_ready",
            "Pesanan Telah Diantar! 🚚",
            `Pesanan ${item.menuName} dari ${item.vendorName} telah berhasil diantarkan ke alamatmu.`,
            deliveredKey,
            userId
          );
        }

        // Meal reminders based on current hour
        let mealWindowType: string | null = null;
        if (hour >= 7 && hour < 9) {
          mealWindowType = "BREAKFAST";
        } else if (hour >= 12 && hour < 14) {
          mealWindowType = "LUNCH";
        } else if (hour >= 18 && hour < 20) {
          mealWindowType = "DINNER";
        }

        if (mealWindowType && item.mealType === mealWindowType) {
          const reminderKey = `notif_meal_reminder_${dateStr}_${mealWindowType}`;
          const label = MEAL_LABELS[mealWindowType] || "Makan";
          addNotification(
            "meal_reminder",
            `Pengingat ${label}`,
            `Waktunya menikmati hidangan ${item.menuName} sehatmu dari ${item.vendorName}!`,
            reminderKey,
            userId
          );
        }
      });
    };

    // Run checks
    checkDailyTip();
    checkActivities();

    // Check periodically every 15 seconds
    const interval = setInterval(() => {
      checkActivities();
    }, 15000);

    return () => clearInterval(interval);
  }, [pathname, userId]); // Also run whenever route or user session changes

  return null; // This component doesn't render anything
}
