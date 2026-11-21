"use client";

import { useEffect, useState } from "react";
import { TrendingUp, DollarSign, CreditCard, Sparkles } from "lucide-react";
import { formatRupiah, formatDateIndo } from "@/lib/format";

export default function AdminRevenuePage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    loadRevenue();
  }, []);

  async function loadRevenue() {
    try {
      const res = await fetch("/api/admin/revenue");
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    }
  }

  const rm = data?.revenueMetrics || {
    totalRevenueLifetime: 0,
    proRevenue: 0,
    enterpriseRevenue: 0,
    mrr: 0,
    arr: 0,
    activeProStores: 0,
    activeEnterpriseStores: 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Revenue Platform & Recurring Income
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Analisis pendapatan berlangganan dari seluruh client toko (MRR & ARR SaaS)
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Monthly Recurring Revenue (MRR)
          </span>
          <h3 className="text-2xl font-black text-amber-400 mt-2">
            {formatRupiah(rm.mrr)}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Pendapatan bulanan rutin</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Annual Run Rate (ARR)
          </span>
          <h3 className="text-2xl font-black text-emerald-400 mt-2">
            {formatRupiah(rm.arr)}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Estimasi proyeksi tahunan</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Subscriber Paket Pro
          </span>
          <h3 className="text-2xl font-black text-indigo-400 mt-2">
            {rm.activeProStores} Toko
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Rp 25.000 / toko / bulan</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Subscriber Enterprise
          </span>
          <h3 className="text-2xl font-black text-purple-400 mt-2">
            {rm.activeEnterpriseStores} Toko
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Rp 249.000 / toko / bulan</p>
        </div>
      </div>

      {/* Confirmed Payments Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-white">
          Riwayat Pembayaran Berhasil Masuk (Revenue History)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-800/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3 px-4">Toko Client</th>
                <th className="py-3 px-4">Paket</th>
                <th className="py-3 px-4 text-right">Nominal</th>
                <th className="py-3 px-4">Masa Aktif</th>
                <th className="py-3 px-4">Tanggal Pembayaran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {data?.confirmedPayments?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    Belum ada riwayat pembayaran yang disetujui
                  </td>
                </tr>
              ) : (
                data?.confirmedPayments?.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-bold text-white">{p.store_name}</td>
                    <td className="py-3 px-4">
                      <span className="uppercase text-amber-400 font-bold">{p.tier}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-black text-emerald-400">
                      {formatRupiah(p.amount)}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {p.period_start} s/d {p.period_end}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {formatDateIndo(p.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
