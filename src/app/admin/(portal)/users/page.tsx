import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Users, Search, MoreVertical, UserCheck, UserX, ShieldAlert } from "lucide-react";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const users = await prisma.user.findMany({
    where: { role: "user" },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, name: true, email: true, image: true, createdAt: true, role: true, bodyGoal: true },
  });

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#191C1D]">Manajemen User</h2>
          <p className="text-[#707973] text-sm font-medium mt-1">Total {users.length} pengguna terdaftar</p>
        </div>
        <div className="flex items-center gap-3 bg-white border border-[#E1E3E4] rounded-2xl px-4 py-2.5 shadow-sm">
          <Search size={16} className="text-[#707973]" />
          <span className="text-sm text-[#707973] font-medium">Cari user...</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total User", value: users.length, icon: Users, color: "bg-blue-50 text-blue-600" },
          { label: "Aktif (dgn Goal)", value: users.filter(u => u.bodyGoal).length, icon: UserCheck, color: "bg-green-50 text-green-600" },
          { label: "Belum Setup", value: users.filter(u => !u.bodyGoal).length, icon: UserX, color: "bg-amber-50 text-amber-600" },
          { label: "Superadmin", value: 1, icon: ShieldAlert, color: "bg-purple-50 text-purple-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-[#E1E3E4] p-5">
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon size={18} />
            </div>
            <p className="text-2xl font-bold text-[#191C1D]">{stat.value}</p>
            <p className="text-xs font-semibold text-[#707973] mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-[#E1E3E4] overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-[#E1E3E4] flex items-center justify-between">
          <h3 className="font-bold text-[#191C1D]">Daftar Pengguna</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F8F9FA]">
              <tr>
                {["Pengguna", "Email", "Goal", "Bergabung", "Aksi"].map(h => (
                  <th key={h} className="px-6 py-3.5 text-left text-xs font-bold text-[#707973] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F5]">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-[#F8F9FA] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#0F5238]/10 flex items-center justify-center text-[#0F5238] text-sm font-bold flex-shrink-0">
                        {user.name?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <p className="text-sm font-bold text-[#191C1D]">{user.name || "No Name"}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#707973] font-medium">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${user.bodyGoal ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {user.bodyGoal || "Belum diset"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#707973]">
                    {new Date(user.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-1.5 rounded-lg hover:bg-[#F3F4F5] transition-colors text-[#707973]">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
