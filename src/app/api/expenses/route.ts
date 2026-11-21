import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { formatLocalDate } from "@/lib/format";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.store) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const categoryId = searchParams.get("categoryId");

    let query = db("expenses")
      .leftJoin("expense_categories", "expenses.category_id", "expense_categories.id")
      .leftJoin("users", "expenses.created_by", "users.id")
      .where({ "expenses.store_id": session.store.id })
      .select(
        "expenses.*",
        "expense_categories.name as category_name",
        "users.name as creator_name"
      )
      .orderBy("expenses.expense_date", "desc")
      .orderBy("expenses.created_at", "desc");

    if (startDate) {
      query = query.andWhere("expenses.expense_date", ">=", startDate);
    }
    if (endDate) {
      query = query.andWhere("expenses.expense_date", "<=", endDate);
    }
    if (categoryId) {
      query = query.andWhere({ "expenses.category_id": categoryId });
    }

    const expenses = await query;
    const totalAmount = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

    return NextResponse.json({ expenses, totalAmount });
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
      return NextResponse.json({ error: "Kasir tidak memiliki hak akses mencatat pengeluaran" }, { status: 403 });
    }

    const body = await req.json();
    const { category_id, amount, description, expense_date } = body;

    if (!amount || !description) {
      return NextResponse.json({ error: "Jumlah pengeluaran dan deskripsi wajib diisi" }, { status: 400 });
    }

    const id = "exp-" + Math.random().toString(36).substring(2, 10);
    const date = expense_date || formatLocalDate();

    await db("expenses").insert({
      id,
      store_id: session.store.id,
      category_id: category_id || null,
      amount: Number(amount),
      description: description.trim(),
      expense_date: date,
      created_by: session.user.id,
    });

    return NextResponse.json({ success: true, message: "Pengeluaran berhasil dicatat", id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
