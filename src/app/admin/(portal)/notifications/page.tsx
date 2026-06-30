import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getActiveSubscribersCountAction } from "@/app/actions/push-actions";
import { Bell, ShieldAlert, Users, Send } from "lucide-react";
import NotificationFormClient from "./NotificationFormClient";

export default async function AdminNotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  // Fetch users for target dropdown
  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true },
  });

  // Fetch push subscriber stats
  const statsResult = await getActiveSubscribersCountAction();
  const totalSubscribers = statsResult.success ? statsResult.total : 0;
  const uniqueUsersCount = statsResult.success ? statsResult.uniqueUsers : 0;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#191C1D] flex items-center gap-2">
          <Bell className="text-[#0F5238]" size={24} />
          Manajemen Push Notifikasi
        </h2>
        <p className="text-[#707973] text-sm font-medium mt-1">
          Kirim notifikasi push broadcast ke seluruh perangkat terdaftar atau kirim secara personal ke user tertentu.
        </p>
      </div>

      {/* Subscription Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-[#E1E3E4] p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#0F5238]/5 text-[#0F5238] flex items-center justify-center">
            <Bell size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#191C1D]">{totalSubscribers}</p>
            <p className="text-xs font-semibold text-[#707973] mt-0.5">Total Perangkat Terdaftar</p>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl border border-[#E1E3E4] p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#191C1D]">{uniqueUsersCount}</p>
            <p className="text-xs font-semibold text-[#707973] mt-0.5">User Aktif Berlangganan</p>
          </div>
        </div>
      </div>

      {/* Notification Sender Form Client */}
      <div className="bg-white rounded-3xl border border-[#E1E3E4] overflow-hidden shadow-sm p-6 md:p-8">
        <h3 className="text-lg font-bold text-[#191C1D] mb-6 flex items-center gap-2 pb-3 border-b border-[#F3F4F5]">
          <Send size={18} className="text-[#0F5238]" />
          Buat Notifikasi Baru
        </h3>
        
        <NotificationFormClient users={users} />
      </div>
    </div>
  );
}
