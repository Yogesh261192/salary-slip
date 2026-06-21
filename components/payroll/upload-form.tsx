"use client";

import { useState } from "react";
import { DownloadCloud, FileSpreadsheet, Send, UploadCloud } from "lucide-react";
import { toast } from "sonner";

export function UploadForm() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadReady, setDownloadReady] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setProgress(20);
    setDownloadReady(false);

    const formData = new FormData(event.currentTarget);
    
    try {
      const response = await fetch("/api/payroll/upload", {
        method: "POST",
        body: formData
      });

      setProgress(85);

      if (!response.ok) {
        const result = await response.json();
        toast.error(result.error || "Upload failed");
        setLoading(false);
        setProgress(0);
        return;
      }

      // Get month/year for filename
      const month = formData.get("salaryMonth");
      const year = formData.get("salaryYear");
      const fileName = `salary-slips-${year}-${String(month).padStart(2, "0")}.zip`;

      // Download the ZIP file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setProgress(100);
      toast.success("Salary slips processed and downloaded successfully");
      setDownloadReady(true);
    } catch (error) {
      toast.error("An error occurred during processing");
      console.error(error);
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Salary Month</span>
          <select name="salaryMonth" required className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950">
            {Array.from({ length: 12 }, (_, index) => (
              <option key={index + 1} value={index + 1}>
                {new Date(2000, index, 1).toLocaleString("en-IN", { month: "long" })}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Salary Year</span>
          <input name="salaryYear" type="number" min="2000" max="2100" defaultValue={new Date().getFullYear()} required className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Excel File *</span>
          <input name="excelFile" type="file" accept=".xlsx,.xls" required className="mt-2 w-full rounded-md border border-dashed border-slate-300 px-3 py-3 text-sm dark:border-slate-700" />
          <p className="mt-1 text-xs text-slate-500">3 sheets required:Employees, Salary, Deductions</p>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Company Logo (Optional)</span>
          <input name="logoFile" type="file" accept="image/png,image/jpeg,image/webp" className="mt-2 w-full rounded-md border border-dashed border-slate-300 px-3 py-3 text-sm dark:border-slate-700" />
        </label>
      </div>

      <label className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-200">
        <input name="sendEmail" type="checkbox" className="h-4 w-4 rounded border-slate-300 text-payroll-600" />
        <Send size={16} />
        Email Salary Slips To Employees
      </label>

      {loading || progress > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>{progress === 100 ? "Complete!" : "Processing..."}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div className="h-full bg-payroll-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-md bg-payroll-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-payroll-700 disabled:opacity-60">
          <UploadCloud size={18} />
          {loading ? "Processing..." : "Upload & Process"}
        </button>
         <a
  href="/sample-salary-data.xlsx"
  download
  className="inline-flex items-center gap-2 rounded-md bg-payroll-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-payroll-700"
>
  <DownloadCloud size={18} />
  Sample Sheet
</a>
        {downloadReady && (
          <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-2">
            <FileSpreadsheet size={16} />
            ZIP file downloaded successfully
          </div>
        )}
      </div>
    </form>
  );
}
