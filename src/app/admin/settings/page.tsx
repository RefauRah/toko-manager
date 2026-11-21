"use client";

import { useEffect, useState } from "react";
import { Settings, Save, CheckCircle2, Building2 } from "lucide-react";

export default function AdminSettingsPage() {
  const [bankAccounts, setBankAccounts] = useState<any[]>([
    { bank: "BCA", number: "8830192811", holder: "PT TOKO MANAGER NUSANTARA" },
    { bank: "Mandiri", number: "1370019283719", holder: "PT TOKO MANAGER NUSANTARA" },
    { bank: "BRI", number: "034101000987301", holder: "PT TOKO MANAGER NUSANTARA" },
  ]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const res = await fetch("/api/admin/settings");
      const json = await res.json();
      if (json.settings?.bank_accounts) {
        setBankAccounts(json.settings.bank_accounts);
      }
    } catch (e) {
      console.error(e);
    }
  }

  function updateBank(index: number, field: string, val: string) {
    const updated = [...bankAccounts];
    updated[index][field] = val;
    setBankAccounts(updated);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "bank_accounts",
          value: bankAccounts,
        }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan");
      setSuccessMsg("Rekening transfer platform berhasil diperbarui!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Pengaturan Master Platform
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Kelola nomor rekening bank untuk menerima transfer biaya subscription dari pemilik toko
        </p>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-sm space-y-6">
        <h3 className="font-bold text-sm text-white flex items-center space-x-2">
          <Building2 className="w-4 h-4 text-amber-400" />
          <span>Nomor Rekening Bank Pembayaran Subscription</span>
        </h3>

        {successMsg && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {bankAccounts.map((b, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-3"
            >
              <span className="font-bold text-amber-400">Rekening #{idx + 1}</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Nama Bank</label>
                  <input
                    type="text"
                    value={b.bank}
                    onChange={(e) => updateBank(idx, "bank", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Nomor Rekening</label>
                  <input
                    type="text"
                    value={b.number}
                    onChange={(e) => updateBank(idx, "number", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Atas Nama (Pemilik)</label>
                  <input
                    type="text"
                    value={b.holder}
                    onChange={(e) => updateBank(idx, "holder", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition shadow-md flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? "Menyimpan..." : "Simpan Rekening Bank"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
