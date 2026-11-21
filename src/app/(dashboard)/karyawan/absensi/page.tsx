"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarCheck, ArrowLeft, Plus, Check, Clock, X } from "lucide-react";
import { formatDateIndo, formatLocalDate } from "@/lib/format";

export default function AbsensiPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [date, setDate] = useState(formatLocalDate());
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    employee_id: "",
    date: formatLocalDate(),
    check_in: "08:00",
    check_out: "17:00",
    overtime_hours: "0",
    status: "present",
    notes: "Hadir normal",
  });

  useEffect(() => {
    loadEmployees();
    loadAttendance();
  }, [date]);

  async function loadEmployees() {
    try {
      const res = await fetch("/api/employees");
      const json = await res.json();
      setEmployees(json.employees || []);
      if (json.employees?.length > 0 && !formData.employee_id) {
        setFormData((prev) => ({ ...prev, employee_id: json.employees[0].id }));
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function loadAttendance() {
    try {
      const res = await fetch(`/api/attendance?date=${date}`);
      const json = await res.json();
      setAttendance(json.attendance || []);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSubmitAttendance(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Gagal menyimpan absensi");

      setShowModal(false);
      loadAttendance();
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
          <Link
            href="/karyawan"
            className="inline-flex items-center space-x-1 text-xs text-indigo-600 hover:underline mb-1 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Daftar Karyawan</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Pencatatan Absensi & Lembur Karyawan
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Catat jam masuk, jam pulang, dan jam lembur untuk penghitungan slip gaji otomatis
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Input Absensi Hari Ini</span>
        </button>
      </div>

      {/* Date Picker Filter */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CalendarCheck className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-700">Pilih Tanggal:</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
          />
        </div>

        <span className="text-xs text-slate-500 font-medium">
          {attendance.length} karyawan tercatat pada {formatDateIndo(date)}
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3.5 px-4">Nama Karyawan</th>
                <th className="py-3.5 px-4">Jabatan</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Jam Masuk</th>
                <th className="py-3.5 px-4 text-center">Jam Pulang</th>
                <th className="py-3.5 px-4 text-center">Lembur</th>
                <th className="py-3.5 px-4">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Belum ada data absensi pada tanggal ini. Klik "Input Absensi Hari Ini".
                  </td>
                </tr>
              ) : (
                attendance.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-800">{a.employee_name}</td>
                    <td className="py-3.5 px-4 text-slate-500">{a.position}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700">
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-600">
                      {a.check_in || "-"}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-600">
                      {a.check_out || "-"}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-indigo-600">
                        {a.overtime_hours > 0 ? `+${a.overtime_hours} jam` : "-"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{a.notes || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Input Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-base text-slate-900">
                Input Absensi & Lembur
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAttendance} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Pilih Karyawan *
                </label>
                <select
                  required
                  value={formData.employee_id}
                  onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} — {e.position}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="present">Hadir</option>
                    <option value="sick">Sakit</option>
                    <option value="leave">Izin / Cuti</option>
                    <option value="absent">Alpha / Tidak Hadir</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Jam Masuk
                  </label>
                  <input
                    type="time"
                    value={formData.check_in}
                    onChange={(e) => setFormData({ ...formData, check_in: e.target.value })}
                    className="w-full px-2 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Jam Pulang
                  </label>
                  <input
                    type="time"
                    value={formData.check_out}
                    onChange={(e) => setFormData({ ...formData, check_out: e.target.value })}
                    className="w-full px-2 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Lembur (Jam)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.overtime_hours}
                    onChange={(e) => setFormData({ ...formData, overtime_hours: e.target.value })}
                    className="w-full px-2 py-2 text-xs rounded-xl border border-slate-300 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Catatan / Keterangan
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Misal: Hadir tepat waktu, lembur bongkar barang"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition disabled:opacity-50 mt-4"
              >
                {loading ? "Menyimpan..." : "Simpan Absensi"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
