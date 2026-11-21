import { db } from "../lib/db.ts";

async function testConnection() {
  const isPostgres =
    process.env.DB_CLIENT === "pg" ||
    (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith("postgres"));

  console.log("==========================================");
  console.log("   TOKO MANAGER — CEK KONEKSI DATABASE   ");
  console.log("==========================================");

  if (isPostgres) {
    console.log("📍 Tipe Database: PostgreSQL / Supabase Cloud");
    if (process.env.DATABASE_URL) {
      // Mask password for safety
      const masked = process.env.DATABASE_URL.replace(/:\/\/[^:]+:([^@]+)@/, "://***:***@");
      console.log(`🔗 Connection String: ${masked}`);
    }
  } else {
    console.log("📍 Tipe Database: SQLite Lokal (data/toko.sqlite)");
  }

  try {
    const start = Date.now();
    const result = await db.raw("SELECT 1 + 1 as test_calc");
    const duration = Date.now() - start;

    console.log(`✅ KONEKSI BERHASIL! (Waktu respon: ${duration}ms)`);

    const hasUsers = await db.schema.hasTable("users");
    if (hasUsers) {
      const userCount = await db("users").count("id as count").first();
      const storeCount = await db("stores").count("id as count").first();
      console.log(`📊 Tabel terdeteksi:`);
      console.log(`   • Total User: ${userCount?.count || 0}`);
      console.log(`   • Total Toko: ${storeCount?.count || 0}`);
    } else {
      console.log(`⚠️  Tabel belum dibuat di database ini.`);
      console.log(`👉 Jalankan: npm run db:init untuk membuat seluruh tabel dan data awal secara otomatis!`);
    }
    console.log("==========================================");
    process.exit(0);
  } catch (err: any) {
    console.error("❌ KONEKSI GAGAL:", err.message);
    if (err.message.includes("password authentication failed")) {
      console.error("👉 Tips Supabase: Periksa kembali password database Supabase Anda.");
    } else if (err.message.includes("ENOTFOUND")) {
      console.error("👉 Tips Supabase: Periksa kembali host URL project Supabase Anda.");
    }
    console.log("==========================================");
    process.exit(1);
  }
}

testConnection();
