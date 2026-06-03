"use client";

import React, { useState } from "react";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Store, ArrowRight, Loader2, ChefHat } from "lucide-react";
import { signIn } from "next-auth/react";
import { registerVendor } from "@/app/actions/vendor-actions";

export default function VendorRegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await registerVendor({ email, name, vendorName, password });
      
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Account created but sign in failed. Please try logging in.");
        return;
      }

      if (result?.ok) {
        router.push("/vendor/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12 overflow-hidden bg-[#F8F9FA]">
      {/* Decorative Elements */}
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#B0F1CC]/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#2D6A4F]/10 rounded-full blur-3xl pointer-events-none"></div>

      <main className="w-full max-w-[480px] z-10 fade-in">
        {/* Header Section */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 bg-[#0F5238] rounded-2xl flex items-center justify-center text-white mb-4 shadow-xl shadow-[#0F5238]/20">
            <ChefHat size={32} />
          </div>
          <h1 className="text-3xl font-bold text-[#191C1D] tracking-tight">
            Partner with Mealit
          </h1>
          <p className="text-[#404943] mt-2 max-w-[320px]">
            Grow your business by providing healthy and affordable meals to thousands.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white p-8 rounded-[24px] shadow-sm border border-[#E1E3E4]">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#404943] px-1">
                Owner Full Name
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#707973] w-5 h-5 transition-colors group-focus-within:text-[#0F5238]" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-[#F3F4F5] border-none rounded-xl focus:ring-2 focus:ring-[#0F5238] transition-all text-[#191C1D] placeholder:text-[#707973]/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#404943] px-1">
                Vendor / Restaurant Name
              </label>
              <div className="relative group">
                <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-[#707973] w-5 h-5 transition-colors group-focus-within:text-[#0F5238]" />
                <input
                  type="text"
                  placeholder="Healthy Harvest Kitchen"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-[#F3F4F5] border-none rounded-xl focus:ring-2 focus:ring-[#0F5238] transition-all text-[#191C1D] placeholder:text-[#707973]/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#404943] px-1">
                Business Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#707973] w-5 h-5 transition-colors group-focus-within:text-[#0F5238]" />
                <input
                  type="email"
                  placeholder="business@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-[#F3F4F5] border-none rounded-xl focus:ring-2 focus:ring-[#0F5238] transition-all text-[#191C1D] placeholder:text-[#707973]/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#404943] px-1">
                Secure Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#707973] w-5 h-5 transition-colors group-focus-within:text-[#0F5238]" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-[#F3F4F5] border-none rounded-xl focus:ring-2 focus:ring-[#0F5238] transition-all text-[#191C1D] placeholder:text-[#707973]/50"
                  required
                />
              </div>
            </div>

            <Button
              variant="primary"
              size="full"
              type="submit"
              disabled={loading}
              className="py-4 rounded-xl shadow-lg border-none hover:shadow-xl bg-[#0F5238] text-white font-bold text-lg group mt-2"
            >
              {loading ? (
                <Loader2 className="animate-spin w-6 h-6" />
              ) : (
                <span className="flex items-center justify-center">
                  Register as Vendor
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-[#EDEEEF] text-center">
            <p className="text-sm font-medium text-[#404943]">
              Already a partner?{" "}
              <Link href="/vendor/login" className="text-[#0F5238] font-bold hover:underline ml-1">
                Sign in to Dashboard
              </Link>
            </p>
          </div>
        </div>

        {/* Simple Footer */}
        <p className="mt-12 text-center text-xs font-medium text-[#707973] uppercase tracking-widest">
          © 2024 Mealit for Business
        </p>
      </main>
    </div>
  );
}
