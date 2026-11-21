import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.isPlatformAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "all";

    let query = db("subscription_payments")
      .join("stores", "subscription_payments.store_id", "stores.id")
      .select("subscription_payments.*", "stores.name as store_name")
      .orderBy("subscription_payments.created_at", "desc");

    if (status !== "all") {
      query = query.andWhere({ "subscription_payments.status": status });
    }

    const payments = await query;
    return NextResponse.json({ payments });
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

    const { payment_id, action, notes } = await req.json();
    if (!payment_id || !action) {
      return NextResponse.json({ error: "ID pembayaran dan aksi wajib diisi" }, { status: 400 });
    }

    const payment = await db("subscription_payments").where({ id: payment_id }).first();
    if (!payment) {
      return NextResponse.json({ error: "Pembayaran tidak ditemukan" }, { status: 404 });
    }

    if (action === "approve") {
      const today = new Date();
      const expDate = new Date();
      expDate.setDate(today.getDate() + 30); // 30 days active

      const startStr = today.toISOString().slice(0, 10);
      const endStr = expDate.toISOString().slice(0, 10);

      await db.transaction(async (trx) => {
        // 1. Update payment status
        await trx("subscription_payments")
          .where({ id: payment_id })
          .update({
            status: "confirmed",
            confirmed_by: session.user.id,
            period_start: startStr,
            period_end: endStr,
            notes: notes || "Disetujui oleh admin platform",
            updated_at: trx.fn.now(),
          });

        // 2. Activate client store tier
        await trx("stores")
          .where({ id: payment.store_id })
          .update({
            subscription_tier: payment.tier,
            subscription_expires_at: endStr,
            updated_at: trx.fn.now(),
          });
      });

      return NextResponse.json({
        success: true,
        message: `Pembayaran disetujui! Paket ${payment.tier.toUpperCase()} untuk toko telah aktif sampai ${endStr}.`,
      });
    } else if (action === "reject") {
      await db("subscription_payments")
        .where({ id: payment_id })
        .update({
          status: "rejected",
          confirmed_by: session.user.id,
          notes: notes || "Pembayaran ditolak / bukti transfer tidak valid",
          updated_at: db.fn.now(),
        });

      return NextResponse.json({ success: true, message: "Pembayaran berhasil ditolak" });
    }

    return NextResponse.json({ error: "Aksi tidak dikenal" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
