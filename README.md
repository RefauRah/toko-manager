# TokoManager - Sistem Manajemen Toko SaaS

Aplikasi SaaS Manajemen Toko & POS Kasir modern berbasis Next.js 14 (App Router), TypeScript, Tailwind CSS, dan Knex.js. Mendukung dual-database: SQLite (pengembangan lokal zero-config) dan Supabase PostgreSQL (production cloud).

## ✨ Fitur Utama

- **Point of Sale (POS) Kasir**:
  - Keranjang belanja real-time, pencarian barcode/SKU, diskon per item & pesanan.
  - Multi-metode pembayaran: Tunai (otomatis hitung kembalian), Transfer Bank, QRIS/E-Wallet.
  - Struk kasir siap cetak / thermal printer receipt format.
- **Manajemen Inventaris, Modal & Stok**:
  - Pencatatan harga modal (beli) dan penentuan harga jual.
  - Kalkulasi margin keuntungan otomatis per produk.
  - Peringatan stok minimum / menipis otomatis.
  - Manajemen kategori produk fleksibel.
- **Catatan Pengeluaran Operasional**:
  - Pencatatan biaya sewa, listrik, air, packaging, transportasi, dll.
  - Pengelompokan kategori pengeluaran kustom (Pro/Enterprise).
- **Manajemen Karyawan & Payroll Gaji (Pro/Enterprise)**:
  - Data staf karyawan toko.
  - Presensi / absensi harian & jam lembur.
  - Perhitungan gaji otomatis & cetak slip gaji.
- **Laporan Laba Rugi & Status Keuangan**:
  - Kalkulasi Pendapatan Kotor (Omzet) vs Laba Kotor (Gross Profit) vs Laba Bersih (Net Profit).
  - Status performa toko otomatis: **TOKO UNTUNG** vs **TOKO RUGI**.
  - Ekspor laporan ke format Excel & PDF.
- **Platform Admin Panel**:
  - Manajemen toko terdaftar, override tier langganan, suspend / unsuspend toko.
  - Verifikasi bukti transfer bank pembayaran langganan.
  - Analitik performa pendapatan platform (MRR & ARR).
  - Pengaturan rekening bank platform & pengumuman broadcast.

## 📦 Paket Berlangganan (Subscription Tiers)

1. **Free (Rp 0 / selamanya)**:
   - Maks 30 produk, maks 50 transaksi/bulan, 1 pengguna kasir/owner.
   - Modul POS kasir & ringkasan keuangan dasar.
2. **Pro (Rp 25.000 / bulan)**:
   - Produk & transaksi tanpa batas.
   - Hingga 5 pengguna & 10 karyawan toko.
   - Manajemen absensi & payroll slip gaji karyawan.
   - Ekspor laporan keuangan ke Excel/PDF & peringatan stok menipis.
3. **Enterprise (Rp 249.000 / bulan)**:
   - Seluruh fitur Pro tanpa batasan kuota.
   - Multi-cabang toko & akses API integrasi.

## 🚀 Memulai (Quick Start)

### 1. Instalasi Dependensi
```bash
npm install
```

### 2. Konfigurasi Environment
Salin file `.env.example` ke `.env.local`:
```bash
cp .env.example .env.local
```
Sesuaikan konfigurasi database jika ingin menghubungkan ke Supabase PostgreSQL. Secara default, sistem akan otomatis menggunakan database SQLite lokal tanpa konfigurasi tambahan.

### 3. Inisialisasi Database
Jalankan inisialisasi tabel dan data awal demo:
```bash
npm run db:init
```

Akun default yang tersedia:
- **Super Admin**: `admin@tokomanager.com` / `Admin12345!`
- **Owner Toko (Pro Tier)**: `owner@toko.com` / `Toko123!`
- **Kasir Toko**: `kasir@toko.com` / `Toko123!`

### 4. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

### 5. Menjalankan Test Suite
```bash
npm test
# atau jalankan pengujian rule tier
npm run test:tier
```
