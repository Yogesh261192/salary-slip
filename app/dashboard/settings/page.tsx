import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const settings = [
    ["Database", env.APPWRITE_DATABASE_ID],
    ["Uploads Bucket", env.APPWRITE_UPLOADS_BUCKET_ID],
    ["PDF Bucket", env.APPWRITE_PDFS_BUCKET_ID],
    ["Email Provider", env.SMTP_HOST ? "SMTP configured" : "Not configured"],
    ["Admin Role", env.ADMIN_ROLE]
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Runtime configuration loaded from environment variables.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {settings.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 font-semibold text-slate-950 dark:text-white">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
