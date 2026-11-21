"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Wallet,
  Users,
  AlertTriangle,
  ArrowRight,
  Package,
  Calendar,
  Sparkles,
  Megaphone,
} from "lucide-react";
import { formatRupiah } from "@/lib/format";

export default function DashboardPage() {
  const [range, setRange] = useState("this_month");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, [range]);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/profit-loss?range=${range}`);
      const json = await res.json();
      setData(json);

      const annRes = await fetch("/api/admin/announcements");
      const annJson = await annRes.json();
      setAnnouncements(annJson.announcements || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const summary = data?.summary || {
    totalRevenue: 0,
    totalModalHPP: 0,
    grossProfit: 0,
    totalOperationalExpenses: 0,
    totalSalaries: 0,
    totalAllExpenses: 0,
    netProfit: 0,
    isProfitable: true,
    profitMargin: "0.0",
    transactionCount: 0,
  };

  return (
    <div className="space-y-6">
      {/* Platform Announcements */}
      {announcements.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3 text-amber-900 shadow-sm">
          <Megaphone className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-xs uppercase tracking-wider text-amber-800">
              Pengumuman Platform: {announcements[0].title}
            </h4>
            <p className="text-xs text-amber-700 mt-0.5">{announcements[0].message}</p>
          </div>
        </div>
      )}

      {/* Top Header & Range Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Dashboard Keuangan Toko
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pantau arus kas harian, modal belanja barang, dan status laba bersih secara real-time
          </p>
        </div>

        {/* Range Buttons */}
        <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm text-xs font-semibold">
          {[
            { id: "today", label: "Hari Ini" },
            { id: "7days", label: "7 Hari" },
            { id: "30days", label: "30 Hari" },
            { id: "this_month", label: "Bulan Ini" },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={`px-3 py-1.5 rounded-lg transition ${
                range === r.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/pos"
          className="flex items-center justify-between p-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-sm shadow-indigo-100 transition group"
        >
          <div className="flex items-center space-x-2.5">
            <ShoppingCart className="w-5 h-5 text-indigo-200" />
            <span className="font-bold text-xs">Buka Kasir (POS)</span>
          </div>
          <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 transition" />
        </Link>

        <Link
          href="/produk"
          className="flex items-center justify-between p-3.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-sm transition text-slate-700 group"
        >
          <div className="flex items-center space-x-2.5">
            <Package className="w-5 h-5 text-slate-500" />
            <span className="font-bold text-xs">Kelola Stok & Modal</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
        </Link>

        <Link
          href="/pengeluaran"
          className="flex items-center justify-between p-3.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-sm transition text-slate-700 group"
        >
          <div className="flex items-center space-x-2.5">
            <Wallet className="w-5 h-5 text-slate-500" />
            <span className="font-bold text-xs">Catat Pengeluaran</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
        </Link>

        <Link
          href="/laporan"
          className="flex items-center justify-between p-3.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-sm transition text-slate-700 group"
        >
          <div className="flex items-center space-x-2.5">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <span className="font-bold text-xs">Rekap Laba Rugi</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
        </Link>
      </div>

      {/* Main Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pendapatan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Pendapatan
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 mt-2">
            {formatRupiah(summary.totalRevenue)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Dari {summary.transactionCount} transaksi kasir
          </p>
        </div>

        {/* Card 2: Modal Belanja Barang (HPP) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Modal Barang (HPP)
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 mt-2">
            {formatRupiah(summary.totalModalHPP)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Laba kotor: {formatRupiah(summary.grossProfit)}
          </p>
        </div>

        {/* Card 3: Biaya Operasional & Gaji */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Biaya Toko
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 mt-2">
            {formatRupiah(summary.totalAllExpenses)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Operasional {formatRupiah(summary.totalOperationalExpenses)} • Gaji {formatRupiah(summary.totalSalaries)}
          </p>
        </div>

        {/* Card 4: LABA BERSIH & STATUS UNTUNG / RUGI */}
        <div
          className={`p-5 rounded-2xl border shadow-sm relative overflow-hidden ${
            summary.isProfitable
              ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-400"
              : "bg-gradient-to-br from-rose-500 to-red-600 text-white border-rose-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
              Laba Bersih Toko
            </span>
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                summary.isProfitable
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "bg-white text-rose-700 shadow-sm"
              }`}
            >
              {summary.isProfitable ? "✅ TOKO UNTUNG" : "⚠️ TOKO RUGI"}
            </span>
          </div>
          <h3 className="text-2xl font-black mt-2">
            {formatRupiah(summary.netProfit)}
          </h3>
          <p className="text-[11px] text-emerald-100 mt-1">
            Margin Keuntungan: {summary.profitMargin}%
          </p>
        </div>
      </div>

      {/* Grid: Low Stock Alert & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-sm text-slate-900">
                Peringatan Stok Menipis
              </h3>
            </div>
            <Link href="/produk" className="text-xs text-indigo-600 hover:underline font-semibold">
              Lihat Semua Stok
            </Link>
          </div>

          {data?.lowStockProducts?.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              🎉 Semua stok barang dalam kondisi aman.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {data?.lowStockProducts?.map((p: any) => (
                <div key={p.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{p.name}</p>
                    <p className="text-[11px] text-slate-400">
                      Harga Jual: {formatRupiah(p.selling_price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-rose-100 text-rose-700">
                      Sisa {p.stock_quantity} unit
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Min. {p.min_stock_alert}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Selling Products */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900">
                Barang Paling Laris
              </h3>
            </div>
            <Link href="/transaksi" className="text-xs text-indigo-600 hover:underline font-semibold">
              Riwayat Transaksi
            </Link>
          </div>

          {data?.topProducts?.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              Belum ada data penjualan pada periode ini.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {data?.topProducts?.map((item: any, idx: number) => (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-extrabold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{item.product_name}</p>
                      <p className="text-[11px] text-slate-400">
                        {item.total_sold} unit terjual
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-800">
                      {formatRupiah(item.total_sales)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
