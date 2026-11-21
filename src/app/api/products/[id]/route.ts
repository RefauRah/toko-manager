import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session?.store) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const product = await db("products")
      .leftJoin("product_categories", "products.category_id", "product_categories.id")
      .where({ "products.id": params.id, "products.store_id": session.store.id })
      .select("products.*", "product_categories.name as category_name")
      .first();

    if (!product) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }

    const movements = await db("stock_movements")
      .where({ product_id: params.id })
      .orderBy("created_at", "desc")
      .limit(20);

    return NextResponse.json({ product, movements });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session?.store) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.store.role === "cashier") {
      return NextResponse.json({ error: "Kasir tidak memiliki hak akses mengubah produk" }, { status: 403 });
    }

    const body = await req.json();
    const { name, sku, category_id, purchase_price, selling_price, stock_quantity, min_stock_alert, stock_adjustment, adjustment_reason } = body;

    const current = await db("products")
      .where({ id: params.id, store_id: session.store.id })
      .first();

    if (!current) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }

    let newStock = current.stock_quantity;
    if (stock_adjustment !== undefined && Number(stock_adjustment) !== 0) {
      const adj = Number(stock_adjustment);
      newStock += adj;

      await db("stock_movements").insert({
        id: "smv-" + Math.random().toString(36).substring(2, 10),
        product_id: params.id,
        store_id: session.store.id,
        type: adj > 0 ? "in" : "out",
        quantity: Math.abs(adj),
        reference: adjustment_reason || "Penyesuaian Stok Manual",
        created_by: session.user.id,
      });
    }

    await db("products")
      .where({ id: params.id, store_id: session.store.id })
      .update({
        name: name !== undefined ? name : current.name,
        sku: sku !== undefined ? sku : current.sku,
        category_id: category_id !== undefined ? category_id : current.category_id,
        purchase_price: purchase_price !== undefined ? Number(purchase_price) : current.purchase_price,
        selling_price: selling_price !== undefined ? Number(selling_price) : current.selling_price,
        stock_quantity: newStock,
        min_stock_alert: min_stock_alert !== undefined ? Number(min_stock_alert) : current.min_stock_alert,
        updated_at: db.fn.now(),
      });

    return NextResponse.json({ success: true, message: "Produk berhasil diperbarui" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session?.store) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.store.role === "cashier") {
      return NextResponse.json({ error: "Kasir tidak memiliki hak akses menghapus produk" }, { status: 403 });
    }

    await db("products")
      .where({ id: params.id, store_id: session.store.id })
      .update({ is_active: false });

    return NextResponse.json({ success: true, message: "Produk berhasil dinonaktifkan" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
