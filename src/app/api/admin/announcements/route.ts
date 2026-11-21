import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const announcements = await db("platform_announcements")
      .where({ is_active: true })
      .orderBy("created_at", "desc");

    return NextResponse.json({ announcements });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.isPlatformAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { title, message, target = "all", expires_at } = await req.json();
    if (!title || !message) {
      return NextResponse.json({ error: "Judul dan pesan pengumuman wajib diisi" }, { status: 400 });
    }

    const id = "ann-" + Math.random().toString(36).substring(2, 10);
    await db("platform_announcements").insert({
      id,
      title: title.trim(),
      message: message.trim(),
      target,
      expires_at: expires_at || null,
      created_by: session.user.id,
      is_active: true,
    });

    return NextResponse.json({ success: true, message: "Pengumuman berhasil disebarkan", id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
