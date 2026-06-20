import { UploadForm } from "@/components/payroll/upload-form";

export default function UploadPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white">Upload Salary Sheet</h1>
        <p className="mt-1 text-sm text-slate-500">Upload one workbook with Company, Employee, Salary, and Deductions sheets.</p>
      </div>
      <UploadForm />
    </div>
  );
}
