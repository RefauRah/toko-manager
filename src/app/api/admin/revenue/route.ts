import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.isPlatformAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // All confirmed subscription payments
    const payments = await db("subscription_payments")
      .join("stores", "subscription_payments.store_id", "stores.id")
      .where({ "subscription_payments.status": "confirmed" })
      .select("subscription_payments.*", "stores.name as store_name")
      .orderBy("subscription_payments.created_at", "desc");

    let totalRevenue = 0;
    let proRevenue = 0;
    let enterpriseRevenue = 0;

    payments.forEach((p) => {
      const amt = Number(p.amount || 0);
      totalRevenue += amt;
      if (p.tier === "pro") proRevenue += amt;
      if (p.tier === "enterprise") enterpriseRevenue += amt;
    });

    const activeProStoresRes = await db("stores").where({ subscription_tier: "pro" }).count("id as count").first();
    const activeEntStoresRes = await db("stores").where({ subscription_tier: "enterprise" }).count("id as count").first();

    const proCount = Number(activeProStoresRes?.count || 0);
    const entCount = Number(activeEntStoresRes?.count || 0);

    const mrr = proCount * 25000 + entCount * 249000;
    const arr = mrr * 12;

    return NextResponse.json({
      revenueMetrics: {
        totalRevenueLifetime: totalRevenue,
        proRevenue,
        enterpriseRevenue,
        mrr,
        arr,
        activeProStores: proCount,
        activeEnterpriseStores: entCount,
      },
      confirmedPayments: payments,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
