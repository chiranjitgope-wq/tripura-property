"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  type Property,
  type PropertyType,
} from "@/lib/properties";
import { supabase } from "@/lib/supabase";

type FilterType = "all" | PropertyType;

function dedupeBySlug(items: Property[]) {
  const map = new Map<string, Property>();

  for (const item of items) {
    if (!map.has(item.slug)) {
      map.set(item.slug, item);
    }
  }

  return Array.from(map.values());
}

export default function PropertiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search")?.toLowerCase() || "";
  const locationQuery = searchParams.get("location")?.toLowerCase() || "";

  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  const [filterType, setFilterType] = useState<FilterType>("all");
  // 🟢 Added Loading State to prevent "No properties found" flash
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProperties();
  }, []);

  async function loadProperties() {
    try {
      setLoading(true); // Fetching shuru hote hi loader on
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        return;
      }

      setSavedProperties((data || []) as Property[]);
    } catch (error) {
      console.error("Failed to load properties:", error);
    } finally {
      // Data milte hi loader band (400ms delay for smooth animation transition)
      setTimeout(() => setLoading(false), 400);
    }
  }

  useEffect(() => {
    const type = searchParams.get("type");

    if (
      type === "house" ||
      type === "flat" ||
      type === "plot" ||
      type === "rent"
    ) {
      setFilterType(type);
    } else {
      setFilterType("all");
    }
  }, [searchParams]);

  const allProperties = useMemo(
    () => dedupeBySlug(savedProperties),
    [savedProperties]
  );

  const filteredProperties = useMemo(() => {
    let sorted = [...allProperties].sort(
      (a, b) =>
        Number(b.premium) - Number(a.premium) ||
        Number(b.featured) - Number(a.featured)
    );

    if (filterType !== "all") {
      sorted = sorted.filter(
        (property) => property.type === filterType
      );
    }

    if (searchQuery) {
      sorted = sorted.filter(
        (property) =>
          property.title?.toLowerCase().includes(searchQuery) ||
          property.location?.toLowerCase().includes(searchQuery)
      );
    }

    if (locationQuery) {
      sorted = sorted.filter(
        (property) =>
          property.location?.toLowerCase().includes(locationQuery)
      );
    }

    return sorted;
  }, [
    allProperties,
    filterType,
    searchQuery,
    locationQuery,
  ]);

  const filterLinks: { label: string; type: FilterType }[] = [
    { label: "All", type: "all" },
    { label: "House", type: "house" },
    { label: "Flat", type: "flat" },
    { label: "Plot", type: "plot" },
    { label: "Rent", type: "rent" },
  ];

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-black capitalize">
              {filterType === "all"
                ? "All Properties"
                : `${filterType} Properties`}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Total listings: {loading ? "..." : filteredProperties.length}
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex w-fit rounded-full bg-gradient-to-r from-emerald-600 to-green-500 px-5 py-2 text-sm font-bold text-white shadow-lg hover:scale-105 transition"
          >
            🏠 Home
          </Link>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {filterLinks.map((item) => {
            const active = filterType === item.type;

            return (
              <button
                key={item.type}
                type="button"
                onClick={() => {
                  setFilterType(item.type);

                  router.push(
                    item.type === "all"
                      ? "/properties"
                      : `/properties?type=${item.type}`
                  );
                }}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-emerald-600 text-white"
                    : "border border-slate-200 bg-white text-slate-700"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* 🔴 BRANDED LOGO TEXT SPINNER (Jab tak fetch call complete nahi hoti) */}
        {loading ? (
          <div className="rounded-3xl border border-slate-100 bg-white p-12 text-center shadow-sm flex flex-col items-center justify-center gap-4 min-h-[300px]">
            {/* Circular Spinner Ring */}
            <div className="relative flex items-center justify-center h-20 w-20">
              <div className="absolute inset-0 rounded-full border-[4px] border-slate-100 border-t-emerald-600 animate-spin"></div>
              <span className="text-2xl">🏢</span>
            </div>
            
            {/* Website Branding with Pulse effect */}
            <div className="space-y-1">
              <h2 className="text-xl font-black bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 bg-clip-text text-transparent animate-pulse tracking-tight">
                Tripura Property
              </h2>
              <p className="text-slate-400 text-[10px] tracking-wider uppercase font-bold">
                Loading Verified Listings...
              </p>
            </div>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-bold">No properties found</h2>

            <p className="mt-2 text-sm text-slate-500">
              Try another category or add a new listing from admin.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
            {filteredProperties.map((property, index) => {
              const badge = property.premium
                ? "Premium"
                : property.featured
                ? "Featured"
                : property.type?.toUpperCase();

              const propertyId = `TP${String(index + 1).padStart(3, "0")}`;

              return (
                <Link
                  key={property.id}
                  href={`/properties/${property.slug}`}
                  className="block"
                >
                  <article
                    className={`overflow-hidden rounded-[26px] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${
                      property.premium
                        ? "border-2 border-yellow-400"
                        : "border border-slate-200"
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={property.image}
                        alt={property.title}
                        className="h-32 w-full object-cover sm:h-56"
                      />

                      <div className="absolute left-3 top-3 flex flex-col gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-semibold ${
                            property.premium
                              ? "bg-yellow-400 text-black"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {badge}
                        </span>

                        {property.verified && (
                          <span className="rounded-full bg-blue-600 px-3 py-1 text-[10px] font-semibold text-white">
                            ✅ Verified
                          </span>
                        )}

                        {property.urgent_sale && (
                          <span className="animate-pulse rounded-full bg-red-600 px-3 py-1 text-[10px] font-semibold text-white">
                            🔥 Urgent Sale
                          </span>
                        )}
                      </div>

                      <span className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                        #{propertyId}
                      </span>
                    </div>

                    <div className="p-3 sm:p-5">
                      <h2 className="text-xs font-bold sm:text-lg line-clamp-1">
                        {property.title}
                      </h2>

                      <p className="mt-1 text-[10px] text-slate-500 sm:text-sm line-clamp-1">
                        {property.location}
                      </p>

                      <div className="mt-3 text-sm font-black text-emerald-600 sm:text-2xl">
                        {property.price}
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-slate-500 sm:text-xs">
                        <span className="rounded-full bg-slate-100 px-3 py-1 capitalize">
                          {property.type}
                        </span>

                        {property.area && (
                          <span className="rounded-full bg-slate-100 px-3 py-1">
                            {property.area}
                          </span>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-[10px] text-gray-500 sm:text-xs">
                          Property ID: {propertyId}
                        </span>

                        <span className="rounded-full bg-green-50 px-3 py-1 text-[10px] font-semibold text-green-700">
                          View Details →
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}