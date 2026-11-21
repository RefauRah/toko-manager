"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  LayoutDashboard,
  Store,
  CreditCard,
  TrendingUp,
  Megaphone,
  Settings,
  ArrowLeft,
} from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard Platform", href: "/admin", icon: LayoutDashboard },
    { label: "Manajemen Toko (Client)", href: "/admin/stores", icon: Store },
    { label: "Konfirmasi Pembayaran", href: "/admin/payments", icon: CreditCard },
    { label: "Revenue & Subscription", href: "/admin/revenue", icon: TrendingUp },
    { label: "Pengumuman / Broadcast", href: "/admin/announcements", icon: Megaphone },
    { label: "Pengaturan Platform", href: "/admin/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 shrink-0 no-print border-r border-slate-800">
      {/* Admin Brand */}
      <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold border border-amber-500/30">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-bold text-white text-sm leading-tight">Admin Platform</h2>
          <span className="text-[11px] text-amber-400 font-semibold uppercase tracking-wider">
            Penyedia Layanan
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-amber-500/10 text-amber-400 font-semibold border-r-2 border-amber-400"
                  : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-amber-400" : "text-slate-400"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Switch back to Store Dashboard */}
      <div className="p-3 border-t border-slate-800">
        <Link
          href="/dashboard"
          className="flex items-center justify-center space-x-2 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Toko Demo</span>
        </Link>
      </div>
    </aside>
  );
}
