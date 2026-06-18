"use client";

import React, { useState } from "react";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, UserPlus, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { registerUser } from "@/app/actions/auth-actions";

export default function AuthPage() {
  const router = useRouter();
  const [view, setView] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleAuth = () => {
    setView(view === "login" ? "register" : "login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (view === "register") {
        await registerUser({ email, name, password });
      }
      
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error === "CredentialsSignin" ? "Email atau password salah." : result.error);
        return;
      }

      if (result?.ok) {
        // Always go to profile-setup — it will redirect to /dashboard if already completed
        router.push("/profile-setup");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan. Silakan coba lagi.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/profile-setup" });
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12 overflow-hidden bg-background">
      {/* Atmospheric Background Decoration */}
      <div className="fixed top-[-10%] right-[-10%] w-[400px] h-[400px] bg-primary-soft rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-secondary-soft rounded-full blur-3xl pointer-events-none"></div>

      <main className="w-full max-w-[440px] z-10 fade-in">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="/logo.png"
            alt="MEALIT Logo"
            className="h-16 w-auto mb-2 transition-transform duration-300 hover:scale-105"
          />
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight text-center">
            {view === "login" ? "Welcome to Mealit" : "Create Account"}
          </h1>
          <p className="text-muted-foreground mt-1 text-center">
            {view === "login"
              ? "Smart planning for healthy living."
              : "Join thousands of smart home chefs."}
          </p>
        </div>

        {/* Auth Card */}
        <div className="auth-card bg-white">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {view === "register" && (
              <div className="space-y-2">
                <label
                  htmlFor="reg-name"
                  className="text-sm font-semibold text-muted-foreground px-1"
                >
                  Full Name
                </label>
                <input
                  id="reg-name"
                  type="text"
                  placeholder="Alex Chen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-background border-none rounded-xl focus:ring-2 focus:ring-primary transition-all text-foreground placeholder:text-muted-foreground/50"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="auth-email"
                className="text-sm font-semibold text-muted-foreground px-1"
              >
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 transition-colors group-focus-within:text-primary" />
                <input
                  id="auth-email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-background border-none rounded-xl focus:ring-2 focus:ring-primary transition-all text-foreground placeholder:text-muted-foreground/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label
                  htmlFor="auth-password"
                  className="text-sm font-semibold text-muted-foreground"
                >
                  Password
                </label>
                {view === "login" && (
                  <Link
                    href="#"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Forgot?
                  </Link>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 transition-colors group-focus-within:text-primary" />
                <input
                  id="auth-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-background border-none rounded-xl focus:ring-2 focus:ring-primary transition-all text-foreground placeholder:text-muted-foreground/50"
                  required
                />
              </div>
            </div>

            <Button
              variant="primary"
              size="full"
              type="submit"
              disabled={loading}
              className="rounded-xl shadow-lg border-none hover:shadow-xl group"
            >
              {loading ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                <>
                  {view === "login" ? "Sign In" : "Create Account"}
                  {view === "login" ? (
                    <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                  ) : (
                    <UserPlus className="ml-2 w-5 h-5 transition-transform group-hover:scale-110" />
                  )}
                </>
              )}
            </Button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-border/50"></div>
              <span className="flex-shrink mx-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                or continue with
              </span>
              <div className="flex-grow border-t border-border/50"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full bg-white border border-border/50 text-foreground font-semibold py-3 rounded-xl hover:bg-muted/50 transition-colors flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                ></path>
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                ></path>
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                ></path>
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                ></path>
              </svg>
              Google
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-muted-foreground">
            {view === "login" ? "New to Mealit? " : "Already have an account? "}
            <button
              onClick={toggleAuth}
              className="text-primary font-bold hover:underline ml-1"
            >
              {view === "login" ? "Create an account" : "Log in here"}
            </button>
          </p>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center space-y-4">
          <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-widest">
            © 2024 Mealit Inc. All rights reserved.
          </p>
          <div className="flex justify-center items-center gap-4 text-xs font-bold text-muted-foreground/80">
            <Link href="#" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <span className="w-1 h-1 bg-muted-foreground/20 rounded-full"></span>
            <Link href="#" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
