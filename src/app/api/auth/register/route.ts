import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, getUserWithStore, createSessionToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, storeName, phone, address } = await req.json();

    if (!name || !email || !password || !storeName) {
      return NextResponse.json(
        { error: "Nama, email, password, dan nama toko wajib diisi" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await db("users").where({ email: cleanEmail }).first();
    if (existing) {
      return NextResponse.json({ error: "Email sudah terdaftar, silakan login" }, { status: 400 });
    }

    const userId = "usr-" + Math.random().toString(36).substring(2, 10);
    const storeId = "store-" + Math.random().toString(36).substring(2, 10);
    const passwordHash = await hashPassword(password);

    // Create user, store, membership, and default expense categories
    await db("users").insert({
      id: userId,
      name: name.trim(),
      email: cleanEmail,
      password_hash: passwordHash,
    });

    await db("stores").insert({
      id: storeId,
      name: storeName.trim(),
      phone: phone?.trim() || null,
      address: address?.trim() || null,
      subscription_tier: "free",
    });

    await db("store_members").insert({
      id: "sm-" + Math.random().toString(36).substring(2, 10),
      store_id: storeId,
      user_id: userId,
      role: "owner",
      is_active: true,
    });

    // Default expense categories
    await db("expense_categories").insert([
      { id: "ec-" + Math.random().toString(36).substring(2, 10), store_id: storeId, name: "Listrik & Air", is_default: true },
      { id: "ec-" + Math.random().toString(36).substring(2, 10), store_id: storeId, name: "Sewa Tempat", is_default: true },
      { id: "ec-" + Math.random().toString(36).substring(2, 10), store_id: storeId, name: "Operasional & Kemasan", is_default: true },
      { id: "ec-" + Math.random().toString(36).substring(2, 10), store_id: storeId, name: "Transportasi / BBM", is_default: true },
      { id: "ec-" + Math.random().toString(36).substring(2, 10), store_id: storeId, name: "Lain-lain", is_default: true },
    ]);

    // Product Category default
    await db("product_categories").insert({
      id: "pc-" + Math.random().toString(36).substring(2, 10),
      store_id: storeId,
      name: "Umum",
      description: "Kategori produk default",
    });

    const sessionData = await getUserWithStore(userId);
    if (!sessionData) {
      return NextResponse.json({ error: "Gagal membuat sesi pengguna" }, { status: 500 });
    }

    const token = await createSessionToken(sessionData);

    const response = NextResponse.json({
      success: true,
      message: "Registrasi toko berhasil!",
      user: sessionData.user,
      store: sessionData.store,
    });

    response.cookies.set("tm_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json({ error: error.message || "Gagal melakukan registrasi" }, { status: 500 });
  }
}
