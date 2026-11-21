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
    const range = searchParams.get("range") || "this_month"; // today, 7days, 30days, this_month, custom
    let startDate = searchParams.get("startDate");
    let endDate = searchParams.get("endDate");

    const now = new Date();
    const todayStr = formatLocalDate(now);

    if (range === "today") {
      startDate = todayStr;
      endDate = todayStr;
    } else if (range === "7days") {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      startDate = formatLocalDate(d);
      endDate = todayStr;
    } else if (range === "30days") {
      const d = new Date(now);
      d.setDate(d.getDate() - 30);
      startDate = formatLocalDate(d);
      endDate = todayStr;
    } else if (range === "this_month" || (!startDate && !endDate)) {
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
      startDate = `${year}-${month}-01`;
      endDate = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;
    }

    // 1. Transactions & Items in period
    const transactions = await db("transactions")
      .where({ store_id: session.store.id })
      .andWhere("created_at", ">=", `${startDate} 00:00:00`)
      .andWhere("created_at", "<=", `${endDate} 23:59:59`);

    const transactionIds = transactions.map((t) => t.id);

    let totalRevenue = 0;
    let totalModalHPP = 0;

    transactions.forEach((t) => {
      totalRevenue += Number(t.final_amount || 0);
    });

    if (transactionIds.length > 0) {
      const items = await db("transaction_items")
        .whereIn("transaction_id", transactionIds);

      items.forEach((item) => {
        const qty = Number(item.quantity || 0);
        const purchasePrice = Number(item.purchase_price || 0);
        totalModalHPP += qty * purchasePrice;
      });
    }

    // 2. Expenses in period
    const expenses = await db("expenses")
      .leftJoin("expense_categories", "expenses.category_id", "expense_categories.id")
      .where({ "expenses.store_id": session.store.id })
      .andWhere("expenses.expense_date", ">=", startDate)
      .andWhere("expenses.expense_date", "<=", endDate)
      .select("expenses.*", "expense_categories.name as category_name");

    let totalOperationalExpenses = 0;
    const expensesByCategory: Record<string, number> = {};

    expenses.forEach((e) => {
      const amt = Number(e.amount || 0);
      totalOperationalExpenses += amt;
      const cat = e.category_name || "Lain-lain";
      expensesByCategory[cat] = (expensesByCategory[cat] || 0) + amt;
    });

    // 3. Salaries paid in period
    const salaries = await db("salary_payments")
      .where({ store_id: session.store.id, status: "paid" })
      .andWhere("payment_date", ">=", startDate)
      .andWhere("payment_date", "<=", endDate);

    let totalSalaries = 0;
    salaries.forEach((s) => {
      totalSalaries += Number(s.total_salary || 0);
    });

    // 4. Calculations
    const grossProfit = totalRevenue - totalModalHPP;
    const totalAllExpenses = totalOperationalExpenses + totalSalaries;
    const netProfit = grossProfit - totalAllExpenses;
    const isProfitable = netProfit >= 0;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0.0";

    // 5. Daily trend data for charts
    const dailyMap = new Map<string, { date: string; revenue: number; modal: number; expenses: number }>();
    
    // Fill days safely using local date components
    const [startYear, startMonth, startDay] = startDate!.split("-").map(Number);
    const [endYear, endMonth, endDay] = endDate!.split("-").map(Number);
    const curr = new Date(startYear, startMonth - 1, startDay);
    const stop = new Date(endYear, endMonth - 1, endDay);

    while (curr <= stop) {
      const dStr = formatLocalDate(curr);
      dailyMap.set(dStr, { date: dStr, revenue: 0, modal: 0, expenses: 0 });
      curr.setDate(curr.getDate() + 1);
    }

    transactions.forEach((t) => {
      const d = formatLocalDate(new Date(t.created_at));
      if (dailyMap.has(d)) {
        const item = dailyMap.get(d)!;
        item.revenue += Number(t.final_amount || 0);
      }
    });

    expenses.forEach((e) => {
      const d = e.expense_date;
      if (dailyMap.has(d)) {
        const item = dailyMap.get(d)!;
        item.expenses += Number(e.amount || 0);
      }
    });

    const chartData = Array.from(dailyMap.values());

    // 6. Top Selling Products
    let topProducts: any[] = [];
    if (transactionIds.length > 0) {
      topProducts = await db("transaction_items")
        .whereIn("transaction_id", transactionIds)
        .groupBy("product_name")
        .select(
          "product_name",
          db.raw("SUM(quantity) as total_sold"),
          db.raw("SUM(subtotal) as total_sales")
        )
        .orderBy("total_sold", "desc")
        .limit(5);
    }

    // 7. Low Stock Alerts
    const lowStockProducts = await db("products")
      .where({ store_id: session.store.id, is_active: true })
      .andWhere(db.raw("stock_quantity <= min_stock_alert"))
      .orderBy("stock_quantity", "asc")
      .limit(10);

    return NextResponse.json({
      startDate,
      endDate,
      summary: {
        totalRevenue,
        totalModalHPP,
        grossProfit,
        totalOperationalExpenses,
        totalSalaries,
        totalAllExpenses,
        netProfit,
        isProfitable,
        profitMargin,
        transactionCount: transactions.length,
      },
      expensesByCategory,
      chartData,
      topProducts,
      lowStockProducts,
    });
  } catch (error: any) {
    console.error("Profit-Loss API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
