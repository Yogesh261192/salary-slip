import { Download } from "lucide-react";
import { listGeneratedPdfs } from "@/lib/payroll/repository";

export const dynamic = "force-dynamic";

export default async function SlipsPage() {
  const pdfs = await listGeneratedPdfs();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white">Generated Salary Slips</h1>
        <p className="mt-1 text-sm text-slate-500">Download employee-specific PDFs generated from payroll uploads.</p>
      </div>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800">
            <tr>
              <th className="px-5 py-3">Employee ID</th>
              <th className="px-5 py-3">File Name</th>
              <th className="px-5 py-3">Created</th>
              <th className="px-5 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {pdfs.documents.map((pdf) => (
              <tr key={pdf.$id}>
                <td className="px-5 py-3">{pdf.employeeId}</td>
                <td className="px-5 py-3">{pdf.fileName}</td>
                <td className="px-5 py-3">{new Date(pdf.createdAt || pdf.$createdAt).toLocaleString("en-IN")}</td>
                <td className="px-5 py-3">
                  <a href={`/api/files/${pdf.fileId}`} className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
                    <Download size={14} />
                    PDF
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
