"use client";

import { useEffect, useState } from "react";
import { Receipt, Search, Calendar, Eye, X } from "lucide-react";
import { formatRupiah, formatDateTimeIndo } from "@/lib/format";

export default function TransaksiPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTrx, setSelectedTrx] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    loadTransactions();
  }, [search]);

  async function loadTransactions() {
    try {
      const res = await fetch(`/api/transactions?search=${search}`);
      const json = await res.json();
      setTransactions(json.transactions || []);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Riwayat Transaksi Penjualan
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Semua nota penjualan kasir tercatat otomatis beserta detail barang dan kasir
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nomor invoice (misal: INV-202611-0001)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3.5 px-4">No. Invoice</th>
                <th className="py-3.5 px-4">Waktu Transaksi</th>
                <th className="py-3.5 px-4">Kasir</th>
                <th className="py-3.5 px-4">Metode Bayar</th>
                <th className="py-3.5 px-4 text-right">Diskon</th>
                <th className="py-3.5 px-4 text-right">Total Akhir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Belum ada riwayat transaksi
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                      {t.invoice_number}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {formatDateTimeIndo(t.created_at)}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {t.cashier_name || "Kasir"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                        {t.payment_method}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-500">
                      {formatRupiah(t.discount_amount)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                      {formatRupiah(t.final_amount)}
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
