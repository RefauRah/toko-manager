// Live Tier Rules & Limits Test Suite
const BASE_URL = "http://localhost:3000";

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

async function login(email, password) {
  const res = await request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const setCookie = res.headers.get("set-cookie") || "";
  const cookie = setCookie.split(";")[0];
  return { res, cookie, store: res.data?.store, user: res.data?.user };
}

const tests = [];
function record(name, passed, detail = "") {
  tests.push({ name, passed, detail });
  const icon = passed ? "✅" : "❌";
  console.log(`${icon} [${passed ? "PASS" : "FAIL"}] ${name}`);
  if (detail) console.log(`   └─ ${detail}`);
}

async function run() {
  console.log("==========================================================");
  console.log("       🛡️  PENGUJIAN VALIDASI RULE & LIMIT TIER SAAS       ");
  console.log(`       Target Server: ${BASE_URL}                        `);
  console.log("==========================================================\n");

  // 1. Authenticate Free and Pro accounts
  const freeLogin = await login("example@toko.com", "Toko123!");
  const proLogin = await login("owner@toko.com", "Toko123!");

  if (!freeLogin.cookie || !proLogin.cookie) {
    console.error("Gagal login! Pastikan dev server localhost:3000 sedang aktif.");
    process.exit(1);
  }

  const freeCookie = freeLogin.cookie;
  const proCookie = proLogin.cookie;
  const freeStore = freeLogin.store;
  const proStore = proLogin.store;

  console.log(`[INFO] Akun Free : ${freeLogin.user.email} (Toko: ${freeStore.name}, Tier: ${freeStore.tier})`);
  console.log(`[INFO] Akun Pro  : ${proLogin.user.email} (Toko: ${proStore.name}, Tier: ${proStore.tier})\n`);

  // ----------------------------------------------------
  // TEST GROUP 1: KATEGORI PENGELUARAN KUSTOM
  // ----------------------------------------------------
  console.log("--- 1. UJI RULE: KATEGORI PENGELUARAN KUSTOM ---");
  // Free tier should be BLOCKED (403)
  const freeCatRes = await request("/api/expenses/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: freeCookie },
    body: JSON.stringify({ name: "Biaya Custom Free" }),
  });
  record(
    "Free Tier: Blokir Tambah Kategori Pengeluaran Kustom (Harus 403)",
    freeCatRes.status === 403 && freeCatRes.data?.upgradeNeeded === true,
    `Respon: HTTP ${freeCatRes.status} -> ${freeCatRes.data?.error || "OK"}`
  );

  // Pro tier should be ALLOWED (200)
  const proCatRes = await request("/api/expenses/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: proCookie },
    body: JSON.stringify({ name: `Biaya Custom Pro ${Date.now()}` }),
  });
  record(
    "Pro Tier: Izinkan Tambah Kategori Pengeluaran Kustom (Harus 200)",
    proCatRes.status === 200 && proCatRes.data?.success === true,
    `Respon: HTTP ${proCatRes.status} -> ID: ${proCatRes.data?.id}`
  );

  // ----------------------------------------------------
  // TEST GROUP 2: MODUL KARYAWAN
  // ----------------------------------------------------
  console.log("\n--- 2. UJI RULE: MODUL KARYAWAN ---");
  // Free tier: List employees locked
  const freeEmpGet = await request("/api/employees", {
    headers: { Cookie: freeCookie },
  });
  record(
    "Free Tier: Akses Daftar Karyawan Terkunci (locked: true)",
    freeEmpGet.data?.locked === true,
    `locked: ${freeEmpGet.data?.locked}, Pesan: ${freeEmpGet.data?.message}`
  );

  // Free tier: Post employee blocked
  const freeEmpPost = await request("/api/employees", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: freeCookie },
    body: JSON.stringify({ name: "Karyawan Free", position: "Staff", base_salary: 2000000 }),
  });
  record(
    "Free Tier: Blokir Pendaftaran Karyawan Baru (Harus 403)",
    freeEmpPost.status === 403 && freeEmpPost.data?.upgradeNeeded === true,
    `Respon: HTTP ${freeEmpPost.status} -> ${freeEmpPost.data?.error}`
  );

  // Pro tier: List employees unlocked
  const proEmpGet = await request("/api/employees", {
    headers: { Cookie: proCookie },
  });
  record(
    "Pro Tier: Akses Daftar Karyawan Terbuka (locked: false)",
    proEmpGet.data?.locked === false && Array.isArray(proEmpGet.data?.employees),
    `Total karyawan Pro: ${proEmpGet.data?.employees?.length}`
  );

  // ----------------------------------------------------
  // TEST GROUP 3: ABSENSI & PAYROLL GAJI
  // ----------------------------------------------------
  console.log("\n--- 3. UJI RULE: ABSENSI & PAYROLL GAJI ---");
  // Free tier: Attendance locked
  const freeAttGet = await request("/api/attendance", {
    headers: { Cookie: freeCookie },
  });
  record(
    "Free Tier: Akses Input Absensi Terkunci (locked: true)",
    freeAttGet.data?.locked === true,
    `locked: ${freeAttGet.data?.locked}`
  );

  // Free tier: Salaries locked
  const freeSalGet = await request("/api/salaries?year=2026&month=11", {
    headers: { Cookie: freeCookie },
  });
  record(
    "Free Tier: Akses Payroll Slip Gaji Terkunci (locked: true)",
    freeSalGet.data?.locked === true,
    `locked: ${freeSalGet.data?.locked}`
  );

  // Pro tier: Salaries unlocked
  const proSalGet = await request("/api/salaries?year=2026&month=11", {
    headers: { Cookie: proCookie },
  });
  record(
    "Pro Tier: Akses Payroll Slip Gaji Terbuka (locked: false)",
    proSalGet.data?.locked === false && Array.isArray(proSalGet.data?.payrollList),
    `Total payroll terdaftar: ${proSalGet.data?.payrollList?.length}`
  );

  // ----------------------------------------------------
  // TEST GROUP 4: FITUR KATEGORI PRODUK (BEBAS DI SEMUA TIER)
  // ----------------------------------------------------
  console.log("\n--- 4. UJI RULE: KATEGORI PRODUK (BEBAS DI SEMUA TIER) ---");
  const freeAddProdCat = await request("/api/products/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: freeCookie },
    body: JSON.stringify({ name: `Kategori Free ${Date.now()}` }),
  });
  record(
    "Free Tier: Tetap Bebas Tambah Kategori Produk (Sesuai Plan)",
    freeAddProdCat.status === 200 && freeAddProdCat.data?.success === true,
    `Respon: HTTP ${freeAddProdCat.status} -> ID: ${freeAddProdCat.data?.id}`
  );

  // ----------------------------------------------------
  // TEST GROUP 5: SUBSCRIPTION UPGRADE & STATUS TIER
  // ----------------------------------------------------
  console.log("\n--- 5. UJI RULE: STATUS LANGGANAN & UPGRADE WORKFLOW ---");
  const freeSubGet = await request("/api/subscriptions/upgrade", {
    headers: { Cookie: freeCookie },
  });
  record(
    "Free Tier: Store Teridentifikasi Sebagai 'free'",
    freeSubGet.status === 200 && freeSubGet.data?.currentTier === "free",
    `Tier saat ini: ${freeSubGet.data?.currentTier}`
  );

  const proSubGet = await request("/api/subscriptions/upgrade", {
    headers: { Cookie: proCookie },
  });
  record(
    "Pro Tier: Store Teridentifikasi Sebagai 'pro'",
    proSubGet.status === 200 && proSubGet.data?.currentTier === "pro",
    `Tier saat ini: ${proSubGet.data?.currentTier}`
  );

  // ----------------------------------------------------
  // TEST GROUP 6: ROLE-BASED ACCESS (KASIR vs OWNER)
  // ----------------------------------------------------
  console.log("\n--- 6. UJI RULE: ROLE KASIR VS OWNER ---");
  const cashierLogin = await login("kasir@toko.com", "Toko123!");
  const cashierCookie = cashierLogin.cookie;

  // Cashier forbidden from adding products
  const cashierAddProd = await request("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cashierCookie },
    body: JSON.stringify({ name: "Produk Kasir Ilegal", price: 10000 }),
  });
  record(
    "Kasir: Ditolak Menambah Produk Baru (Harus 403)",
    cashierAddProd.status === 403,
    `Respon: HTTP ${cashierAddProd.status} -> ${cashierAddProd.data?.error}`
  );

  // Cashier forbidden from requesting subscription upgrade
  const cashierUpgrade = await request("/api/subscriptions/upgrade", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cashierCookie },
    body: JSON.stringify({ tier: "enterprise" }),
  });
  record(
    "Kasir: Ditolak Melakukan Upgrade Paket Toko (Harus 403)",
    cashierUpgrade.status === 403,
    `Respon: HTTP ${cashierUpgrade.status} -> ${cashierUpgrade.data?.error}`
  );

  console.log("\n==========================================================");
  const total = tests.length;
  const passed = tests.filter((t) => t.passed).length;
  const failed = total - passed;
  console.log(`  HASIL PENGUJIAN RULE TIER: ${passed}/${total} LULUS (${Math.round((passed / total) * 100)}%)`);
  if (failed === 0) {
    console.log("  🎉 SELURUH SISTEM RULE & LIMIT TIER BERFUNGSI SEMPURNA!");
  } else {
    console.log(`  ⚠️ Ada ${failed} rule yang tidak sesuai.`);
  }
  console.log("==========================================================");

  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
