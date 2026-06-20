"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, LogIn } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", { method: "POST", body: formData });
    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      toast.error(result.error || "Login failed");
      return;
    }

    toast.success("Welcome back");
    router.push(params.get("next") || "/dashboard");
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <label className="block">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Email</span>
        <input
          name="email"
          type="email"
          required
          className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none ring-payroll-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Password</span>
        <div className="mt-2 flex rounded-md border border-slate-300 bg-white focus-within:ring-2 focus-within:ring-payroll-500 dark:border-slate-700 dark:bg-slate-950">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            required
            className="min-w-0 flex-1 rounded-md bg-transparent px-3 py-2.5 text-sm outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="px-3 text-slate-500"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </label>
      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-payroll-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-payroll-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LogIn size={18} />
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
