"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Store, ShieldCheck, ArrowRight, Sparkles, User, ShoppingBag } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal masuk");
      }

      if (data.isPlatformAdmin && !data.store) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function setDemoAccount(em: string, pw: string) {
    setEmail(em);
    setPassword(pw);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 mb-4">
          <Store className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Masuk ke TokoManager
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Sistem manajemen keuangan, kasir POS & hitung laba bersih otomatis
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@toko.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-white font-semibold bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 transition disabled:opacity-50"
            >
              <span>{loading ? "Memproses..." : "Masuk ke Akun"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Logins for Testing */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
              ⚡ Akun Demo Siap Pakai:
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setDemoAccount("owner@toko.com", "Toko123!")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-left transition group text-xs"
              >
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-indigo-600" />
                  <div>
                    <p className="font-bold text-slate-800">Owner Toko (Demo Pro)</p>
                    <p className="text-[11px] text-slate-400">owner@toko.com</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                  Paket Pro
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDemoAccount("kasir@toko.com", "Toko123!")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-left transition group text-xs"
              >
                <div className="flex items-center space-x-2">
                  <ShoppingBag className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="font-bold text-slate-800">Kasir Toko (Staff)</p>
                    <p className="text-[11px] text-slate-400">kasir@toko.com</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  Kasir Role
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDemoAccount("admin@tokomanager.com", "Admin12345!")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-900 bg-slate-900 text-white hover:bg-slate-800 text-left transition text-xs"
              >
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <div>
                    <p className="font-bold text-amber-400">Super Admin (Penyedia Layanan)</p>
                    <p className="text-[11px] text-slate-400">admin@tokomanager.com</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-400 text-slate-900">
                  Manage Client
                </span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Belum punya akun toko?{" "}
            <Link href="/register" className="font-bold text-indigo-600 hover:text-indigo-700 underline">
              Daftar Toko Gratis
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
