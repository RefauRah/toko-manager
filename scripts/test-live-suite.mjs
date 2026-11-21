// Live End-to-End Test Suite for TokoManager
const BASE_URL = "http://localhost:3000";

let ownerCookie = "";
let cashierCookie = "";
let adminCookie = "";
let testStoreId = "";
let testCatId = "";
let testProdId = "";

const results = [];

function recordTest(name, passed, detail = "") {
  results.push({ name, passed, detail });
  const icon = passed ? "✅" : "❌";
  console.log(`${icon} [${passed ? "PASS" : "FAIL"}] ${name} ${detail ? "(" + detail + ")" : ""}`);
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, options);
  let json = null;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      json = await res.json();
    } catch (e) {}
  } else {
    json = await res.text();
  }
  return { status: res.status, headers: res.headers, data: json };
}

async function run() {
  console.log("=================================================");
  console.log("  🚀 MENJALANKAN LIVE TEST SUITE TOKO MANAGER   ");
  console.log(`  Target: ${BASE_URL}                            `);
  console.log("=================================================\n");

  // TEST 1: Landing Page
  try {
    const res = await request("/");
    const ok = res.status === 200 && typeof res.data === "string" && res.data.includes("TokoManager");
    recordTest("1. Landing Page (HTTP 200 & Render)", ok);
  } catch (e) {
    recordTest("1. Landing Page", false, e.message);
  }

  // TEST 2: Auth Login - Owner
  try {
    const res = await request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "owner@toko.com", password: "Toko123!" }),
    });
    const setCookie = res.headers.get("set-cookie") || "";
    ownerCookie = setCookie.split(";")[0];
    const ok = res.status === 200 && res.data?.success && ownerCookie.includes("tm_session");
    testStoreId = res.data?.store?.id;
    recordTest("2. Auth Login Owner Toko (owner@toko.com)", ok, `Store: ${res.data?.store?.name}, Tier: ${res.data?.store?.tier}`);
  } catch (e) {
    recordTest("2. Auth Login Owner Toko", false, e.message);
  }

  // TEST 3: Auth Login - Kasir
  try {
    const res = await request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "kasir@toko.com", password: "Toko123!" }),
    });
    const setCookie = res.headers.get("set-cookie") || "";
    cashierCookie = setCookie.split(";")[0];
    const ok = res.status === 200 && res.data?.success && res.data?.store?.role === "cashier";
    recordTest("3. Auth Login Kasir Toko (kasir@toko.com)", ok, `Role: ${res.data?.store?.role}`);
  } catch (e) {
    recordTest("3. Auth Login Kasir Toko", false, e.message);
  }

  // TEST 4: Auth Login - Super Admin Platform
  try {
    const res = await request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@tokomanager.com", password: "Admin12345!" }),
    });
    const setCookie = res.headers.get("set-cookie") || "";
    adminCookie = setCookie.split(";")[0];
    const ok = res.status === 200 && res.data?.isPlatformAdmin === true;
    recordTest("4. Auth Login Super Admin (admin@tokomanager.com)", ok, `isPlatformAdmin: ${res.data?.isPlatformAdmin}`);
  } catch (e) {
    recordTest("4. Auth Login Super Admin", false, e.message);
  }

  // TEST 5: Kategori Produk (Tambah & Ambil)
  try {
    const catName = "Kategori Uji " + Math.floor(Math.random() * 1000);
    const postRes = await request("/api/products/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ownerCookie },
      body: JSON.stringify({ name: catName, description: "Kategori otomatis via test" }),
    });
    testCatId = postRes.data?.id;

    const getRes = await request("/api/products/categories", {
      headers: { Cookie: ownerCookie },
    });
    const found = getRes.data?.categories?.some((c) => c.name === catName);
    recordTest("5. Tambah & Ambil Kategori Produk Baru", postRes.status === 200 && found, `Nama: ${catName}`);
  } catch (e) {
    recordTest("5. Tambah & Ambil Kategori Produk Baru", false, e.message);
  }

  // TEST 6: Produk Baru & Pencatatan Modal
  try {
    const prodName = "Minyak Goreng Test " + Math.floor(Math.random() * 1000);
    const postRes = await request("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ownerCookie },
      body: JSON.stringify({
        name: prodName,
        sku: "TEST-" + Math.floor(Math.random() * 1000),
        category_id: testCatId,
        purchase_price: 25000,
        selling_price: 32000,
        stock_quantity: 50,
        min_stock_alert: 5,
      }),
    });
    testProdId = postRes.data?.id;

    const getRes = await request("/api/products", {
      headers: { Cookie: ownerCookie },
    });
    const found = getRes.data?.products?.some((p) => p.name === prodName);
    recordTest("6. Tambah Produk Baru dengan Modal & Harga Jual", postRes.status === 200 && found, `Modal: Rp 25.000, Jual: Rp 32.000, Stok: 50`);
  } catch (e) {
    recordTest("6. Tambah Produk Baru", false, e.message);
  }

  // TEST 7: Penyesuaian Stok (Restock Belanja Baru)
  try {
    const putRes = await request(`/api/products/${testProdId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: ownerCookie },
      body: JSON.stringify({
        stock_adjustment: 20,
        adjustment_reason: "Kulakan Grosir Tambahan",
      }),
    });
    const getRes = await request(`/api/products/${testProdId}`, {
      headers: { Cookie: ownerCookie },
    });
    const newStock = getRes.data?.product?.stock_quantity;
    recordTest("7. Penyesuaian Stok Produk (Restock +20)", putRes.status === 200 && newStock === 70, `Stok awal: 50 -> Stok akhir: ${newStock}`);
  } catch (e) {
    recordTest("7. Penyesuaian Stok Produk", false, e.message);
  }

  // TEST 8: Kasir POS (Checkout & Pengurangan Stok Otomatis)
  let invoiceNum = "";
  try {
    const postTrx = await request("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ownerCookie },
      body: JSON.stringify({
        items: [{ productId: testProdId, quantity: 2 }],
        discount_amount: 2000,
        payment_method: "cash",
        paid_amount: 70000,
      }),
    });
    invoiceNum = postTrx.data?.data?.invoiceNumber;

    // Check updated stock (70 - 2 = 68)
    const checkStock = await request(`/api/products/${testProdId}`, {
      headers: { Cookie: ownerCookie },
    });
    const currentStock = checkStock.data?.product?.stock_quantity;
    const ok = postTrx.status === 200 && postTrx.data?.success && currentStock === 68;
    recordTest("8. Transaksi Kasir POS (Stok berkurang otomatis & invoice terbit)", ok, `Invoice: ${invoiceNum}, Sisa Stok: ${currentStock}`);
  } catch (e) {
    recordTest("8. Transaksi Kasir POS", false, e.message);
  }

  // TEST 9: Riwayat Transaksi & Detail
  try {
    const res = await request(`/api/transactions?search=${invoiceNum}`, {
      headers: { Cookie: ownerCookie },
    });
    const found = res.data?.transactions?.some((t) => t.invoice_number === invoiceNum);
    recordTest("9. Riwayat Transaksi & Pencarian Invoice", res.status === 200 && found, `Ditemukan: ${invoiceNum}`);
  } catch (e) {
    recordTest("9. Riwayat Transaksi", false, e.message);
  }

  // TEST 10: Pengeluaran Operasional Harian
  try {
    const postExp = await request("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ownerCookie },
      body: JSON.stringify({
        amount: 150000,
        description: "Beli kantong kresek & lakban packing toko",
        expense_date: new Date().toISOString().slice(0, 10),
      }),
    });
    const getExp = await request("/api/expenses", {
      headers: { Cookie: ownerCookie },
    });
    const ok = postExp.status === 200 && getExp.data?.expenses?.some((e) => e.amount === 150000);
    recordTest("10. Pencatatan Pengeluaran Operasional Toko", ok, `Jumlah: Rp 150.000`);
  } catch (e) {
    recordTest("10. Pencatatan Pengeluaran Operasional Toko", false, e.message);
  }

  // TEST 11: Karyawan, Absensi & Lembur
  let testEmpId = "";
  try {
    const postEmp = await request("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ownerCookie },
      body: JSON.stringify({
        name: "Asep Sunandar",
        phone: "08123456780",
        position: "Pramuniaga Toko",
        base_salary: 2600000,
      }),
    });
    testEmpId = postEmp.data?.id;

    // Record attendance with 2 hours overtime
    const today = new Date().toISOString().slice(0, 10);
    const postAtt = await request("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ownerCookie },
      body: JSON.stringify({
        employee_id: testEmpId,
        date: today,
        check_in: "07:50",
        check_out: "18:00",
        overtime_hours: 2,
        status: "present",
        notes: "Lembur restock beras",
      }),
    });

    recordTest("11. Manajemen Karyawan & Input Absensi Lembur", postEmp.status === 200 && postAtt.status === 200, `Karyawan: Asep Sunandar, Lembur: 2 jam`);
  } catch (e) {
    recordTest("11. Manajemen Karyawan & Input Absensi", false, e.message);
  }

  // TEST 12: Kalkulasi Gaji & Pembayaran Payroll
  try {
    const now = new Date();
    const getSal = await request(`/api/salaries?year=${now.getFullYear()}&month=${now.getMonth() + 1}`, {
      headers: { Cookie: ownerCookie },
    });
    const empPayroll = getSal.data?.payrollList?.find((p) => p.employee_id === testEmpId);
    const hasOt = empPayroll && empPayroll.overtime_pay > 0;

    // Pay salary
    const postSal = await request("/api/salaries", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ownerCookie },
      body: JSON.stringify({
        employee_id: testEmpId,
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        base_salary: empPayroll.base_salary,
        overtime_pay: empPayroll.overtime_pay,
        deductions: 50000,
        deduction_notes: "Kasbon kasir",
        status: "paid",
      }),
    });

    const ok = postSal.status === 200 && hasOt;
    recordTest("12. Hitung Gaji Lembur Otomatis & Terbitkan Slip Gaji", ok, `Gaji Pokok: Rp 2.600.000 + Lembur: Rp ${empPayroll?.overtime_pay?.toLocaleString("id-ID")} - Potongan: Rp 50.000`);
  } catch (e) {
    recordTest("12. Hitung Gaji Lembur Otomatis", false, e.message);
  }

  // TEST 13: Laporan Laba Rugi Otomatis (HPP, Biaya, Status Untung/Rugi)
  try {
    const res = await request("/api/reports/profit-loss?range=this_month", {
      headers: { Cookie: ownerCookie },
    });
    const s = res.data?.summary;
    const ok = res.status === 200 && s && s.totalRevenue > 0 && typeof s.isProfitable === "boolean";
    recordTest(
      "13. Kalkulasi Laporan Laba Rugi Otomatis",
      ok,
      `Pendapatan: Rp ${s?.totalRevenue?.toLocaleString("id-ID")}, Modal HPP: Rp ${s?.totalModalHPP?.toLocaleString("id-ID")}, Laba Bersih: Rp ${s?.netProfit?.toLocaleString("id-ID")}, Status: ${s?.isProfitable ? "UNTUNG" : "RUGI"}`
    );
  } catch (e) {
    recordTest("13. Kalkulasi Laporan Laba Rugi", false, e.message);
  }

  // TEST 14: Upgrade Langganan & Konfirmasi Transfer Client
  let subPaymentId = "";
  try {
    const postSub = await request("/api/subscriptions/upgrade", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ownerCookie },
      body: JSON.stringify({
        tier: "pro",
        bank_name: "BCA",
        account_number: "0883192831",
        account_holder: "Budi Santoso",
        notes: "Transfer perpanjangan via BCA",
        payment_proof: "Bukti transfer terlampir",
      }),
    });
    subPaymentId = postSub.data?.id;
    recordTest("14. Pengajuan Bukti Transfer Langganan Client (Paket Pro)", postSub.status === 200 && Boolean(subPaymentId), `ID: ${subPaymentId}`);
  } catch (e) {
    recordTest("14. Pengajuan Bukti Transfer", false, e.message);
  }

  // TEST 15: Platform Master Admin - Verifikasi & Approve Pembayaran
  try {
    const approveRes = await request("/api/admin/payments", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
      body: JSON.stringify({
        payment_id: subPaymentId,
        action: "approve",
        notes: "Pembayaran terverifikasi masuk ke rekening BCA platform",
      }),
    });
    recordTest("15. Master Admin: Approve Transfer & Auto-Aktifkan Paket Client", approveRes.status === 200 && approveRes.data?.success, approveRes.data?.message);
  } catch (e) {
    recordTest("15. Master Admin: Approve Transfer", false, e.message);
  }

  // TEST 16: Platform Master Admin - Revenue Analytics (MRR & ARR)
  try {
    const revRes = await request("/api/admin/revenue", {
      headers: { Cookie: adminCookie },
    });
    const rm = revRes.data?.revenueMetrics;
    const ok = revRes.status === 200 && rm && typeof rm.mrr === "number";
    recordTest("16. Master Admin: Dashboard Revenue (MRR & ARR Platform)", ok, `MRR: Rp ${rm?.mrr?.toLocaleString("id-ID")}, ARR: Rp ${rm?.arr?.toLocaleString("id-ID")}`);
  } catch (e) {
    recordTest("16. Master Admin: Dashboard Revenue", false, e.message);
  }

  // TEST 17: Platform Master Admin - Siaran Pengumuman Broadcast
  try {
    const annRes = await request("/api/admin/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
      body: JSON.stringify({
        title: "Pemberitahuan Sistem Live Test",
        message: "Seluruh fitur sistem toko telah lulus pengujian real-time.",
        target: "all",
      }),
    });
    recordTest("17. Master Admin: Siaran Pengumuman Broadcast ke Semua Toko", annRes.status === 200 && annRes.data?.success);
  } catch (e) {
    recordTest("17. Master Admin: Siaran Pengumuman", false, e.message);
  }

  console.log("\n=================================================");
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;
  console.log(`  HASIL AKHIR: ${passed}/${total} PENGUJIAN LULUS (${Math.round((passed / total) * 100)}%)`);
  if (failed === 0) {
    console.log("  🎉 SEMUA FITUR BERJALAN NORMAL & LULUS 100%!  ");
  } else {
    console.log(`  ⚠️ Ada ${failed} pengujian yang gagal.`);
  }
  console.log("=================================================");
}

run();
