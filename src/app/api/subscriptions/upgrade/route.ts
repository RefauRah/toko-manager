import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { TIER_CONFIGS } from "@/lib/subscription";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.store) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.store.role !== "owner") {
      return NextResponse.json({ error: "Hanya pemilik toko yang dapat melakukan upgrade paket" }, { status: 403 });
    }

    const { tier, bank_name, account_number, account_holder, notes, payment_proof } = await req.json();

    if (tier !== "pro" && tier !== "enterprise") {
      return NextResponse.json({ error: "Paket tidak valid" }, { status: 400 });
    }

    const tierInfo = TIER_CONFIGS[tier as "pro" | "enterprise"];
    const amount = tierInfo.price;

    const id = "subpay-" + Math.random().toString(36).substring(2, 10);
    await db("subscription_payments").insert({
      id,
      store_id: session.store.id,
      tier,
      amount,
      bank_name: bank_name?.trim() || null,
      account_number: account_number?.trim() || null,
      account_holder: account_holder?.trim() || null,
      payment_proof: payment_proof || "Bukti transfer telah dilampirkan",
      notes: notes?.trim() || null,
      status: "pending",
    });

    return NextResponse.json({
      success: true,
      message: "Konfirmasi pembayaran telah terkirim! Admin platform akan memverifikasi dalam 1x24 jam.",
      id,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.store) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payments = await db("subscription_payments")
      .where({ store_id: session.store.id })
      .orderBy("created_at", "desc");

    // Get platform bank accounts
    const bankSetting = await db("platform_settings").where({ key: "bank_accounts" }).first();
    const bankAccounts = bankSetting ? JSON.parse(bankSetting.value) : [];

    return NextResponse.json({
      currentTier: session.store.tier,
      expiresAt: session.store.expires_at,
      payments,
      bankAccounts,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
