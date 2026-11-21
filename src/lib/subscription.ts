import { db } from "./db";
import { SubscriptionTier } from "@/types";

export interface TierConfig {
  name: string;
  price: number;
  originalPrice?: number;
  period: string;
  limits: {
    maxUsers: number;
    maxProducts: number;
    maxMonthlyTransactions: number;
    maxEmployees: number;
  };
  features: {
    charts: boolean;
    exportPdf: boolean;
    exportExcel: boolean;
    employees: boolean;
    salaryPayroll: boolean;
    customExpenseCategories: boolean;
    lowStockAlert: boolean;
    multiBranch: boolean;
    apiAccess: boolean;
  };
}

export const TIER_CONFIGS: Record<SubscriptionTier, TierConfig> = {
  free: {
    name: "Free (Gratis)",
    price: 0,
    period: "selamanya",
    limits: {
      maxUsers: 1,
      maxProducts: 30,
      maxMonthlyTransactions: 50,
      maxEmployees: 0,
    },
    features: {
      charts: false,
      exportPdf: false,
      exportExcel: false,
      employees: false,
      salaryPayroll: false,
      customExpenseCategories: false,
      lowStockAlert: false,
      multiBranch: false,
      apiAccess: false,
    },
  },
  pro: {
    name: "Pro",
    price: 25000,
    originalPrice: 99000,
    period: "bulan",
    limits: {
      maxUsers: 5,
      maxProducts: Infinity,
      maxMonthlyTransactions: Infinity,
      maxEmployees: 10,
    },
    features: {
      charts: true,
      exportPdf: true,
      exportExcel: true,
      employees: true,
      salaryPayroll: true,
      customExpenseCategories: true,
      lowStockAlert: true,
      multiBranch: false,
      apiAccess: false,
    },
  },
  enterprise: {
    name: "Enterprise",
    price: 249000,
    period: "bulan",
    limits: {
      maxUsers: Infinity,
      maxProducts: Infinity,
      maxMonthlyTransactions: Infinity,
      maxEmployees: Infinity,
    },
    features: {
      charts: true,
      exportPdf: true,
      exportExcel: true,
      employees: true,
      salaryPayroll: true,
      customExpenseCategories: true,
      lowStockAlert: true,
      multiBranch: true,
      apiAccess: true,
    },
  },
};

export async function checkFeatureAccess(
  storeId: string,
  feature: keyof TierConfig["features"]
): Promise<{ allowed: boolean; tier: SubscriptionTier; message?: string }> {
  const store = await db("stores").where({ id: storeId }).first();
  if (!store) {
    return { allowed: false, tier: "free", message: "Toko tidak ditemukan" };
  }

  // Check expiration if on paid tier
  let activeTier = (store.subscription_tier || "free") as SubscriptionTier;
  if (activeTier !== "free" && store.subscription_expires_at) {
    const expiresAt = new Date(store.subscription_expires_at);
    if (expiresAt < new Date()) {
      activeTier = "free";
    }
  }

  const allowed = TIER_CONFIGS[activeTier].features[feature];
  if (!allowed) {
    return {
      allowed: false,
      tier: activeTier,
      message: `Fitur ini membutuhkan paket Pro (Rp 25.000/bln) atau Enterprise.`,
    };
  }

  return { allowed: true, tier: activeTier };
}

export async function checkLimit(
  storeId: string,
  resource: "users" | "products" | "transactions" | "employees"
): Promise<{ allowed: boolean; current: number; limit: number; tier: SubscriptionTier; message?: string }> {
  const store = await db("stores").where({ id: storeId }).first();
  if (!store) {
    return { allowed: false, current: 0, limit: 0, tier: "free", message: "Toko tidak ditemukan" };
  }

  let activeTier = (store.subscription_tier || "free") as SubscriptionTier;
  if (activeTier !== "free" && store.subscription_expires_at) {
    const expiresAt = new Date(store.subscription_expires_at);
    if (expiresAt < new Date()) {
      activeTier = "free";
    }
  }

  const limits = TIER_CONFIGS[activeTier].limits;
  let current = 0;
  let limit = Infinity;

  if (resource === "products") {
    limit = limits.maxProducts;
    const res = await db("products").where({ store_id: storeId, is_active: true }).count("id as count").first();
    current = Number(res?.count || 0);
  } else if (resource === "users") {
    limit = limits.maxUsers;
    const res = await db("store_members").where({ store_id: storeId, is_active: true }).count("id as count").first();
    current = Number(res?.count || 0);
  } else if (resource === "employees") {
    limit = limits.maxEmployees;
    const res = await db("employees").where({ store_id: storeId, is_active: true }).count("id as count").first();
    current = Number(res?.count || 0);
  } else if (resource === "transactions") {
    limit = limits.maxMonthlyTransactions;
    // Current month transactions
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const res = await db("transactions")
      .where({ store_id: storeId })
      .andWhere("created_at", ">=", startOfMonth.toISOString())
      .count("id as count")
      .first();
    current = Number(res?.count || 0);
  }

  if (current >= limit) {
    return {
      allowed: false,
      current,
      limit,
      tier: activeTier,
      message: `Batas kuota ${resource} untuk paket ${TIER_CONFIGS[activeTier].name} sudah tercapai (${current}/${limit}). Silakan upgrade ke paket Pro (hanya Rp 25.000/bln) untuk akses tanpa batas!`,
    };
  }

  return { allowed: true, current, limit, tier: activeTier };
}
