import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, getUserWithStore, createSessionToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email dan password wajib diisi" }, { status: 400 });
    }

    const user = await db("users").where({ email: email.toLowerCase().trim() }).first();
    if (!user) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
    }

    const sessionData = await getUserWithStore(user.id);
    if (!sessionData) {
      return NextResponse.json({ error: "Gagal memuat profil pengguna" }, { status: 500 });
    }

    if (sessionData.store?.is_suspended) {
      return NextResponse.json(
        { error: "Toko Anda sedang disuspend oleh administrator platform. Silakan hubungi admin." },
        { status: 403 }
      );
    }

    const token = await createSessionToken(sessionData);

    const response = NextResponse.json({
      success: true,
      user: sessionData.user,
      store: sessionData.store,
      isPlatformAdmin: sessionData.isPlatformAdmin,
    });

    response.cookies.set("tm_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: error.message || "Terjadi kesalahan server" }, { status: 500 });
  }
}
