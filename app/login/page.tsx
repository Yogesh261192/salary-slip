import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-payroll-600">Payroll Admin</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">Sign in</h1>
          <p className="mt-2 text-sm text-slate-500">Access is restricted to Appwrite users with admin role.</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
