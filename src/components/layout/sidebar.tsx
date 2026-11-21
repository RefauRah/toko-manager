"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Receipt,
  Wallet,
  Users,
  CalendarCheck,
  Banknote,
  FileBarChart,
  Sparkles,
  ShieldCheck,
  Store as StoreIcon,
} from "lucide-react";

interface SidebarProps {
  storeName?: string;
  tier?: string;
  role?: string;
  isPlatformAdmin?: boolean;
}

export function Sidebar({ storeName, tier = "free", role = "owner", isPlatformAdmin }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Kasir (POS)", href: "/pos", icon: ShoppingCart },
    { label: "Produk & Stok", href: "/produk", icon: Package },
    { label: "Riwayat Transaksi", href: "/transaksi", icon: Receipt },
    { label: "Pengeluaran", href: "/pengeluaran", icon: Wallet },
    {
      label: "Karyawan",
      href: "/karyawan",
      icon: Users,
      badge: tier === "free" ? "PRO" : undefined,
    },
    {
      label: "Absensi",
      href: "/karyawan/absensi",
      icon: CalendarCheck,
      badge: tier === "free" ? "PRO" : undefined,
    },
    {
      label: "Gaji & Payroll",
      href: "/karyawan/gaji",
      icon: Banknote,
      badge: tier === "free" ? "PRO" : undefined,
    },
    { label: "Laporan Keuangan", href: "/laporan", icon: FileBarChart },
    {
      label: "Paket Langganan",
      href: "/langganan",
      icon: Sparkles,
      highlight: tier === "free",
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 shrink-0 no-print">
      {/* Brand & Store Info */}
      <div className="p-5 border-b border-slate-100 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
          <StoreIcon className="w-6 h-6" />
        </div>
        <div className="overflow-hidden">
          <h2 className="font-bold text-slate-800 text-sm truncate leading-tight">
            {storeName || "Toko Saya"}
          </h2>
          <div className="flex items-center space-x-1.5 mt-0.5">
            <span
              className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                tier === "enterprise"
                  ? "bg-purple-100 text-purple-700"
                  : tier === "pro"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {tier}
            </span>
            <span className="text-[11px] text-slate-400 capitalize">• {role}</span>
          </div>
        </div>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              } ${item.highlight ? "text-indigo-600 bg-indigo-50/50" : ""}`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-700">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade Banner for Free Tier */}
      {tier === "free" && (
        <div className="p-3 mx-3 mb-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
          <div className="flex items-center space-x-2 text-indigo-900 font-semibold text-xs mb-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Upgrade ke Pro</span>
          </div>
          <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
            Hanya <span className="line-through text-slate-400">Rp 99rb</span>{" "}
            <span className="font-bold text-indigo-600">Rp 25rb/bln</span> untuk akses karyawan & laporan tanpa batas.
          </p>
          <Link
            href="/langganan"
            className="block text-center py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            Upgrade Sekarang
          </Link>
        </div>
      )}

      {/* Super Admin Switcher Link */}
      {isPlatformAdmin && (
        <div className="p-3 border-t border-slate-100 bg-slate-900 text-white">
          <Link
            href="/admin"
            className="flex items-center justify-between px-2 py-1.5 rounded text-xs text-amber-400 hover:text-amber-300 font-semibold"
          >
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Platform Panel</span>
            </div>
            <span className="text-[10px] bg-amber-400/20 px-1 rounded">SUPER</span>
          </Link>
        </div>
      )}
    </aside>
  );
}
