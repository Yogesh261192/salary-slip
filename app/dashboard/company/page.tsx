import { Building2 } from "lucide-react";
import { listCompanies } from "@/lib/payroll/repository";

export const dynamic = "force-dynamic";

export default async function CompanyPage() {
  const companies = await listCompanies();
  const latest = companies.documents[0];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white">Company Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Company details are imported from Sheet 1 of the latest workbook.</p>
      </div>
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {latest ? (
          <div className="flex flex-col gap-5 md:flex-row md:items-start">
            <div className="flex h-16 w-16 items-center justify-center rounded-md bg-payroll-50 text-payroll-700 dark:bg-slate-800">
              <Building2 size={28} />
            </div>
            <div className="grid flex-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">Company Name</p>
                <p className="font-semibold text-slate-950 dark:text-white">{latest.companyName}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">GST Number</p>
                <p className="font-semibold text-slate-950 dark:text-white">{latest.gstNumber}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Phone Number</p>
                <p className="font-semibold text-slate-950 dark:text-white">{latest.phoneNumber}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Address</p>
                <p className="font-semibold text-slate-950 dark:text-white">{latest.address}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">No company profile has been imported yet.</p>
        )}
      </section>
    </div>
  );
}
