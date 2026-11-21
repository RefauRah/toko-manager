"use client";

import { useRouter } from "next/navigation";
import { LogOut, Bell, User as UserIcon } from "lucide-react";

interface HeaderProps {
  userName?: string;
  storeName?: string;
  tier?: string;
  isAdminArea?: boolean;
}

export function Header({ userName, storeName, tier, isAdminArea }: HeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const today = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10 no-print">
      <div className="flex items-center space-x-3">
        <span className="text-xs text-slate-500 font-medium">{today}</span>
        {isAdminArea && (
          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
            Platform Master Console
          </span>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-right">
          <div className="hidden sm:block">
            <p className="text-xs font-bold text-slate-800 leading-tight">{userName || "Pengguna"}</p>
            <p className="text-[11px] text-slate-500">{storeName || (isAdminArea ? "Administrator" : "Toko")}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
            <UserIcon className="w-4 h-4" />
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Keluar dari akun"
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
