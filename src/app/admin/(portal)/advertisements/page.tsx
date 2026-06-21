import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Megaphone, CheckCircle2, XCircle, Eye } from "lucide-react";

export default async function AdminAdsPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const ads = await prisma.advertisement.findMany({
    orderBy: { createdAt: "desc" },
    include: { vendor: { select: { name: true, plan: true } } },
  });

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#191C1D]">Manajemen Iklan</h2>
        <p className="text-[#707973] text-sm font-medium mt-1">{ads.length} iklan terdaftar</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Iklan", value: ads.length, color: "bg-purple-50 text-purple-600" },
          { label: "Aktif", value: ads.filter(a => a.isActive).length, color: "bg-green-50 text-green-600" },
          { label: "Nonaktif", value: ads.filter(a => !a.isActive).length, color: "bg-red-50 text-red-500" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-[#E1E3E4] p-5">
            <p className="text-2xl font-bold text-[#191C1D]">{s.value}</p>
            <p className="text-xs font-semibold text-[#707973] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {ads.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#E1E3E4] p-16 text-center">
          <div className="w-16 h-16 bg-[#F3F4F5] rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Megaphone size={28} className="text-[#707973]" />
          </div>
          <h3 className="font-bold text-[#191C1D] text-lg">Belum Ada Iklan</h3>
          <p className="text-[#707973] text-sm mt-1">Vendor Premium dapat membuat iklan yang tampil di dashboard user.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ads.map((ad) => (
            <div key={ad.id} className="bg-white rounded-3xl border border-[#E1E3E4] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {ad.imageUrl && (
                <div className="aspect-video overflow-hidden bg-[#F3F4F5]">
                  <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-[#191C1D] text-sm leading-snug">{ad.title}</h3>
                  <span className={`inline-flex shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${ad.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                    {ad.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
                <p className="text-xs text-[#707973] mb-3 line-clamp-2">{ad.description || "—"}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0F5238]">{ad.vendor.name}</span>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{ad.vendor.plan}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
