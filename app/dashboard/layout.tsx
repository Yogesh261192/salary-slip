import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireAdmin } from "@/lib/appwrite/server";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return <DashboardShell user={user}>{children}</DashboardShell>;
}
