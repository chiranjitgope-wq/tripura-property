"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // simple temporary password
    if (password === "tripura123") {
      localStorage.setItem("admin-auth", "true");

      router.push("/admin");
    } else {
      setError("Wrong password");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-5">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="mb-2 text-3xl font-bold">
          Admin Login
        </h1>

        <p className="mb-6 text-gray-500">
          Tripura Property Admin Panel
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full rounded-2xl border px-4 py-3 outline-none"
            />
          </div>

          {error && (
            <div className="rounded-2xl bg-red-100 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-2xl bg-black px-4 py-3 font-semibold text-white"
          >
            Login
          </button>
        </form>
      </div>
    </main>
  );
}