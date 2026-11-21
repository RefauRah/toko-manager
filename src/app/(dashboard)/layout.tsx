import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // If user is super admin with no store and goes to dashboard, let them through or redirect to admin
  const store = session.store;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        storeName={store?.name}
        tier={store?.tier || "free"}
        role={store?.role || "owner"}
        isPlatformAdmin={session.isPlatformAdmin}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          userName={session.user.name}
          storeName={store?.name}
          tier={store?.tier}
        />
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
