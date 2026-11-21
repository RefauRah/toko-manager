"use client";

import { useEffect, useState } from "react";
import { Wallet, Plus, Calendar, X, Tag } from "lucide-react";
import { formatRupiah, formatDateIndo, formatLocalDate } from "@/lib/format";

export default function PengeluaranPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [selectedCat, setSelectedCat] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    amount: "",
    category_id: "",
    description: "",
    expense_date: formatLocalDate(),
  });

  useEffect(() => {
    loadExpenses();
    loadCategories();
  }, [selectedCat]);

  async function loadExpenses() {
    try {
      const res = await fetch(`/api/expenses?categoryId=${selectedCat}`);
      const json = await res.json();
      setExpenses(json.expenses || []);
      setTotalAmount(json.totalAmount || 0);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadCategories() {
    try {
      const res = await fetch("/api/expenses/categories");
      const json = await res.json();
      setCategories(json.categories || []);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleAddExpense(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Gagal menyimpan pengeluaran");

      setShowAddModal(false);
      setFormData({
        amount: "",
        category_id: "",
        description: "",
        expense_date: formatLocalDate(),
      });
      loadExpenses();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Pengeluaran Operasional Toko
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Catat semua beban rutin harian dan bulanan seperti listrik, sewa tempat, bensin, dan perlengkapan
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Biaya Baru</span>
        </button>
      </div>

      {/* Summary Card & Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm sm:col-span-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Total Pengeluaran
          </span>
          <h3 className="text-2xl font-black text-rose-600 mt-2">
            {formatRupiah(totalAmount)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            {expenses.length} catatan pengeluaran operasional
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm sm:col-span-2 flex items-center">
          <div className="w-full">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Filter Kategori Biaya:
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCat("")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedCat === ""
                    ? "bg-rose-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Semua Kategori
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCat(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    selectedCat === c.id
                      ? "bg-rose-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Keterangan Biaya</th>
                <th className="py-3.5 px-4">Dicatat Oleh</th>
                <th className="py-3.5 px-4 text-right">Jumlah Biaya</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Belum ada catatan pengeluaran
                  </td>
                </tr>
              ) : (
                expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-medium text-slate-600">
                      {formatDateIndo(e.expense_date)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {e.category_name || "Lain-lain"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {e.description}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {e.creator_name || "Owner"}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-rose-600">
                      {formatRupiah(e.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-base text-slate-900">
                Catat Pengeluaran Baru
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Jumlah Biaya (Rp) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="350000"
                  className="w-full px-3 py-2 text-sm font-bold text-rose-600 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Kategori Biaya
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-rose-500"
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Keterangan Pengeluaran *
                </label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Misal: Token listrik toko 200rb"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tanggal Pengeluaran
                </label>
                <input
                  type="date"
                  required
                  value={formData.expense_date}
                  onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md transition disabled:opacity-50 mt-4"
              >
                {loading ? "Menyimpan..." : "Simpan Pengeluaran"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
