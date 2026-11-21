import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { checkLimit } from "@/lib/subscription";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.store) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || "";

    let query = db("products")
      .leftJoin("product_categories", "products.category_id", "product_categories.id")
      .where({ "products.store_id": session.store.id, "products.is_active": true })
      .select(
        "products.*",
        "product_categories.name as category_name"
      )
      .orderBy("products.created_at", "desc");

    if (search) {
      query = query.andWhere((builder) => {
        builder
          .whereILike("products.name", `%${search}%`)
          .orWhereILike("products.sku", `%${search}%`);
      });
    }

    if (categoryId) {
      query = query.andWhere({ "products.category_id": categoryId });
    }

    const products = await query;
    return NextResponse.json({ products });
  } catch (error: any) {
    console.error("GET /api/products error:", error);
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
      return NextResponse.json({ error: "Kasir tidak memiliki hak akses menambah produk" }, { status: 403 });
    }

    // Check tier limits for products (Free tier max 30)
    const limitCheck = await checkLimit(session.store.id, "products");
    if (!limitCheck.allowed) {
      return NextResponse.json({ error: limitCheck.message, upgradeNeeded: true }, { status: 403 });
    }

    const body = await req.json();
    const { name, sku, category_id, purchase_price, selling_price, stock_quantity, min_stock_alert } = body;

    if (!name || purchase_price === undefined || selling_price === undefined) {
      return NextResponse.json({ error: "Nama produk, harga beli, dan harga jual wajib diisi" }, { status: 400 });
    }

    const productId = "prod-" + Math.random().toString(36).substring(2, 10);
    const initialStock = Number(stock_quantity || 0);

    await db("products").insert({
      id: productId,
      store_id: session.store.id,
      category_id: category_id || null,
      name: name.trim(),
      sku: sku?.trim() || null,
      purchase_price: Number(purchase_price),
      selling_price: Number(selling_price),
      stock_quantity: initialStock,
      min_stock_alert: Number(min_stock_alert || 5),
      is_active: true,
    });

    // Record stock movement if initial stock > 0
    if (initialStock > 0) {
      await db("stock_movements").insert({
        id: "smv-" + Math.random().toString(36).substring(2, 10),
        product_id: productId,
        store_id: session.store.id,
        type: "in",
        quantity: initialStock,
        reference: "Stok Awal Produk",
        created_by: session.user.id,
      });
    }

    return NextResponse.json({ success: true, message: "Produk berhasil ditambahkan", id: productId });
  } catch (error: any) {
    console.error("POST /api/products error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
