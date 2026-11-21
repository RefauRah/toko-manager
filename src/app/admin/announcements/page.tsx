"use client";

import { useEffect, useState } from "react";
import { Megaphone, Plus, Send, CheckCircle2 } from "lucide-react";
import { formatDateIndo } from "@/lib/format";

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    target: "all",
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  async function loadAnnouncements() {
    try {
      const res = await fetch("/api/admin/announcements");
      const json = await res.json();
      setAnnouncements(json.announcements || []);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menyiarkan");

      setSuccessMsg("Pengumuman berhasil disebarkan ke seluruh dashboard client toko!");
      setFormData({ title: "", message: "", target: "all" });
      loadAnnouncements();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Siaran Pengumuman Platform (Broadcast)
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Kirim informasi penting, info maintenance, atau penawaran promo yang akan langsung muncul di dashboard pemilik toko
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Broadcast */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center space-x-2">
            <Megaphone className="w-4 h-4 text-amber-400" />
            <span>Buat Pengumuman Baru</span>
          </h3>

          {successMsg && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSend} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Judul Pengumuman</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Misal: Update Fitur Baru Laporan Laba Rugi"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Target Penerima</label>
              <select
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
              >
                <option value="all">Semua Toko (Free, Pro & Enterprise)</option>
                <option value="free">Khusus Pengguna Free</option>
                <option value="pro">Khusus Pengguna Pro</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Isi Pesan Pengumuman</label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Tuliskan pesan lengkap yang ingin disampaikan kepada client toko..."
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? "Menyiarkan..." : "Siarkan Pengumuman"}</span>
            </button>
          </form>
        </div>

        {/* Existing Announcements */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-white">
            Pengumuman Aktif
          </h3>

          <div className="divide-y divide-slate-800 text-xs">
            {announcements.map((a) => (
              <div key={a.id} className="py-3 space-y-1">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-amber-400">{a.title}</h4>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded uppercase">
                    Target: {a.target}
                  </span>
                </div>
                <p className="text-slate-300">{a.message}</p>
                <p className="text-[10px] text-slate-500">
                  Dibuat pada: {formatDateIndo(a.created_at)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
