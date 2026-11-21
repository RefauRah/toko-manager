import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { checkFeatureAccess } from "@/lib/subscription";
import { formatLocalDate } from "@/lib/format";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.store) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const access = await checkFeatureAccess(session.store.id, "salaryPayroll");
    if (!access.allowed) {
      return NextResponse.json({ locked: true, attendance: [] });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || formatLocalDate();
    const employeeId = searchParams.get("employeeId");

    let query = db("attendance")
      .join("employees", "attendance.employee_id", "employees.id")
      .where({ "attendance.store_id": session.store.id })
      .select("attendance.*", "employees.name as employee_name", "employees.position")
      .orderBy("attendance.date", "desc");

    if (date) {
      query = query.andWhere({ "attendance.date": date });
    }
    if (employeeId) {
      query = query.andWhere({ "attendance.employee_id": employeeId });
    }

    const attendance = await query;
    return NextResponse.json({ locked: false, attendance });
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

    const access = await checkFeatureAccess(session.store.id, "salaryPayroll");
    if (!access.allowed) {
      return NextResponse.json({ error: access.message, upgradeNeeded: true }, { status: 403 });
    }

    const { employee_id, date, check_in, check_out, overtime_hours = 0, status = "present", notes } = await req.json();

    if (!employee_id || !date) {
      return NextResponse.json({ error: "ID Karyawan dan tanggal absensi wajib diisi" }, { status: 400 });
    }

    // Check if record for employee and date exists, if so update, else insert
    const existing = await db("attendance")
      .where({ employee_id, date, store_id: session.store.id })
      .first();

    if (existing) {
      await db("attendance")
        .where({ id: existing.id })
        .update({
          check_in,
          check_out,
          overtime_hours: Number(overtime_hours),
          status,
          notes,
        });
      return NextResponse.json({ success: true, message: "Absensi berhasil diperbarui" });
    }

    const id = "att-" + Math.random().toString(36).substring(2, 10);
    await db("attendance").insert({
      id,
      employee_id,
      store_id: session.store.id,
      date,
      check_in,
      check_out,
      overtime_hours: Number(overtime_hours),
      status,
      notes,
    });

    return NextResponse.json({ success: true, message: "Absensi berhasil dicatat", id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
