import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { checkFeatureAccess } from "@/lib/subscription";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.store) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const categories = await db("expense_categories")
      .where({ store_id: session.store.id })
      .orderBy("name", "asc");

    return NextResponse.json({ categories });
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

    // Custom expense categories require Pro / Enterprise tier
    const access = await checkFeatureAccess(session.store.id, "customExpenseCategories");
    if (!access.allowed) {
      return NextResponse.json(
        { error: "Menambah kategori pengeluaran kustom memerlukan paket Pro (Rp 25.000/bln).", upgradeNeeded: true },
        { status: 403 }
      );
    }

    const { name } = await req.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: "Nama kategori wajib diisi" }, { status: 400 });
    }

    const id = "ec-" + Math.random().toString(36).substring(2, 10);
    await db("expense_categories").insert({
      id,
      store_id: session.store.id,
      name: name.trim(),
      is_default: false,
    });

    return NextResponse.json({ success: true, id, name: name.trim() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
