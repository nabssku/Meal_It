"use client";

import React from "react";
import { Search, Bell, Menu as MenuIcon, User } from "lucide-react";

export default function VendorTopBar({ title }: { title: string }) {
  return (
    <header className="h-16 w-full flex items-center justify-between px-6 bg-white border-b border-[#E1E3E4] z-30">
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 rounded-full hover:bg-[#F3F4F5] text-[#0F5238]">
          <MenuIcon size={24} />
        </button>
        <h1 className="text-xl font-bold text-[#191C1D]">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden lg:flex items-center bg-[#F3F4F5] rounded-full px-4 py-2 border border-transparent focus-within:border-[#0F5238] focus-within:bg-white transition-all w-64">
          <Search size={18} className="text-[#707973]" />
          <input 
            type="text" 
            placeholder="Search orders..." 
            className="bg-transparent border-none focus:ring-0 text-sm w-full font-medium placeholder:text-[#707973]/60"
          />
        </div>

        {/* Notifications */}
        <button className="p-2 ml-2 rounded-full text-[#404943] hover:bg-[#F3F4F5] transition-all relative group">
          <Bell size={22} />
          <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Mobile Profile */}
        <div className="md:hidden w-9 h-9 rounded-full bg-[#E1E3E4] border border-[#707973]/20 flex items-center justify-center text-[#0F5238]">
          <User size={18} />
        </div>
      </div>
    </header>
  );
}
