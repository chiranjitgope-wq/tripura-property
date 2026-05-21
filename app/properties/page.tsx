"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  properties as staticProperties,
  type Property,
} from "@/lib/properties";

type CategoryType = "house" | "flat" | "plot" | "rent";

export default function PropertiesPage() {
  const searchParams = useSearchParams();

  const type = searchParams.get("type");

  const [savedProperties, setSavedProperties] = useState<Property[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("tripura-properties");

      if (!raw) return;

      const parsed = JSON.parse(raw);

      if (Array.isArray(parsed)) {
        setSavedProperties(parsed);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  const allProperties = useMemo(() => {
    return [...savedProperties, ...staticProperties];
  }, [savedProperties]);

  const filteredProperties =
    type &&
    ["house", "flat", "plot", "rent"].includes(type)
      ? allProperties.filter(
          (item) => item.type === (type as CategoryType)
        )
      : allProperties;

  return (
    <main className="min-h-screen bg-gray-100 p-5">
      <h1 className="mb-6 text-3xl font-bold capitalize">
        {type ? `${type} Properties` : "All Properties"}
      </h1>

      <div className="grid gap-5">
        {filteredProperties.map((property) => (
          <Link
            key={property.id}
            href={`/properties/${property.slug}`}
            className="rounded-2xl bg-white p-4 shadow"
          >
            <img
              src={property.image}
              alt={property.title}
              className="h-52 w-full rounded-xl object-cover"
            />

            <h2 className="mt-4 text-xl font-bold">
              {property.title}
            </h2>

            <p className="text-gray-600">
              {property.location}
            </p>

            <p className="mt-2 font-semibold text-green-600">
              {property.price}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}