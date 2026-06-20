import { listSalaryRecords } from "@/lib/payroll/repository";
import { formatCurrency } from "@/lib/payroll/calculations";

export const dynamic = "force-dynamic";

export default async function ReportsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const filters = {
    month: params.month ? Number(params.month) : undefined,
    year: params.year ? Number(params.year) : undefined,
    employee: params.employee,
    department: params.department
  };
  const records = await listSalaryRecords(filters);
  const query = new URLSearchParams(Object.entries(params).filter((entry): entry is [string, string] => Boolean(entry[1])));
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white">Reports</h1>
        <p className="mt-1 text-sm text-slate-500">Filter payroll records and export Excel, CSV, or PDF reports.</p>
      </div>
      <form className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-5">
        <input name="month" placeholder="Month" defaultValue={params.month} className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
        <input name="year" placeholder="Year" defaultValue={params.year} className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
        <input name="employee" placeholder="Employee" defaultValue={params.employee} className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
        <input name="department" placeholder="Department" defaultValue={params.department} className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
        <button className="rounded-md bg-payroll-600 px-4 py-2 text-sm font-semibold text-white">Filter</button>
      </form>
      <div className="flex flex-wrap gap-3">
        {["xlsx", "csv", "pdf"].map((format) => (
          <a key={format} href={`/api/reports/export?${query.toString()}&format=${format}`} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold uppercase hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
            Export {format}
          </a>
        ))}
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800">
            <tr>
              <th className="px-5 py-3">Employee</th>
              <th className="px-5 py-3">Department</th>
              <th className="px-5 py-3">Period</th>
              <th className="px-5 py-3">Gross</th>
              <th className="px-5 py-3">Deductions</th>
              <th className="px-5 py-3">Net</th>
              <th className="px-5 py-3">Email</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {records.documents.map((record) => (
              <tr key={record.$id}>
                <td className="px-5 py-3">{record.employeeName}</td>
                <td className="px-5 py-3">{record.department}</td>
                <td className="px-5 py-3">{record.salaryMonth}/{record.salaryYear}</td>
                <td className="px-5 py-3">{formatCurrency(record.grossSalary)}</td>
                <td className="px-5 py-3">{formatCurrency(record.totalDeductions)}</td>
                <td className="px-5 py-3 font-semibold">{formatCurrency(record.netSalary)}</td>
                <td className="px-5 py-3">{record.emailStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
