import Link from "next/link";
import { Building2, FileArchive, FileSpreadsheet, LayoutDashboard, Settings, Upload, Users } from "lucide-react";
import type { Models } from "node-appwrite";
import { LogoutButton } from "@/components/layout/logout-button";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/upload", label: "Upload Salary Sheet", icon: Upload },
  // { href: "/dashboard/slips", label: "Generated Salary Slips", icon: FileArchive },
  // { href: "/dashboard/employees", label: "Employee Records", icon: Users },
  // { href: "/dashboard/company", label: "Company Profile", icon: Building2 },
  // { href: "/dashboard/reports", label: "Reports", icon: FileSpreadsheet },
  // { href: "/dashboard/settings", label: "Settings", icon: Settings }
];

export function DashboardShell({ user, children }: { user: Models.User<Models.Preferences>; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white px-5 py-6 dark:border-slate-800 dark:bg-slate-900 lg:block">
        <Link href="/dashboard" className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-payroll-600">Salary Slip</span>
          <span className="mt-1 block text-2xl font-bold text-slate-950 dark:text-white">PayrollDesk</span>
        </Link>
        <nav className="mt-8 space-y-1">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Logged in as</p>
              <h2 className="text-base font-semibold text-slate-950 dark:text-white">{user.name || user.email}</h2>
            </div>
            <LogoutButton />
          </div>
        </header>
        <main className="px-5 py-6">{children}</main>
      </div>
    </div>
  );
}
