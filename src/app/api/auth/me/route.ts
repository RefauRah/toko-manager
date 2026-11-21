import { NextResponse } from "next/server";
import { getSession, getUserWithStore } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  // Refresh latest store & user data from database
  const refreshed = await getUserWithStore(session.user.id);
  if (!refreshed) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: refreshed.user,
    store: refreshed.store,
    isPlatformAdmin: refreshed.isPlatformAdmin,
    adminRole: refreshed.adminRole,
  });
}
