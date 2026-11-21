"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Plus, CalendarCheck, Banknote, Sparkles, X, Phone, Briefcase } from "lucide-react";
import { formatRupiah, formatDateIndo, formatLocalDate } from "@/lib/format";

export default function KaryawanPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [locked, setLocked] = useState(false);
  const [lockMsg, setLockMsg] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    position: "",
    base_salary: "",
    join_date: formatLocalDate(),
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    try {
      const res = await fetch("/api/employees");
      const json = await res.json();
      if (json.locked) {
        setLocked(true);
        setLockMsg(json.message);
      } else {
        setLocked(false);
        setEmployees(json.employees || []);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleAddEmployee(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menambah karyawan");

      setShowAddModal(false);
      setFormData({
        name: "",
        phone: "",
        position: "",
        base_salary: "",
        join_date: formatLocalDate(),
      });
      loadEmployees();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (locked) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-xl mx-auto shadow-sm my-8">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">
          Fitur Karyawan & Gaji Memerlukan Paket Pro
        </h2>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          Kelola data karyawan toko, input absensi harian, lembur, dan generate slip gaji otomatis.
          Hanya <span className="line-through text-slate-400">Rp 99.000</span>{" "}
          <span className="font-extrabold text-indigo-600">Rp 25.000 / bulan</span>.
        </p>
        <div className="mt-6">
          <Link
            href="/langganan"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            <span>Upgrade ke Paket Pro Sekarang</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Manajemen Karyawan Toko
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Data karyawan, gaji pokok, absensi kerja, dan penghitungan payroll
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/karyawan/absensi"
            className="flex items-center space-x-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition shadow-sm"
          >
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
            <span>Input Absensi</span>
          </Link>

          <Link
            href="/karyawan/gaji"
            className="flex items-center space-x-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Banknote className="w-4 h-4 text-indigo-600" />
            <span>Payroll Gaji</span>
          </Link>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Karyawan</span>
          </button>
        </div>
      </div>

      {/* Employee List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.length === 0 ? (
          <div className="col-span-full bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
            Belum ada karyawan yang didaftarkan. Klik tombol Tambah Karyawan di atas.
          </div>
        ) : (
          employees.map((emp) => (
            <div
              key={emp.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 font-extrabold flex items-center justify-center text-sm">
                  {emp.name.charAt(0)}
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 uppercase">
                  Aktif
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900">{emp.name}</h3>
                <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-0.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>{emp.position}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Gaji Pokok:</span>
                  <span className="font-bold text-slate-800">
                    {formatRupiah(emp.base_salary)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Kontak:</span>
                  <span className="text-slate-600">{emp.phone || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mulai Kerja:</span>
                  <span className="text-slate-600">{formatDateIndo(emp.join_date)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-base text-slate-900">
                Tambah Karyawan Baru
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Lengkap Karyawan *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Misal: Joko Santoso"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Posisi / Jabatan *
                </label>
                <input
                  type="text"
                  required
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="Kasir, Staff Gudang, Pramuniaga"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Gaji Pokok Bulanan (Rp) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.base_salary}
                  onChange={(e) => setFormData({ ...formData, base_salary: e.target.value })}
                  placeholder="2500000"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    No. Telepon / WA
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="08123456789"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tanggal Mulai Kerja
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.join_date}
                    onChange={(e) => setFormData({ ...formData, join_date: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md transition disabled:opacity-50 mt-4"
              >
                {loading ? "Menyimpan..." : "Simpan Data Karyawan"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
