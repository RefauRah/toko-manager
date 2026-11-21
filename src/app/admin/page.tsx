"use client";

import { useEffect, useState } from "react";
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { formatRupiah, formatDateTimeIndo } from "@/lib/format";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPayments();
  }, [status]);

  async function loadPayments() {
    try {
      const res = await fetch(`/api/admin/payments?status=${status}`);
      const json = await res.json();
      setPayments(json.payments || []);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleAction(paymentId: string, action: "approve" | "reject") {
    const promptText = action === "approve"
      ? "Setujui pembayaran ini dan aktifkan subscription client?"
      : "Tolak pembayaran ini?";
    if (!confirm(promptText)) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_id: paymentId, action }),
      });
      const json = await res.json();
      alert(json.message);
      loadPayments();
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
            Konfirmasi Pembayaran Langganan Client
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Verifikasi bukti transfer bank dari pemilik toko untuk mengaktifkan paket Pro (Rp 25.000) atau Enterprise (Rp 249.000)
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex space-x-1 bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs">
          {[
            { id: "all", label: "Semua" },
            { id: "pending", label: "Menunggu Approval" },
            { id: "confirmed", label: "Disetujui" },
            { id: "rejected", label: "Ditolak" },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatus(st.id)}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                status === st.id
                  ? "bg-amber-500 text-slate-950"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-800/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3.5 px-4">Toko / Client</th>
                <th className="py-3.5 px-4">Paket Dipilih</th>
                <th className="py-3.5 px-4 text-right">Nominal Transfer</th>
                <th className="py-3.5 px-4">Info Rekening Pengirim</th>
                <th className="py-3.5 px-4">Bukti / Catatan</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Tidak ada pembayaran dengan status ini
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const isPending = p.status === "pending";
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-white">{p.store_name}</p>
                        <p className="text-[10px] text-slate-500">
                          {formatDateTimeIndo(p.created_at)}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-black text-amber-400 uppercase">
                          {p.tier}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-emerald-400">
                        {formatRupiah(p.amount)}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-200">{p.bank_name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {p.account_number} a.n. {p.account_holder}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">
                        {p.payment_proof || p.notes || "-"}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            p.status === "confirmed"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : p.status === "rejected"
                              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {p.status === "confirmed"
                            ? "Disetujui"
                            : p.status === "rejected"
                            ? "Ditolak"
                            : "Menunggu"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isPending ? (
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleAction(p.id, "approve")}
                              disabled={loading}
                              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition disabled:opacity-50 text-[11px]"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleAction(p.id, "reject")}
                              disabled={loading}
                              className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-bold rounded-lg transition disabled:opacity-50 text-[11px] border border-rose-500/30"
                            >
                              Tolak
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-mono">
                            Selesai
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
