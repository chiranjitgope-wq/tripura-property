"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Property = {
  id: string;
  premium?: boolean;
};

export default function AdminDashboardPage() {
  const [total, setTotal] = useState(0);
  const [free, setFree] = useState(0);
  const [premium, setPremium] = useState(0);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
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
    setFree(items.filter((p) => !p.premium).length);
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <p className="mt-2 text-gray-600">
        Welcome to Tripura Property Admin Panel.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Properties</p>

          <h2 className="mt-2 text-2xl font-bold">
            {total}
          </h2>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Free Listings</p>

          <h2 className="mt-2 text-2xl font-bold">
            {free}
          </h2>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Premium Listings</p>

          <h2 className="mt-2 text-2xl font-bold">
            {premium}
          </h2>
        </div>
      </div>
    </div>
  );
}