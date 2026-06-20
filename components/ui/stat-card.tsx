import type { LucideIcon } from "lucide-react";

export function StatCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: LucideIcon }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">{value}</p>
        </div>
        <div className="rounded-md bg-payroll-50 p-3 text-payroll-700 dark:bg-slate-800 dark:text-payroll-100">
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}
