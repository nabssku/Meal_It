"use client";

import React, { useState } from "react";
import { Trash2, Loader2, AlertTriangle, X } from "lucide-react";
import { deleteMenuItem } from "@/app/actions/vendor-actions";
import { useRouter } from "next/navigation";

interface DeleteMenuButtonProps {
  menuId: string;
  menuName: string;
}

export default function DeleteMenuButton({ menuId, menuName }: DeleteMenuButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteMenuItem(menuId);
      setShowModal(false);
      router.refresh();
    } catch (err) {
      console.error("Failed to delete menu item:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="p-2 text-[#707973] hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
        title="Hapus menu"
      >
        <Trash2 size={20} />
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-[28px] shadow-2xl p-8 w-full max-w-sm flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 text-[#707973] hover:text-[#191C1D] hover:bg-[#F3F4F5] rounded-xl transition-all"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
                <AlertTriangle size={32} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#191C1D]">Hapus Menu?</h3>
                <p className="text-sm text-[#707973] mt-1">
                  Anda akan menghapus{" "}
                  <span className="font-bold text-[#191C1D]">&ldquo;{menuName}&rdquo;</span>.
                  Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="flex-1 py-3 bg-[#F3F4F5] text-[#404943] rounded-2xl font-bold text-sm hover:bg-[#E1E3E4] transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <Trash2 size={16} />
                    Hapus
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
