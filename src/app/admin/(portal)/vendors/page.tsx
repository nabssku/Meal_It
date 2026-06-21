import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Store, CheckCircle2, XCircle, Crown, Star } from "lucide-react";

export default async function AdminVendorsPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const vendors = await prisma.vendor.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true, name: true } },
      _count: { select: { menus: true, orders: true } },
    },
    take: 50,
  });

  const totalRevenue = await prisma.order.aggregate({
    where: { status: "COMPLETED" },
    _sum: { totalAmount: true },
  });

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#191C1D]">Manajemen Vendor</h2>
          <p className="text-[#707973] text-sm font-medium mt-1">{vendors.length} vendor terdaftar</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Vendor", value: vendors.length, color: "bg-[#0F5238]/10 text-[#0F5238]", Icon: Store },
          { label: "Aktif", value: vendors.filter(v => v.isActive).length, color: "bg-green-50 text-green-600", Icon: CheckCircle2 },
          { label: "Nonaktif", value: vendors.filter(v => !v.isActive).length, color: "bg-red-50 text-red-500", Icon: XCircle },
          { label: "Premium", value: vendors.filter(v => v.plan === "PREMIUM").length, color: "bg-amber-50 text-amber-600", Icon: Crown },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-[#E1E3E4] p-5">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
              <s.Icon size={18} />
            </div>
            <p className="text-2xl font-bold text-[#191C1D]">{s.value}</p>
            <p className="text-xs font-semibold text-[#707973] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Vendors Table */}
      <div className="bg-white rounded-3xl border border-[#E1E3E4] overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-[#E1E3E4]">
          <h3 className="font-bold text-[#191C1D]">Daftar Vendor</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F8F9FA]">
              <tr>
                {["Vendor", "Pemilik", "Plan", "Menu", "Orders", "Rating", "Status"].map(h => (
                  <th key={h} className="px-6 py-3.5 text-left text-xs font-bold text-[#707973] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F5]">
              {vendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-[#F8F9FA] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {vendor.logo ? (
                        <img src={vendor.logo} alt="" className="w-9 h-9 rounded-xl object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-[#0F5238]/10 flex items-center justify-center text-[#0F5238] text-sm font-bold">
                          {vendor.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-[#191C1D]">{vendor.name}</p>
                        <p className="text-xs text-[#707973]">{vendor.city || "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#707973]">{vendor.user.name || vendor.user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${vendor.plan === "PREMIUM" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                      {vendor.plan === "PREMIUM" && <Crown size={10} />}
                      {vendor.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-[#191C1D]">{vendor._count.menus}</td>
                  <td className="px-6 py-4 text-sm font-bold text-[#191C1D]">{vendor._count.orders}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm font-bold text-amber-500">
                      <Star size={14} className="fill-amber-400" />
                      {vendor.rating.toFixed(1)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${vendor.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {vendor.isActive ? "Aktif" : "Nonaktif"}
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
