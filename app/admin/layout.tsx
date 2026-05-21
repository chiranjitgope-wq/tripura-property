import Link from "next/link";
import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="flex min-h-screen">
        <aside className="w-64 border-r border-gray-200 bg-white p-5">
          <div className="mb-8">
            <h1 className="text-xl font-bold">Tripura Property</h1>
            <p className="text-sm text-gray-500">Admin Panel</p>
          </div>

          <nav className="space-y-2">
            <Link
              href="/admin"
              className="block rounded-lg px-3 py-2 hover:bg-gray-100"
            >
              Dashboard
            </Link>

            <Link
              href="/admin/properties"
              className="block rounded-lg px-3 py-2 hover:bg-gray-100"
            >
              Properties
            </Link>

            <Link
              href="/admin/properties/new"
              className="block rounded-lg px-3 py-2 hover:bg-gray-100"
            >
              Add Property
            </Link>

            <Link
              href="/admin/plans"
              className="block rounded-lg px-3 py-2 hover:bg-gray-100"
            >
              Plans
            </Link>

            <Link
              href="/admin/settings"
              className="block rounded-lg px-3 py-2 hover:bg-gray-100"
            >
              Settings
            </Link>
          </nav>
        </aside>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}