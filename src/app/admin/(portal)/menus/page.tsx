import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Utensils, Eye, EyeOff } from "lucide-react";

export default async function AdminMenusPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const menus = await prisma.menu.findMany({
    orderBy: { name: "asc" },
    include: { vendor: { select: { name: true } } },
    take: 100,
  });

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#191C1D]">Manajemen Menu</h2>
        <p className="text-[#707973] text-sm font-medium mt-1">{menus.length} menu terdaftar</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Total Menu", value: menus.length, color: "bg-blue-50 text-blue-600" },
          { label: "Tersedia", value: menus.filter(m => m.isAvailable).length, color: "bg-green-50 text-green-600" },
          { label: "Tidak Tersedia", value: menus.filter(m => !m.isAvailable).length, color: "bg-red-50 text-red-500" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-[#E1E3E4] p-5">
            <p className="text-2xl font-bold text-[#191C1D]">{s.value}</p>
            <p className="text-xs font-semibold text-[#707973] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-[#E1E3E4] overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-[#E1E3E4]">
          <h3 className="font-bold text-[#191C1D]">Semua Menu</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F8F9FA]">
              <tr>
                {["Menu", "Vendor", "Harga", "Kalori", "Kategori", "Status"].map(h => (
                  <th key={h} className="px-6 py-3.5 text-left text-xs font-bold text-[#707973] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F5]">
              {menus.map((menu) => (
                <tr key={menu.id} className="hover:bg-[#F8F9FA] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {menu.image ? (
                        <img src={menu.image} alt="" className="w-10 h-10 rounded-xl object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-[#F3F4F5] flex items-center justify-center text-[#707973]">
                          <Utensils size={16} />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-[#191C1D]">{menu.name}</p>
                        <p className="text-xs text-[#707973] max-w-[160px] truncate">{menu.description || "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#707973] font-medium">{menu.vendor.name}</td>
                  <td className="px-6 py-4 text-sm font-bold text-[#191C1D]">Rp {menu.price.toLocaleString("id-ID")}</td>
                  <td className="px-6 py-4 text-sm text-[#707973]">{menu.calories} kcal</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-[#F3F4F5] text-[#404943]">
                      {menu.category || "Umum"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${menu.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {menu.isAvailable ? <Eye size={10} /> : <EyeOff size={10} />}
                      {menu.isAvailable ? "Tersedia" : "Sembunyikan"}
                    </span>
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
