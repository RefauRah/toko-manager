import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.isPlatformAdmin) {
      return NextResponse.json({ error: "Unauthorized: Super Admin access required" }, { status: 403 });
    }

    const totalStoresRes = await db("stores").count("id as count").first();
    const totalStores = Number(totalStoresRes?.count || 0);

    const totalUsersRes = await db("users").count("id as count").first();
    const totalUsers = Number(totalUsersRes?.count || 0);

    const tierBreakdown = await db("stores")
      .groupBy("subscription_tier")
      .select("subscription_tier", db.raw("count(*) as count"));

    let freeCount = 0;
    let proCount = 0;
    let enterpriseCount = 0;

    tierBreakdown.forEach((t: any) => {
      if (t.subscription_tier === "free") freeCount = Number(t.count);
      if (t.subscription_tier === "pro") proCount = Number(t.count);
      if (t.subscription_tier === "enterprise") enterpriseCount = Number(t.count);
    });

    const activeSubscribers = proCount + enterpriseCount;
    // MRR: Pro (25.000) + Enterprise (249.000)
    const mrr = proCount * 25000 + enterpriseCount * 249000;
    const arr = mrr * 12;

    const pendingPaymentsRes = await db("subscription_payments")
      .where({ status: "pending" })
      .count("id as count")
      .first();
    const pendingPaymentsCount = Number(pendingPaymentsRes?.count || 0);

    // Recent store registrations
    const recentStores = await db("stores")
      .orderBy("created_at", "desc")
      .limit(5);

    // Recent payments
    const recentPayments = await db("subscription_payments")
      .join("stores", "subscription_payments.store_id", "stores.id")
      .select("subscription_payments.*", "stores.name as store_name")
      .orderBy("subscription_payments.created_at", "desc")
      .limit(5);

    return NextResponse.json({
      metrics: {
        totalStores,
        totalUsers,
        activeSubscribers,
        freeCount,
        proCount,
        enterpriseCount,
        mrr,
        arr,
        pendingPaymentsCount,
      },
      recentStores,
      recentPayments,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
