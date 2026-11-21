import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { checkLimit } from "@/lib/subscription";
import { generateInvoiceNumber } from "@/lib/format";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.store) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const search = searchParams.get("search");

    let query = db("transactions")
      .leftJoin("users", "transactions.cashier_id", "users.id")
      .where({ "transactions.store_id": session.store.id })
      .select("transactions.*", "users.name as cashier_name")
      .orderBy("transactions.created_at", "desc");

    if (startDate) {
      query = query.andWhere("transactions.created_at", ">=", startDate + " 00:00:00");
    }
    if (endDate) {
      query = query.andWhere("transactions.created_at", "<=", endDate + " 23:59:59");
    }
    if (search) {
      query = query.andWhereILike("transactions.invoice_number", `%${search}%`);
    }

    const transactions = await query.limit(100);
    return NextResponse.json({ transactions });
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

    // Check transaction limit (Free tier max 50/month)
    const limitCheck = await checkLimit(session.store.id, "transactions");
    if (!limitCheck.allowed) {
      return NextResponse.json({ error: limitCheck.message, upgradeNeeded: true }, { status: 403 });
    }

    const body = await req.json();
    const { items, discount_amount = 0, payment_method = "cash", paid_amount = 0, notes } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Keranjang belanja tidak boleh kosong" }, { status: 400 });
    }

    // Process transaction inside DB transaction
    const result = await db.transaction(async (trx) => {
      let totalAmount = 0;
      const itemsToInsert: any[] = [];
      const stockUpdates: { id: string; newStock: number; qty: number }[] = [];

      for (const item of items) {
        const product = await trx("products")
          .where({ id: item.productId, store_id: session.store!.id, is_active: true })
          .first();

        if (!product) {
          throw new Error(`Produk "${item.productName || item.productId}" tidak ditemukan`);
        }

        const qty = Number(item.quantity);
        if (qty <= 0) {
          throw new Error(`Jumlah untuk "${product.name}" harus lebih dari 0`);
        }

        if (product.stock_quantity < qty) {
          throw new Error(`Stok "${product.name}" tidak mencukupi (sisa ${product.stock_quantity}, diminta ${qty})`);
        }

        const unitPrice = Number(product.selling_price);
        const purchasePrice = Number(product.purchase_price);
        const subtotal = unitPrice * qty;
        totalAmount += subtotal;

        itemsToInsert.push({
          id: "ti-" + Math.random().toString(36).substring(2, 10),
          product_id: product.id,
          product_name: product.name,
          quantity: qty,
          unit_price: unitPrice,
          purchase_price: purchasePrice, // snapshot modal barang saat transaksi!
          subtotal,
        });

        stockUpdates.push({
          id: product.id,
          newStock: product.stock_quantity - qty,
          qty,
        });
      }

      const discount = Math.max(0, Number(discount_amount || 0));
      const finalAmount = Math.max(0, totalAmount - discount);
      const paid = Number(paid_amount || finalAmount);
      const change = Math.max(0, paid - finalAmount);

      const transactionId = "trx-" + Math.random().toString(36).substring(2, 10);
      const invoiceNumber = generateInvoiceNumber();

      // Insert transaction header
      await trx("transactions").insert({
        id: transactionId,
        store_id: session.store!.id,
        cashier_id: session.user.id,
        invoice_number: invoiceNumber,
        total_amount: totalAmount,
        discount_amount: discount,
        final_amount: finalAmount,
        payment_method,
        paid_amount: paid,
        change_amount: change,
        notes: notes?.trim() || null,
      });

      // Insert transaction items
      for (const itm of itemsToInsert) {
        itm.transaction_id = transactionId;
        await trx("transaction_items").insert(itm);
      }

      // Update product stocks and record movements
      for (const su of stockUpdates) {
        await trx("products")
          .where({ id: su.id })
          .update({ stock_quantity: su.newStock });

        await trx("stock_movements").insert({
          id: "smv-" + Math.random().toString(36).substring(2, 10),
          product_id: su.id,
          store_id: session.store!.id,
          type: "out",
          quantity: su.qty,
          reference: invoiceNumber,
          notes: "Penjualan POS",
          created_by: session.user.id,
        });
      }

      return {
        transactionId,
        invoiceNumber,
        totalAmount,
        discountAmount: discount,
        finalAmount,
        paidAmount: paid,
        changeAmount: change,
        itemsCount: itemsToInsert.length,
      };
    });

    return NextResponse.json({
      success: true,
      message: "Transaksi berhasil diproses!",
      data: result,
    });
  } catch (error: any) {
    console.error("POST /api/transactions error:", error);
    return NextResponse.json({ error: error.message || "Gagal memproses transaksi" }, { status: 400 });
  }
}
