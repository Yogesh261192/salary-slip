import { listEmployees } from "@/lib/payroll/repository";

export const dynamic = "force-dynamic";

export default async function EmployeesPage() {
  const employees = await listEmployees();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white">Employee Records</h1>
        <p className="mt-1 text-sm text-slate-500">Search and review employees imported from salary sheets.</p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <input className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" placeholder="Search employees in browser..." />
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800">
            <tr>
              <th className="px-5 py-3">Employee</th>
              <th className="px-5 py-3">Department</th>
              <th className="px-5 py-3">Designation</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Mobile</th>
              <th className="px-5 py-3">Bank</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {employees.documents.map((employee) => (
              <tr key={employee.$id}>
                <td className="px-5 py-3">
                  <p className="font-semibold text-slate-950 dark:text-white">{employee.employeeName}</p>
                  <p className="text-xs text-slate-500">{employee.employeeId}</p>
                </td>
                <td className="px-5 py-3">{employee.department}</td>
                <td className="px-5 py-3">{employee.designation}</td>
                <td className="px-5 py-3">{employee.email}</td>
                <td className="px-5 py-3">{employee.mobile}</td>
                <td className="px-5 py-3">{employee.bankName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
