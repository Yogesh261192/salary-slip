import { Upload } from "lucide-react";
import Link from "next/link";
import { getCurrentAdmin } from "@/lib/appwrite/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const admin = await getCurrentAdmin();
  console.log("Current admin:", admin); 
  if (!admin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-950 dark:text-white">Not Authenticated</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            <Link href="/login" className="text-payroll-600 hover:underline">Go to login</Link>
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your salary slip processing and distribution.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <Link
          href="/dashboard/upload"
          className="block rounded-lg border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-payroll-50 p-3 dark:bg-slate-800">
              <Upload className="h-6 w-6 text-payroll-700 dark:text-payroll-100" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-950 dark:text-white">Upload Payroll</h2>
              <p className="mt-1 text-sm text-slate-500">Upload Excel file to generate and distribute salary slips</p>
            </div>
          </div>
        </Link>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-semibold text-slate-950 dark:text-white">How it works</h2>
        <ol className="mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-300">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-payroll-100 font-semibold text-payroll-700 dark:bg-slate-800">1</span>
            <span>Prepare your Excel file with 3 sheets: Employees, Salary, and Deductions</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-payroll-100 font-semibold text-payroll-700 dark:bg-slate-800">2</span>
            <span>Upload the file along with an optional company logo</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-payroll-100 font-semibold text-payroll-700 dark:bg-slate-800">3</span>
            <span>Optionally enable email sending to distribute salary slips to employees</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-payroll-100 font-semibold text-payroll-700 dark:bg-slate-800">4</span>
            <span>Download all salary slips as a ZIP file</span>
          </li>
        </ol>
      </section>
    </div>
  );
}
