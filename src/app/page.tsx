import Link from "next/link";
import {
  Store,
  CheckCircle2,
  TrendingUp,
  ShoppingCart,
  Users,
  FileBarChart,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Wallet,
  Zap,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Navigation Bar */}
      <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Store className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-slate-900">
              TokoManager
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-indigo-600 transition"
            >
              Masuk Akun
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 transition"
            >
              Buka Toko Gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Sistem Manajemen Keuangan Toko #1 untuk UMKM</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
          Kelola Kasir, Modal Barang, Gaji &{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            Ketahui Laba Bersih Toko
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Tidak perlu pusing hitung manual lagi. Catat belanja modal, kasir POS harian,
          pengeluaran listrik/sewa, absensi & slip gaji karyawan — sistem otomatis
          menampilkan kondisi apakah toko Anda sedang <strong>UNTUNG</strong> atau <strong>RUGI</strong>.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/register"
            className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-200 transition flex items-center justify-center space-x-2"
          >
            <span>Daftar Toko Gratis Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-sm rounded-xl shadow-sm transition"
          >
            Coba Akun Demo
          </Link>
        </div>
      </section>

      {/* 5 Core Feature Highlights */}
      <section className="py-12 bg-white border-y border-slate-200 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black text-slate-900">
              Semua Kebutuhan Toko Anda Dalam 1 Aplikasi
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Dirancang khusus untuk pemilik toko kelontong, retail, warung sembako, dan UMKM
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">1. Kasir POS & Catat Modal</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pilih barang dengan cepat, hitung diskon & kembalian otomatis, kurangi stok seketika, dan cetak struk belanja pelanggan.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                <Wallet className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">2. Biaya Operasional Harian</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Catat pengeluaran listrik, token air, sewa tempat, kantong kresek, dan biaya transportasi harian tanpa ada yang terlewat.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">3. Karyawan, Absensi & Gaji</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pantau jam kehadiran dan lembur harian karyawan. Sistem menghitung gaji bersih dan menerbitkan slip gaji karyawan secara resmi.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">4. Status Laba Bersih Otomatis</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dashboard langsung menampilkan apakah toko sedang <strong>UNTUNG</strong> atau <strong>RUGI</strong> berdasarkan kalkulasi akurat HPP modal vs total pemasukan.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <FileBarChart className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">5. Laporan PDF & Excel</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Download laporan laba rugi bulanan dan rekap stok barang terlaris ke format PDF dan spreadsheet Excel dalam satu klik.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">6. Multi-tenant SaaS & Master Admin</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Didukung panel Super Admin khusus penyedia layanan untuk memonitor seluruh client, MRR revenue, dan konfirmasi transfer pembayaran.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section with Strike-through */}
      <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto w-full space-y-10">
        <div className="text-center space-y-2">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            Biaya Langganan Terjangkau
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Pilihan Paket Sesuai Kebutuhan Toko
          </h2>
          <p className="text-xs text-slate-500">
            Mulai gratis, lalu upgrade ke paket Pro hanya Rp 25.000 untuk fitur lengkap tanpa batas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full uppercase">
                Free
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-2">Paket Gratis</h3>
              <p className="text-xs text-slate-400 mt-0.5">Untuk mencoba fitur dasar</p>

              <div className="my-5">
                <span className="text-3xl font-black text-slate-900">Rp 0</span>
                <span className="text-xs text-slate-400"> / selamanya</span>
              </div>

              <ul className="space-y-2 text-xs text-slate-600 border-t pt-4">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Maksimal 30 produk</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>50 transaksi kasir / bulan</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>1 Pengguna</span>
                </li>
              </ul>
            </div>

            <Link
              href="/register"
              className="mt-6 block text-center py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
            >
              Mulai Gratis
            </Link>
          </div>

          {/* Pro Card with strike-through */}
          <div className="bg-white rounded-3xl p-6 border-2 border-indigo-600 shadow-xl flex flex-col justify-between relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase px-3 py-0.5 rounded-full">
              Pilihan Paling Hemat
            </div>

            <div>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">
                Pro Tier
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-2">💎 Paket Pro</h3>
              <p className="text-xs text-slate-400 mt-0.5">Semua fitur terbuka lengkap</p>

              <div className="my-5">
                <div className="flex items-center space-x-2">
                  <span className="text-xs line-through text-slate-400 font-bold">
                    Rp 99.000
                  </span>
                  <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.5 rounded">
                    Diskon 75%
                  </span>
                </div>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-black text-indigo-600">Rp 25.000</span>
                  <span className="text-xs text-slate-500"> / bulan</span>
                </div>
              </div>

              <ul className="space-y-2 text-xs text-slate-700 border-t pt-4">
                <li className="flex items-center space-x-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Unlimited Produk & Transaksi</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Hingga 5 akun user staf</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>10 Karyawan & Slip Gaji</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Download Laporan PDF & Excel</span>
                </li>
              </ul>
            </div>

            <Link
              href="/register"
              className="mt-6 block text-center py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition"
            >
              Daftar Paket Pro
            </Link>
          </div>

          {/* Enterprise Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full uppercase">
                Enterprise
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-2">🏢 Enterprise</h3>
              <p className="text-xs text-slate-400 mt-0.5">Untuk toko multi-cabang</p>

              <div className="my-5">
                <span className="text-3xl font-black text-slate-900">Rp 249.000</span>
                <span className="text-xs text-slate-400"> / bulan</span>
              </div>

              <ul className="space-y-2 text-xs text-slate-600 border-t pt-4">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Semua fitur Pro tanpa batas</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Multi cabang toko</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Support Prioritas WhatsApp</span>
                </li>
              </ul>
            </div>

            <Link
              href="/register"
              className="mt-6 block text-center py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition"
            >
              Pilih Enterprise
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white border-t border-slate-200 text-center text-xs text-slate-400">
        <p>© 2026 TokoManager — Sistem Manajemen Keuangan & Kasir Toko Modern.</p>
        <div className="flex justify-center space-x-4 mt-2">
          <Link href="/login" className="hover:text-indigo-600">
            Login
          </Link>
          <Link href="/register" className="hover:text-indigo-600">
            Daftar Toko
          </Link>
        </div>
      </footer>
    </div>
  );
}
