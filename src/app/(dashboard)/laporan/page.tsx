"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileBarChart,
  Calendar,
  Download,
  Printer,
  TrendingUp,
  TrendingDown,
  Sparkles,
  FileSpreadsheet,
} from "lucide-react";
import { formatRupiah } from "@/lib/format";
import * as XLSX from "xlsx";

export default function LaporanPage() {
  const [range, setRange] = useState("this_month");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, [range]);

  async function loadReport() {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/profit-loss?range=${range}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const s = data?.summary || {
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

  function exportToExcel() {
    if (!data) return;

    const rows = [
      ["LAPORAN LABA RUGI TOKO"],
      [`Periode: ${data.startDate} s/d ${data.endDate}`],
      [],
      ["KETERANGAN", "JUMLAH (RP)"],
      ["1. PENDAPATAN PENJUALAN", s.totalRevenue],
      ["2. BEBAN MODAL POKOK (HPP)", -s.totalModalHPP],
      ["LABA KOTOR", s.grossProfit],
      [],
      ["3. BEBAN OPERASIONAL TOKO", ""],
      ...Object.entries(data.expensesByCategory || {}).map(([cat, amt]) => [
        `   - ${cat}`,
        amt,
      ]),
      ["TOTAL BEBAN OPERASIONAL", -s.totalOperationalExpenses],
      [],
      ["4. BEBAN GAJI KARYAWAN", -s.totalSalaries],
      [],
      ["LABA BERSIH AKHIR", s.netProfit],
      ["STATUS TOKO", s.isProfitable ? "UNTUNG" : "RUGI"],
      ["MARGIN KEUNTUNGAN (%)", `${s.profitMargin}%`],
    ];

    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laba Rugi");
    XLSX.writeFile(wb, `Laporan-Laba-Rugi-${data.startDate}-${data.endDate}.xlsx`);
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Laporan Keuangan & Laba Rugi
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Rekap lengkap pendapatan, modal belanja, pengeluaran operasional, dan laba bersih toko
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={exportToExcel}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak PDF</span>
          </button>
        </div>
      </div>

      {/* Range Filter Buttons */}
      <div className="flex items-center space-x-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm text-xs font-semibold no-print">
        {[
          { id: "today", label: "Hari Ini" },
          { id: "7days", label: "7 Hari Terakhir" },
          { id: "30days", label: "30 Hari Terakhir" },
          { id: "this_month", label: "Bulan Berjalan" },
        ].map((r) => (
          <button
            key={r.id}
            onClick={() => setRange(r.id)}
            className={`px-3 py-1.5 rounded-xl transition ${
              range === r.id
                ? "bg-indigo-600 text-white shadow-sm font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Main Income Statement Document */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6 max-w-4xl mx-auto">
        {/* Document Header */}
        <div className="text-center border-b border-slate-200 pb-5">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            Laporan Keuangan Resmi
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-2">
            LAPORAN LABA RUGI KOMPREHENSIF
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Periode: {data?.startDate} s/d {data?.endDate}
          </p>
        </div>

        {/* Financial Breakdown Table */}
        <div className="space-y-4 text-xs">
          {/* Section 1: Revenue */}
          <div>
            <div className="flex justify-between py-2 border-b border-slate-100 font-extrabold text-slate-900 text-sm">
              <span>1. PENDAPATAN PENJUALAN TOKO</span>
              <span className="text-emerald-600">{formatRupiah(s.totalRevenue)}</span>
            </div>
            <p className="text-[11px] text-slate-400 py-1 pl-4">
              Total dari {s.transactionCount} transaksi kasir
            </p>
          </div>

          {/* Section 2: HPP Modal */}
          <div>
            <div className="flex justify-between py-2 border-b border-slate-100 font-extrabold text-slate-900 text-sm">
              <span>2. HARGA POKOK PENJUALAN (MODAL BELANJA BARANG)</span>
              <span className="text-slate-700">({formatRupiah(s.totalModalHPP)})</span>
            </div>
            <p className="text-[11px] text-slate-400 py-1 pl-4">
              Modal belanja barang yang terjual pada periode ini
            </p>
          </div>

          {/* Subtotal: Gross Profit */}
          <div className="bg-slate-50 p-3 rounded-xl flex justify-between font-extrabold text-slate-900 text-sm border border-slate-200">
            <span>LABA KOTOR USAHA</span>
            <span className="text-indigo-600">{formatRupiah(s.grossProfit)}</span>
          </div>

          {/* Section 3: Operational Expenses */}
          <div className="pt-2">
            <div className="flex justify-between py-2 border-b border-slate-100 font-extrabold text-slate-900 text-sm">
              <span>3. BEBAN OPERASIONAL HARIAN / BULANAN</span>
              <span className="text-rose-600">({formatRupiah(s.totalOperationalExpenses)})</span>
            </div>
            <div className="py-2 pl-4 space-y-1.5 text-slate-600">
              {Object.keys(data?.expensesByCategory || {}).length === 0 ? (
                <p className="text-[11px] text-slate-400">Tidak ada beban operasional tercatat</p>
              ) : (
                Object.entries(data?.expensesByCategory || {}).map(([cat, amt]: any) => (
                  <div key={cat} className="flex justify-between text-xs">
                    <span>• {cat}</span>
                    <span>{formatRupiah(amt)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section 4: Employee Salaries */}
          <div>
            <div className="flex justify-between py-2 border-b border-slate-100 font-extrabold text-slate-900 text-sm">
              <span>4. BEBAN GAJI & UANG LEMBUR KARYAWAN</span>
              <span className="text-rose-600">({formatRupiah(s.totalSalaries)})</span>
            </div>
            <p className="text-[11px] text-slate-400 py-1 pl-4">
              Total gaji pokok & lembur yang telah dibayarkan
            </p>
          </div>

          {/* Total Expenses */}
          <div className="flex justify-between py-2 border-t border-slate-200 font-bold text-slate-600">
            <span>TOTAL BEBAN USAHA (OPERASIONAL + GAJI)</span>
            <span className="text-rose-600">{formatRupiah(s.totalAllExpenses)}</span>
          </div>

          {/* Grand Net Profit Final Card */}
          <div
            className={`p-5 rounded-2xl border-2 flex items-center justify-between text-white shadow-lg ${
              s.isProfitable
                ? "bg-gradient-to-r from-emerald-600 to-teal-700 border-emerald-500"
                : "bg-gradient-to-r from-rose-600 to-red-700 border-rose-500"
            }`}
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                LABA BERSIH AKHIR (NET PROFIT)
              </span>
              <h3 className="text-2xl font-black mt-1">{formatRupiah(s.netProfit)}</h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                Margin Bersih: {s.profitMargin}%
              </p>
            </div>

            <div className="text-right">
              <span
                className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm ${
                  s.isProfitable ? "bg-white text-emerald-700" : "bg-white text-rose-700"
                }`}
              >
                {s.isProfitable ? "✅ TOKO SEDANG UNTUNG" : "⚠️ TOKO SEDANG RUGI"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
