import type { Knex } from "knex";
import bcrypt from "bcryptjs";

export async function seed(knex: Knex): Promise<void> {
  // Clear existing data in reverse order
  await knex("platform_announcements").del();
  await knex("platform_settings").del();
  await knex("platform_admins").del();
  await knex("subscription_payments").del();
  await knex("salary_payments").del();
  await knex("attendance").del();
  await knex("employees").del();
  await knex("expenses").del();
  await knex("expense_categories").del();
  await knex("transaction_items").del();
  await knex("transactions").del();
  await knex("stock_movements").del();
  await knex("products").del();
  await knex("product_categories").del();
  await knex("store_members").del();
  await knex("stores").del();
  await knex("users").del();

  const salt = bcrypt.genSaltSync(10);
  const adminPasswordHash = bcrypt.hashSync("Admin12345!", salt);
  const userPasswordHash = bcrypt.hashSync("Toko123!", salt);

  // 1. Create Super Admin User
  const adminUserId = "usr-admin-01";
  await knex("users").insert({
    id: adminUserId,
    name: "Platform Super Admin",
    email: "admin@tokomanager.com",
    password_hash: adminPasswordHash,
  });

  await knex("platform_admins").insert({
    id: "padm-01",
    user_id: adminUserId,
    role: "super_admin",
    is_active: true,
  });

  // 2. Platform settings
  await knex("platform_settings").insert([
    {
      id: "set-01",
      key: "bank_accounts",
      value: JSON.stringify([
        { bank: "BCA", number: "8830192811", holder: "PT TOKO MANAGER NUSANTARA" },
        { bank: "Mandiri", number: "1370019283719", holder: "PT TOKO MANAGER NUSANTARA" },
        { bank: "BRI", number: "034101000987301", holder: "PT TOKO MANAGER NUSANTARA" },
      ]),
    },
    {
      id: "set-02",
      key: "subscription_pricing",
      value: JSON.stringify({
        free: { price: 0, name: "Free" },
        pro: { price: 25000, original_price: 99000, name: "Pro" },
        enterprise: { price: 249000, name: "Enterprise" },
      }),
    },
  ]);

  await knex("platform_announcements").insert({
    id: "ann-01",
    title: "Selamat Datang di Platform Manajemen Toko!",
    message: "Nikmati kemudahan pencatatan modal, POS kasir otomatis, pantau keuntungan harian, dan kelola slip gaji karyawan toko Anda dalam satu aplikasi.",
    target: "all",
    is_active: true,
  });

  // 3. Demo Store: Toko Berkah Jaya (Pro Tier Demo)
  const storeId = "store-berkah-01";
  const ownerUserId = "usr-owner-01";
  const cashierUserId = "usr-cashier-01";

  await knex("users").insert([
    {
      id: ownerUserId,
      name: "Haji Ahmad (Owner)",
      email: "owner@toko.com",
      password_hash: userPasswordHash,
    },
    {
      id: cashierUserId,
      name: "Siti Rahma (Kasir)",
      email: "kasir@toko.com",
      password_hash: userPasswordHash,
    },
  ]);

  await knex("stores").insert({
    id: storeId,
    name: "Toko Sembako Berkah Jaya",
    address: "Jl. Pasar Baru No. 18, Kebayoran",
    phone: "081234567890",
    subscription_tier: "pro",
    subscription_expires_at: "2027-12-31",
  });

  await knex("store_members").insert([
    {
      id: "sm-01",
      store_id: storeId,
      user_id: ownerUserId,
      role: "owner",
      is_active: true,
    },
    {
      id: "sm-02",
      store_id: storeId,
      user_id: cashierUserId,
      role: "cashier",
      is_active: true,
    },
  ]);

  // 4. Default Expense Categories
  const expCat1 = "expcat-01";
  const expCat2 = "expcat-02";
  const expCat3 = "expcat-03";
  const expCat4 = "expcat-04";

  await knex("expense_categories").insert([
    { id: expCat1, store_id: storeId, name: "Listrik & Air", is_default: true },
    { id: expCat2, store_id: storeId, name: "Sewa Tempat", is_default: true },
    { id: expCat3, store_id: storeId, name: "Operasional & Plastik", is_default: true },
    { id: expCat4, store_id: storeId, name: "Transportasi / BBM", is_default: true },
  ]);

  // 5. Product Categories
  const catSembako = "cat-01";
  const catMinuman = "cat-02";
  const catMakanan = "cat-03";

  await knex("product_categories").insert([
    { id: catSembako, store_id: storeId, name: "Sembako Pokok", description: "Beras, Minyak, Gula, Terigu" },
    { id: catMinuman, store_id: storeId, name: "Minuman Kemasan", description: "Air mineral, Teh, Kopi kemasan" },
    { id: catMakanan, store_id: storeId, name: "Makanan Ringan & Mie", description: "Mie instan, Biskuit, Snack" },
  ]);

  // 6. Products
  const p1 = "prod-01";
  const p2 = "prod-02";
  const p3 = "prod-03";
  const p4 = "prod-04";
  const p5 = "prod-05";

  await knex("products").insert([
    {
      id: p1,
      store_id: storeId,
      category_id: catSembako,
      name: "Beras Pandan Wangi 5kg",
      sku: "BRS-PW-5K",
      purchase_price: 68000,
      selling_price: 78000,
      stock_quantity: 45,
      min_stock_alert: 10,
    },
    {
      id: p2,
      store_id: storeId,
      category_id: catSembako,
      name: "Minyak Goreng Tropical 2 Liter",
      sku: "MYK-TRP-2L",
      purchase_price: 33000,
      selling_price: 38500,
      stock_quantity: 30,
      min_stock_alert: 8,
    },
    {
      id: p3,
      store_id: storeId,
      category_id: catSembako,
      name: "Gula Pasir Gulaku 1kg",
      sku: "GLA-GLK-1K",
      purchase_price: 15500,
      selling_price: 18000,
      stock_quantity: 60,
      min_stock_alert: 15,
    },
    {
      id: p4,
      store_id: storeId,
      category_id: catMakanan,
      name: "Indomie Goreng Spesial (Dus)",
      sku: "IDM-GRG-DUS",
      purchase_price: 108000,
      selling_price: 118000,
      stock_quantity: 25,
      min_stock_alert: 5,
    },
    {
      id: p5,
      store_id: storeId,
      category_id: catMinuman,
      name: "Aqua Galon 19L (Refill)",
      sku: "AQ-GLN-RFL",
      purchase_price: 17000,
      selling_price: 21000,
      stock_quantity: 4,
      min_stock_alert: 6, // Low stock trigger!
    },
  ]);

  // 7. Sample Expenses
  const today = new Date().toISOString().slice(0, 10);
  await knex("expenses").insert([
    {
      id: "exp-01",
      store_id: storeId,
      category_id: expCat1,
      amount: 350000,
      description: "Token listrik toko bulan berjalan",
      expense_date: today,
      created_by: ownerUserId,
    },
    {
      id: "exp-02",
      store_id: storeId,
      category_id: expCat3,
      amount: 75000,
      description: "Kantong kresek & lakban packing",
      expense_date: today,
      created_by: ownerUserId,
    },
  ]);

  // 8. Sample Employees
  const emp1 = "emp-01";
  const emp2 = "emp-02";

  await knex("employees").insert([
    {
      id: emp1,
      store_id: storeId,
      name: "Siti Rahma",
      phone: "08987654321",
      position: "Kasir & Pelayanan",
      base_salary: 2200000,
      join_date: "2026-01-15",
      is_active: true,
    },
    {
      id: emp2,
      store_id: storeId,
      name: "Joko Santoso",
      phone: "08129876543",
      position: "Staf Gudang & Bongkar Muat",
      base_salary: 2400000,
      join_date: "2026-02-01",
      is_active: true,
    },
  ]);

  // Attendance
  await knex("attendance").insert([
    {
      id: "att-01",
      employee_id: emp1,
      store_id: storeId,
      date: today,
      check_in: "07:55",
      check_out: "16:05",
      overtime_hours: 1,
      status: "present",
      notes: "Tepat waktu",
    },
    {
      id: "att-02",
      employee_id: emp2,
      store_id: storeId,
      date: today,
      check_in: "08:00",
      check_out: "17:30",
      overtime_hours: 2,
      status: "present",
      notes: "Bongkar beras",
    },
  ]);

  // 9. Sample Transactions
  const trx1 = "trx-01";
  await knex("transactions").insert({
    id: trx1,
    store_id: storeId,
    cashier_id: cashierUserId,
    invoice_number: "INV-202611-0001",
    total_amount: 116500,
    discount_amount: 0,
    final_amount: 116500,
    payment_method: "cash",
    paid_amount: 120000,
    change_amount: 3500,
    notes: "Pelanggan reguler",
  });

  await knex("transaction_items").insert([
    {
      id: "ti-01",
      transaction_id: trx1,
      product_id: p1,
      product_name: "Beras Pandan Wangi 5kg",
      quantity: 1,
      unit_price: 78000,
      purchase_price: 68000,
      subtotal: 78000,
    },
    {
      id: "ti-02",
      transaction_id: trx1,
      product_id: p2,
      product_name: "Minyak Goreng Tropical 2 Liter",
      quantity: 1,
      unit_price: 38500,
      purchase_price: 33000,
      subtotal: 38500,
    },
  ]);
}
