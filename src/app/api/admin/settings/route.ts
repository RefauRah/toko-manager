import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const settings = await db("platform_settings").select("*");
    const settingsMap: Record<string, any> = {};
    settings.forEach((s) => {
      try {
        settingsMap[s.key] = JSON.parse(s.value);
      } catch {
        settingsMap[s.key] = s.value;
      }
    });

    return NextResponse.json({ settings: settingsMap });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.isPlatformAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { key, value } = await req.json();
    if (!key || value === undefined) {
      return NextResponse.json({ error: "Key dan value wajib diisi" }, { status: 400 });
    }

    const strValue = typeof value === "object" ? JSON.stringify(value) : String(value);

    const existing = await db("platform_settings").where({ key }).first();
    if (existing) {
      await db("platform_settings")
        .where({ key })
        .update({ value: strValue, updated_at: db.fn.now() });
    } else {
      await db("platform_settings").insert({
        id: "set-" + Math.random().toString(36).substring(2, 10),
        key,
        value: strValue,
      });
    }

    return NextResponse.json({ success: true, message: `Pengaturan ${key} berhasil diperbarui` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
