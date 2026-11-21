import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { checkFeatureAccess, checkLimit } from "@/lib/subscription";
import { formatLocalDate } from "@/lib/format";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.store) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const access = await checkFeatureAccess(session.store.id, "employees");
    if (!access.allowed) {
      return NextResponse.json({
        locked: true,
        message: "Manajemen Karyawan & Gaji memerlukan paket Pro (Rp 25.000/bln) atau Enterprise.",
        employees: [],
      });
    }

    const employees = await db("employees")
      .where({ store_id: session.store.id, is_active: true })
      .orderBy("name", "asc");

    return NextResponse.json({ locked: false, employees });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.store) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.store.role === "cashier") {
      return NextResponse.json({ error: "Kasir tidak dapat menambah karyawan" }, { status: 403 });
    }

    const access = await checkFeatureAccess(session.store.id, "employees");
    if (!access.allowed) {
      return NextResponse.json({ error: access.message, upgradeNeeded: true }, { status: 403 });
    }

    const limitCheck = await checkLimit(session.store.id, "employees");
    if (!limitCheck.allowed) {
      return NextResponse.json({ error: limitCheck.message, upgradeNeeded: true }, { status: 403 });
    }

    const { name, phone, position, base_salary, join_date } = await req.json();
    if (!name || !position || base_salary === undefined) {
      return NextResponse.json({ error: "Nama, posisi, dan gaji pokok wajib diisi" }, { status: 400 });
    }

    const id = "emp-" + Math.random().toString(36).substring(2, 10);
    await db("employees").insert({
      id,
      store_id: session.store.id,
      name: name.trim(),
      phone: phone?.trim() || null,
      position: position.trim(),
      base_salary: Number(base_salary),
      join_date: join_date || formatLocalDate(),
      is_active: true,
    });

    return NextResponse.json({ success: true, message: "Karyawan berhasil didaftarkan", id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
