"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Property = {
  id: string;
  premium?: boolean;
  featured?: boolean;
};

export default function AdminDashboardPage() {
  const [total, setTotal] = useState(0);
  const [free, setFree] = useState(0);
  const [premium, setPremium] = useState(0);
  const [featured, setFeatured] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*");

      if (error) {
        console.error(error);
        return;
      }

      const items = (data || []) as Property[];

      setTotal(items.length);
      setPremium(items.filter((p) => p.premium).length);
      setFeatured(items.filter((p) => p.featured).length);
      setFree(items.filter((p) => !p.premium).length);
    } catch (error) {
      console.error("Dashboard Error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>

          <p className="mt-2 text-gray-600">
            Welcome to Tripura Property Admin Panel.
          </p>
        </div>

        <Link
          href="/admin/properties/new"
          className="rounded-xl bg-black px-5 py-3 text-white"
        >
          Add Property
        </Link>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Properties</p>

          <h2 className="mt-2 text-3xl font-bold">
            {loading ? "..." : total}
          </h2>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Free Listings</p>

          <h2 className="mt-2 text-3xl font-bold">
            {loading ? "..." : free}
          </h2>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Premium Listings</p>

          <h2 className="mt-2 text-3xl font-bold">
            {loading ? "..." : premium}
          </h2>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Featured Listings</p>

          <h2 className="mt-2 text-3xl font-bold">
            {loading ? "..." : featured}
          </h2>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold">Quick Actions</h3>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/admin/properties"
            className="rounded-xl border px-4 py-2"
          >
            Manage Properties
          </Link>

          <Link
            href="/admin/settings"
            className="rounded-xl border px-4 py-2"
          >
            Settings
          </Link>

          <Link
            href="/admin/plans"
            className="rounded-xl border px-4 py-2"
          >
            Plans
          </Link>
        </div>
      </div>
    </div>
  );
}