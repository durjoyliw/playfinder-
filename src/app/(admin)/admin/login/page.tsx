"use client";

import { useState } from "react";
import { adminLogin } from "./actions";

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);

    const result = await adminLogin(formData);

    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#08090a] px-4 text-[#f2f5ef]">
      <form
        action={handleSubmit}
        className="w-full max-w-sm space-y-5 rounded-xl border border-[#2a2f2a] bg-[#121412] p-8"
      >
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Admin login</h1>
          <p className="text-sm text-[#8a8f86]">PlayFinder internal access</p>
        </div>

        {error && (
          <p className="rounded-md border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <label className="block space-y-1.5 text-sm">
          <span className="text-[#c4c9bf]">Username</span>
          <input
            name="username"
            type="text"
            autoComplete="username"
            required
            className="h-10 w-full rounded-md border border-[#2a2f2a] bg-[#08090a] px-3 text-sm text-[#f2f5ef] outline-none focus:border-[#dcef5a]"
          />
        </label>

        <label className="block space-y-1.5 text-sm">
          <span className="text-[#c4c9bf]">Password</span>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="h-10 w-full rounded-md border border-[#2a2f2a] bg-[#08090a] px-3 text-sm text-[#f2f5ef] outline-none focus:border-[#dcef5a]"
          />
        </label>

        <button
          type="submit"
          disabled={pending}
          className="h-10 w-full rounded-md bg-[#dcef5a] text-sm font-semibold text-[#08090a] disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Login"}
        </button>
      </form>
    </main>
  );
}
