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
    const search = searchParams.get("search");
    const tier = searchParams.get("tier");

    let query = db("stores")
      .select("stores.*")
      .orderBy("stores.created_at", "desc");

    if (search) {
      query = query.andWhereILike("stores.name", `%${search}%`);
    }
    if (tier && tier !== "all") {
      query = query.andWhere({ "stores.subscription_tier": tier });
    }

    const stores = await query;

    // Attach owners & counts for each store
    const enhancedStores = await Promise.all(
      stores.map(async (st) => {
        const owner = await db("store_members")
          .join("users", "store_members.user_id", "users.id")
          .where({ "store_members.store_id": st.id, "store_members.role": "owner" })
          .select("users.name", "users.email")
          .first();

        const prodCount = await db("products")
          .where({ store_id: st.id, is_active: true })
          .count("id as count")
          .first();

        const txCount = await db("transactions")
          .where({ store_id: st.id })
          .count("id as count")
          .first();

        return {
          ...st,
          owner_name: owner?.name || "-",
          owner_email: owner?.email || "-",
          products_count: Number(prodCount?.count || 0),
          transactions_count: Number(txCount?.count || 0),
        };
      })
    );

    return NextResponse.json({ stores: enhancedStores });
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

    const { store_id, action, tier, days } = await req.json();
    if (!store_id) {
      return NextResponse.json({ error: "Store ID wajib diisi" }, { status: 400 });
    }

    if (action === "suspend") {
      await db("stores").where({ id: store_id }).update({ is_suspended: true });
      return NextResponse.json({ success: true, message: "Toko berhasil disuspend" });
    } else if (action === "unsuspend") {
      await db("stores").where({ id: store_id }).update({ is_suspended: false });
      return NextResponse.json({ success: true, message: "Toko berhasil diaktifkan kembali" });
    } else if (action === "change_tier") {
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + (Number(days) || 30));

      await db("stores").where({ id: store_id }).update({
        subscription_tier: tier,
        subscription_expires_at: tier === "free" ? null : expDate.toISOString().slice(0, 10),
      });

      return NextResponse.json({ success: true, message: `Tier toko berhasil diubah menjadi ${tier}` });
    }

    return NextResponse.json({ error: "Aksi tidak dikenal" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
