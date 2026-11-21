"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Banknote,
  ArrowLeft,
  CheckCircle2,
  Printer,
  X,
  FileText,
  DollarSign,
} from "lucide-react";
import { formatRupiah, formatDateIndo } from "@/lib/format";

export default function GajiPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [payrollList, setPayrollList] = useState<any[]>([]);
  const [selectedSlip, setSelectedSlip] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSalaries();
  }, [year, month]);

  async function loadSalaries() {
    try {
      const res = await fetch(`/api/salaries?year=${year}&month=${month}`);
      const json = await res.json();
      setPayrollList(json.payrollList || []);
    } catch (e) {
      console.error(e);
    }
  }

  async function handlePaySalary(item: any) {
    if (!confirm(`Konfirmasi pembayaran gaji untuk ${item.employee_name}?`)) return;
    setLoading(true);

    try {
      const res = await fetch("/api/salaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: item.employee_id,
          year,
          month,
          base_salary: item.base_salary,
          overtime_pay: item.overtime_pay,
          deductions: item.deductions || 0,
          deduction_notes: item.deduction_notes || null,
          status: "paid",
        }),
      });

      if (!res.ok) throw new Error("Gagal memproses gaji");
      loadSalaries();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];

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
            Payroll & Slip Gaji Karyawan
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Perhitungan gaji pokok, uang lembur otomatis dari jam absensi, dan cetak slip gaji resmi
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center space-x-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm text-xs">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="px-3 py-1.5 rounded-xl border border-slate-200 font-bold bg-white focus:outline-none"
          >
            {monthNames.map((m, idx) => (
              <option key={idx + 1} value={idx + 1}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="px-3 py-1.5 rounded-xl border border-slate-200 font-bold bg-white focus:outline-none"
          >
            {[2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3.5 px-4">Nama Karyawan</th>
                <th className="py-3.5 px-4">Jabatan</th>
                <th className="py-3.5 px-4 text-right">Gaji Pokok</th>
                <th className="py-3.5 px-4 text-right">Lembur (Jam)</th>
                <th className="py-3.5 px-4 text-right">Uang Lembur</th>
                <th className="py-3.5 px-4 text-right font-extrabold">Total Gaji Bersih</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payrollList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Belum ada data karyawan. Tambahkan karyawan terlebih dahulu.
                  </td>
                </tr>
              ) : (
                payrollList.map((p) => {
                  const isPaid = p.status === "paid";
                  return (
                    <tr key={p.employee_id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-800">{p.employee_name}</td>
                      <td className="py-3.5 px-4 text-slate-500">{p.employee_position}</td>
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-700">
                        {formatRupiah(p.base_salary)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-500">
                        {p.total_ot_hours || 0} jam
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-emerald-600">
                        +{formatRupiah(p.overtime_pay)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-indigo-600">
                        {formatRupiah(p.total_salary)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isPaid
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {isPaid ? "Lunas" : "Pending"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          {!isPaid ? (
                            <button
                              onClick={() => handlePaySalary(p)}
                              disabled={loading}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[11px] shadow-sm transition"
                            >
                              Bayar Gaji
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedSlip(p)}
                              className="flex items-center space-x-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px] transition"
                            >
                              <FileText className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Slip Gaji</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slip Gaji Modal */}
      {selectedSlip && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-xs font-mono">
            <div className="flex items-center justify-between border-b pb-3 no-print">
              <h3 className="font-bold text-sm text-slate-900 font-sans">
                Slip Gaji Resmi Karyawan
              </h3>
              <button onClick={() => setSelectedSlip(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Slip Content */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="text-center border-b border-dashed border-slate-300 pb-2">
                <p className="font-extrabold text-sm text-slate-900 font-sans">
                  SLIP GAJI KARYAWAN
                </p>
                <p className="text-[11px] text-slate-500">
                  Periode: {monthNames[month - 1]} {year}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Nama:</span>
                  <span className="font-bold">{selectedSlip.employee_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Jabatan:</span>
                  <span>{selectedSlip.employee_position}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-slate-300 pt-2 space-y-1.5">
                <div className="flex justify-between">
                  <span>Gaji Pokok:</span>
                  <span>{formatRupiah(selectedSlip.base_salary)}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Uang Lembur ({selectedSlip.total_ot_hours || 0} jam):</span>
                  <span>+{formatRupiah(selectedSlip.overtime_pay)}</span>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span>Potongan:</span>
                  <span>-{formatRupiah(selectedSlip.deductions || 0)}</span>
                </div>
              </div>

              <div className="border-t-2 border-slate-800 pt-2 flex justify-between font-bold text-sm font-sans">
                <span>TOTAL GAJI DITERIMA:</span>
                <span className="text-indigo-600">
                  {formatRupiah(selectedSlip.total_salary)}
                </span>
              </div>

              <div className="pt-4 text-center text-[10px] text-slate-400">
                <p>Status: LUNAS ({formatDateIndo(selectedSlip.payment_date || new Date())})</p>
                <p className="mt-1">Terima kasih atas dedikasi dan kerja keras Anda!</p>
              </div>
            </div>

            <div className="flex gap-2 no-print font-sans">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Slip Gaji</span>
              </button>
              <button
                onClick={() => setSelectedSlip(null)}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
