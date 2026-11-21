import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { AuthSession } from "@/types";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "toko-manager-super-secret-key-321!@#"
);

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(payload: AuthSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET);
}

export async function verifySessionToken(token: string): Promise<AuthSession | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as AuthSession;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<AuthSession | null> {
  const cookieStore = cookies();
  const token = cookieStore.get("tm_session")?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function getUserWithStore(userId: string): Promise<AuthSession | null> {
  const user = await db("users").where({ id: userId }).first();
  if (!user) return null;

  // Check if platform admin
  const platformAdmin = await db("platform_admins")
    .where({ user_id: userId, is_active: true })
    .first();

  // Find active store membership
  const member = await db("store_members")
    .join("stores", "store_members.store_id", "stores.id")
    .where({ "store_members.user_id": userId, "store_members.is_active": true })
    .select(
      "stores.id as store_id",
      "stores.name as store_name",
      "stores.subscription_tier",
      "stores.subscription_expires_at",
      "stores.is_suspended",
      "store_members.role"
    )
    .first();

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    store: member
      ? {
          id: member.store_id,
          name: member.store_name,
          tier: member.subscription_tier,
          expires_at: member.subscription_expires_at,
          is_suspended: Boolean(member.is_suspended),
          role: member.role,
        }
      : null,
    isPlatformAdmin: Boolean(platformAdmin),
    adminRole: platformAdmin ? platformAdmin.role : null,
  };
}
