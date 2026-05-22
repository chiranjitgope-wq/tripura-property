"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  properties as staticProperties,
  type Property,
  type PropertyType,
} from "@/lib/properties";

type FilterType = "all" | PropertyType;

function isValidProperty(item: unknown): item is Property {
  if (!item || typeof item !== "object") return false;

  const p = item as Record<string, unknown>;

  return (
    typeof p.id === "string" &&
    typeof p.slug === "string" &&
    typeof p.type === "string" &&
    typeof p.title === "string" &&
    typeof p.location === "string" &&
    typeof p.price === "string" &&
    typeof p.image === "string" &&
    Array.isArray(p.images)
  );
}

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

  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  const [filterType, setFilterType] = useState<FilterType>("all");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("tripura-properties");

      if (!raw) return;

      const parsed = JSON.parse(raw);

      if (Array.isArray(parsed)) {
        setSavedProperties(parsed.filter(isValidProperty));
      }
    } catch (error) {
      console.error("Failed to load saved properties:", error);
    }
  }, []);

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
    () => dedupeBySlug([...savedProperties, ...staticProperties]),
    [savedProperties]
  );

  const filteredProperties = useMemo(() => {
    const sorted = [...allProperties].sort(
      (a, b) =>
        Number(b.premium) - Number(a.premium) ||
        Number(b.featured) - Number(a.featured)
    );

    if (filterType === "all") return sorted;

    return sorted.filter((property) => property.type === filterType);
  }, [allProperties, filterType]);

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
              Total listings: {filteredProperties.length}
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex w-fit rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold"
          >
            ← Home
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

        {filteredProperties.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-bold">No properties found</h2>

            <p className="mt-2 text-sm text-slate-500">
              Try another category or add a new listing from admin.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
            {filteredProperties.map((property) => {
              const badge = property.premium
                ? "Premium"
                : property.featured
                ? "Featured"
                : property.type.toUpperCase();

              return (
                <Link
                  key={property.id}
                  href={`/properties/${property.slug}`}
                  className="block"
                >
                  <article className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                    <div className="relative">
                      <img
                        src={property.image}
                        alt={property.title}
                        className="h-32 w-full object-cover sm:h-56"
                      />

                      <span className="absolute left-3 top-3 rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-semibold text-emerald-700">
                        {badge}
                      </span>
                    </div>

                    <div className="p-3 sm:p-5">
                      <h2 className="text-xs font-bold sm:text-lg">
                        {property.title}
                      </h2>

                      <p className="mt-1 text-[10px] text-slate-500 sm:text-sm">
                        {property.location}
                      </p>

                      <div className="mt-3 text-sm font-black text-emerald-600 sm:text-2xl">
                        {property.price}
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-slate-500 sm:text-xs">
                        <span className="rounded-full bg-slate-100 px-3 py-1">
                          {property.type}
                        </span>

                        <span className="rounded-full bg-slate-100 px-3 py-1">
                          {property.area}
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