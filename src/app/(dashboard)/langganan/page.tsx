"use client";

import { useEffect, useState } from "react";
import {
  Sparkles,
  Check,
  X,
  CreditCard,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { formatRupiah, formatDateIndo } from "@/lib/format";

export default function LanggananPage() {
  const [data, setData] = useState<any>(null);
  const [selectedTier, setSelectedTier] = useState<"pro" | "enterprise">("pro");
  const [formData, setFormData] = useState({
    bank_name: "BCA",
    account_number: "",
    account_holder: "",
    notes: "",
    payment_proof: "Bukti transfer m-banking telah dilampirkan",
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  async function loadSubscriptionData() {
    try {
      const res = await fetch("/api/subscriptions/upgrade");
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleUpgradeSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/subscriptions/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: selectedTier,
          ...formData,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal mengirim konfirmasi");

      setSuccessMsg(json.message);
      loadSubscriptionData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  const currentTier = data?.currentTier || "free";

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
          Pilihan Paket Langganan
        </span>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Tingkatkan Performa Bisnis Toko Anda
        </h1>
        <p className="text-xs text-slate-500 max-w-lg mx-auto">
          Pilih paket yang paling cocok untuk kemudahan operasional, karyawan, dan pantauan laba bersih
        </p>

        {/* Current status banner */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-xs mt-3">
          <span className="text-slate-500">Status Paket Anda Saat Ini:</span>
          <span className="font-extrabold text-indigo-600 uppercase">
            {currentTier}
          </span>
          {data?.expiresAt && (
            <span className="text-[11px] text-slate-400">
              (Berlaku s/d {formatDateIndo(data.expiresAt)})
            </span>
          )}
        </div>
      </div>

      {/* 3 Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tier 1: Free */}
        <div
          className={`bg-white rounded-3xl p-6 border flex flex-col justify-between shadow-sm relative ${
            currentTier === "free" ? "border-indigo-600 ring-2 ring-indigo-600/20" : "border-slate-200"
          }`}
        >
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
              Pemula
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-2">Free (Gratis)</h3>
            <p className="text-xs text-slate-500 mt-1">Cocok untuk toko baru merintis</p>

            <div className="my-5">
              <span className="text-3xl font-black text-slate-900">Rp 0</span>
              <span className="text-xs text-slate-400"> / selamanya</span>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-600 pt-4 border-t border-slate-100">
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Maksimal 30 produk barang</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Maksimal 50 transaksi / bulan</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>1 Pengguna (Owner saja)</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>POS Kasir & Struk Dasar</span>
              </li>
              <li className="flex items-center space-x-2 text-slate-400">
                <X className="w-4 h-4 text-slate-300 shrink-0" />
                <span>Tanpa fitur Karyawan & Gaji</span>
              </li>
              <li className="flex items-center space-x-2 text-slate-400">
                <X className="w-4 h-4 text-slate-300 shrink-0" />
                <span>Tanpa export PDF & Excel</span>
              </li>
            </ul>
          </div>

          <div className="mt-6">
            <button
              disabled
              className="w-full py-2.5 bg-slate-100 text-slate-500 rounded-xl text-xs font-bold"
            >
              {currentTier === "free" ? "Paket Aktif Anda" : "Paket Dasar"}
            </button>
          </div>
        </div>

        {/* Tier 2: Pro (RECOMMENDED with STRIKE-THROUGH PRICE) */}
        <div
          className={`bg-white rounded-3xl p-6 border-2 flex flex-col justify-between shadow-xl relative ${
            currentTier === "pro"
              ? "border-emerald-500 ring-2 ring-emerald-500/20"
              : "border-indigo-600"
          }`}
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md">
            🔥 Paling Populer & Terlaris
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
              Direkomendasikan
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-2">💎 Paket Pro</h3>
            <p className="text-xs text-slate-500 mt-1">Lengkap untuk toko bertumbuh</p>

            <div className="my-5">
              <div className="flex items-center space-x-2">
                <span className="text-xs line-through text-slate-400 font-bold">
                  Rp 99.000
                </span>
                <span className="text-[10px] bg-rose-100 text-rose-700 font-extrabold px-1.5 py-0.5 rounded">
                  Diskon 75%
                </span>
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="text-3xl font-black text-indigo-600">Rp 25.000</span>
                <span className="text-xs text-slate-500"> / bulan</span>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-700 pt-4 border-t border-slate-100">
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold">Unlimited Produk & Transaksi</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Hingga 5 akun pengguna (Kasir & Manager)</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Manajemen 10 Karyawan & Absensi</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Hitung Gaji Lembur & Slip Gaji</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Download Laporan PDF & Excel</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Peringatan Stok Menipis Otomatis</span>
              </li>
            </ul>
          </div>

          <div className="mt-6">
            <button
              onClick={() => setSelectedTier("pro")}
              className={`w-full py-2.5 rounded-xl text-xs font-bold shadow-md transition ${
                selectedTier === "pro"
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {currentTier === "pro" ? "Perpanjang Paket Pro" : "Pilih Paket Pro (Rp 25rb)"}
            </button>
          </div>
        </div>

        {/* Tier 3: Enterprise */}
        <div
          className={`bg-white rounded-3xl p-6 border flex flex-col justify-between shadow-sm relative ${
            currentTier === "enterprise"
              ? "border-purple-600 ring-2 ring-purple-600/20"
              : "border-slate-200"
          }`}
        >
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full">
              Bisnis Skala Besar
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-2">🏢 Enterprise</h3>
            <p className="text-xs text-slate-500 mt-1">Multi cabang toko & prioritas</p>

            <div className="my-5">
              <span className="text-3xl font-black text-slate-900">Rp 249.000</span>
              <span className="text-xs text-slate-400"> / bulan</span>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-600 pt-4 border-t border-slate-100">
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold">Semua Fitur Paket Pro</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Unlimited Pengguna & Karyawan</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Multi-cabang Toko</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Akses API & Integrasi Custom</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Support Prioritas WhatsApp 24/7</span>
              </li>
            </ul>
          </div>

          <div className="mt-6">
            <button
              onClick={() => setSelectedTier("enterprise")}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition ${
                selectedTier === "enterprise"
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {currentTier === "enterprise" ? "Paket Aktif Anda" : "Pilih Paket Enterprise"}
            </button>
          </div>
        </div>
      </div>

      {/* Payment & Bank Transfer Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Instruksi Pembayaran & Konfirmasi Transfer
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Paket yang dipilih:{" "}
            <span className="font-bold text-indigo-600 uppercase">
              {selectedTier} ({selectedTier === "pro" ? "Rp 25.000" : "Rp 249.000"}/bulan)
            </span>
          </p>
        </div>

        {/* Bank Accounts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(data?.bankAccounts || [
            { bank: "BCA", number: "8830192811", holder: "PT TOKO MANAGER NUSANTARA" },
            { bank: "Mandiri", number: "1370019283719", holder: "PT TOKO MANAGER NUSANTARA" },
            { bank: "BRI", number: "034101000987301", holder: "PT TOKO MANAGER NUSANTARA" },
          ]).map((b: any, idx: number) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <span className="font-extrabold text-indigo-600 text-sm">{b.bank}</span>
              <p className="font-mono text-sm font-bold text-slate-800 mt-1">{b.number}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">a.n. {b.holder}</p>
            </div>
          ))}
        </div>

        {/* Confirmation Form */}
        {successMsg ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-3 text-emerald-800 text-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="font-semibold">{successMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleUpgradeSubmit} className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Formulir Konfirmasi Pembayaran
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Bank Pengirim
                </label>
                <input
                  type="text"
                  required
                  value={formData.bank_name}
                  onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                  placeholder="Misal: BCA / Mandiri / BRI / GoPay"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Nomor Rekening Pengirim
                </label>
                <input
                  type="text"
                  required
                  value={formData.account_number}
                  onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                  placeholder="1234567890"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Nama Pemilik Rekening
                </label>
                <input
                  type="text"
                  required
                  value={formData.account_holder}
                  onChange={(e) => setFormData({ ...formData, account_holder: e.target.value })}
                  placeholder="Budi Santoso"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
            >
              {loading ? "Mengirim Konfirmasi..." : "Kirim Bukti Pembayaran"}
            </button>
          </form>
        )}
      </div>

      {/* Payment History */}
      {data?.payments?.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Riwayat Konfirmasi Pembayaran Anda
          </h3>
          <div className="divide-y divide-slate-100 text-xs">
            {data.payments.map((p: any) => (
              <div key={p.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 uppercase">
                    Paket {p.tier} ({formatRupiah(p.amount)})
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Bank: {p.bank_name} • {formatDateIndo(p.created_at)}
                  </p>
                </div>
                <div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      p.status === "confirmed"
                        ? "bg-emerald-100 text-emerald-700"
                        : p.status === "rejected"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {p.status === "confirmed" ? "Disetujui" : p.status === "rejected" ? "Ditolak" : "Menunggu Verifikasi"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
