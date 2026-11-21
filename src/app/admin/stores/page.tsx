"use client";

import { useEffect, useState } from "react";
import {
  Store,
  Search,
  ShieldAlert,
  ShieldCheck,
  Edit2,
  X,
} from "lucide-react";
import { formatRupiah, formatDateIndo } from "@/lib/format";

export default function AdminStoresPage() {
  const [stores, setStores] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState("all");
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [newTier, setNewTier] = useState("pro");
  const [days, setDays] = useState("30");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStores();
  }, [search, tier]);

  async function loadStores() {
    try {
      const res = await fetch(`/api/admin/stores?search=${search}&tier=${tier}`);
      const json = await res.json();
      setStores(json.stores || []);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleToggleSuspend(storeId: string, currentSuspended: boolean) {
    const action = currentSuspended ? "unsuspend" : "suspend";
    if (!confirm(`Apakah Anda yakin ingin ${action} toko ini?`)) return;

    try {
      const res = await fetch("/api/admin/stores", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ store_id: storeId, action }),
      });
      const json = await res.json();
      alert(json.message);
      loadStores();
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function handleChangeTierSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStore) return;
    setLoading(true);

    try {
      const res = await fetch("/api/admin/stores", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store_id: selectedStore.id,
          action: "change_tier",
          tier: newTier,
          days: Number(days),
        }),
      });
      const json = await res.json();
      alert(json.message);
      setSelectedStore(null);
      loadStores();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Manajemen Client & Toko
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Kelola seluruh toko pengguna platform, ubah status subscription secara manual, atau suspend akun
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-slate-900 p-3.5 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama toko client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <select
          value={tier}
          onChange={(e) => setTier(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="all">Semua Tier</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-800/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3.5 px-4">Nama Toko</th>
                <th className="py-3.5 px-4">Owner Toko</th>
                <th className="py-3.5 px-4 text-center">Produk</th>
                <th className="py-3.5 px-4 text-center">Transaksi</th>
                <th className="py-3.5 px-4 text-center">Tier</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi Master</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {stores.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Tidak ada toko client ditemukan
                  </td>
                </tr>
              ) : (
                stores.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-white">{st.name}</p>
                      <p className="text-[10px] text-slate-500">{st.address || "Indonesia"}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-200">{st.owner_name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{st.owner_email}</p>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-300">
                      {st.products_count}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-300">
                      {st.transactions_count}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          st.subscription_tier === "enterprise"
                            ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                            : st.subscription_tier === "pro"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                      >
                        {st.subscription_tier}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {st.is_suspended ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          Suspended
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Aktif
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => setSelectedStore(st)}
                          title="Ubah Tier Manual"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleToggleSuspend(st.id, Boolean(st.is_suspended))}
                          title={st.is_suspended ? "Unsuspend Toko" : "Suspend Toko"}
                          className={`p-1.5 rounded-lg transition ${
                            st.is_suspended
                              ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                              : "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                          }`}
                        >
                          {st.is_suspended ? (
                            <ShieldCheck className="w-3.5 h-3.5" />
                          ) : (
                            <ShieldAlert className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Tier Change Modal */}
      {selectedStore && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-800 space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-white">Ubah Tier Toko Manual</h3>
                <p className="text-xs text-amber-400 font-semibold">{selectedStore.name}</p>
              </div>
              <button onClick={() => setSelectedStore(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangeTierSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Pilih Paket Baru</label>
                <select
                  value={newTier}
                  onChange={(e) => setNewTier(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                >
                  <option value="free">Free (Gratis)</option>
                  <option value="pro">Pro (Rp 25.000/bln)</option>
                  <option value="enterprise">Enterprise (Rp 249.000/bln)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Masa Aktif (Hari)</label>
                <input
                  type="number"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold transition disabled:opacity-50 mt-4"
              >
                {loading ? "Menyimpan..." : "Update Tier Toko"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
