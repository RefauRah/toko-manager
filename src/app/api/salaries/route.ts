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
      return NextResponse.json({ locked: true, salaries: [] });
    }

    const { searchParams } = new URL(req.url);
    const now = new Date();
    const year = Number(searchParams.get("year") || now.getFullYear());
    const month = Number(searchParams.get("month") || now.getMonth() + 1);

    // Get all active employees
    const employees = await db("employees")
      .where({ store_id: session.store.id, is_active: true })
      .orderBy("name", "asc");

    // Get existing salary payment records for this month
    const existingPayments = await db("salary_payments")
      .where({ store_id: session.store.id, year, month });

    const paymentMap = new Map<string, any>();
    existingPayments.forEach((p) => paymentMap.set(p.employee_id, p));

    // Get attendance summary for each employee this month
    const monthStr = String(month).padStart(2, "0");
    const startDate = `${year}-${monthStr}-01`;
    const endDate = `${year}-${monthStr}-31`;

    const payrollList = await Promise.all(
      employees.map(async (emp) => {
        const existing = paymentMap.get(emp.id);

        // Calculate total overtime hours from attendance
        const attStats = await db("attendance")
          .where({ employee_id: emp.id, store_id: session.store!.id })
          .andWhere("date", ">=", startDate)
          .andWhere("date", "<=", endDate)
          .sum("overtime_hours as total_ot")
          .first();

        const totalOtHours = Number(attStats?.total_ot || 0);
        // Overtime rate: (base_salary / 173) * 1.5 standard
        const hourlyRate = (Number(emp.base_salary) / 173) * 1.5;
        const autoOvertimePay = Math.round(totalOtHours * hourlyRate);

        if (existing) {
          return {
            ...existing,
            employee_name: emp.name,
            employee_position: emp.position,
            total_ot_hours: totalOtHours,
          };
        }

        const totalSalary = Number(emp.base_salary) + autoOvertimePay;

        return {
          id: null,
          employee_id: emp.id,
          employee_name: emp.name,
          employee_position: emp.position,
          year,
          month,
          base_salary: Number(emp.base_salary),
          overtime_pay: autoOvertimePay,
          deductions: 0,
          deduction_notes: "",
          total_salary: totalSalary,
          total_ot_hours: totalOtHours,
          status: "pending",
          payment_date: null,
        };
      })
    );

    return NextResponse.json({ locked: false, year, month, payrollList });
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

    if (session.store.role !== "owner") {
      return NextResponse.json({ error: "Hanya Owner toko yang dapat memproses pembayaran gaji" }, { status: 403 });
    }

    const access = await checkFeatureAccess(session.store.id, "salaryPayroll");
    if (!access.allowed) {
      return NextResponse.json({ error: access.message, upgradeNeeded: true }, { status: 403 });
    }

    const { employee_id, year, month, base_salary, overtime_pay = 0, deductions = 0, deduction_notes, status = "paid" } = await req.json();

    if (!employee_id || !year || !month) {
      return NextResponse.json({ error: "Parameter wajib diisi" }, { status: 400 });
    }

    const totalSalary = Number(base_salary) + Number(overtime_pay) - Number(deductions);
    const existing = await db("salary_payments")
      .where({ employee_id, year, month, store_id: session.store.id })
      .first();

    const today = formatLocalDate();

    if (existing) {
      await db("salary_payments")
        .where({ id: existing.id })
        .update({
          base_salary: Number(base_salary),
          overtime_pay: Number(overtime_pay),
          deductions: Number(deductions),
          deduction_notes: deduction_notes || null,
          total_salary: totalSalary,
          status,
          payment_date: status === "paid" ? today : null,
          paid_by: session.user.id,
          updated_at: db.fn.now(),
        });
      return NextResponse.json({ success: true, message: "Data gaji berhasil diperbarui" });
    }

    const id = "sal-" + Math.random().toString(36).substring(2, 10);
    await db("salary_payments").insert({
      id,
      employee_id,
      store_id: session.store.id,
      year: Number(year),
      month: Number(month),
      base_salary: Number(base_salary),
      overtime_pay: Number(overtime_pay),
      deductions: Number(deductions),
      deduction_notes: deduction_notes || null,
      total_salary: totalSalary,
      status,
      payment_date: status === "paid" ? today : null,
      paid_by: session.user.id,
    });

    return NextResponse.json({ success: true, message: "Gaji berhasil diproses", id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
