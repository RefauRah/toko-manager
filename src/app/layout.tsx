import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TokoManager — Sistem Manajemen Keuangan, POS & Toko Modern",
  description: "Platform SaaS lengkap untuk kelola keuangan toko, POS kasir, stok, absensi karyawan, dan hitung laba bersih otomatis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
