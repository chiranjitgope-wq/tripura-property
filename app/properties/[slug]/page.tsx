"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { properties as staticProperties, type Property } from "@/lib/properties";

type CategoryType = "house" | "flat" | "plot" | "rent";

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

export default function PropertyPage() {
  const params = useParams();
  const slugValue = params?.slug;
  const slug = Array.isArray(slugValue) ? slugValue[0] : slugValue;

  const [savedProperties, setSavedProperties] = useState<Property[]>([]);

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

  const allProperties = useMemo(() => {
    const combined = [...savedProperties, ...staticProperties];
    const uniqueMap = new Map<string, Property>();

    for (const item of combined) {
      if (!uniqueMap.has(item.slug)) {
        uniqueMap.set(item.slug, item);
      }
    }

    return Array.from(uniqueMap.values());
  }, [savedProperties]);

  const isCategoryPage =
    slug === "house" || slug === "flat" || slug === "plot" || slug === "rent";

  if (!slug) {
    return (
      <main className="min-h-screen bg-gray-100 p-5">
        <p>Invalid URL</p>
      </main>
    );
  }

  if (isCategoryPage) {
    const categorySlug = slug as CategoryType;

    const categoryProperties = allProperties.filter(
      (item) => item.type === categorySlug
    );

    return (
      <main className="min-h-screen bg-gray-100 p-5">
        <Link href="/properties" className="mb-4 inline-block text-blue-600">
          ← Back to all properties
        </Link>

        <h1 className="mb-2 text-3xl font-bold capitalize">
          {categorySlug} Properties
        </h1>
        <p className="mb-6 text-gray-600">
          Total listings: {categoryProperties.length}
        </p>

        {categoryProperties.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-gray-600">No properties found in this category.</p>
          </div>
        ) : (
          <div className="grid gap-5">
            {categoryProperties.map((property) => (
              <Link
                key={property.id}
                href={`/properties/${property.slug}`}
                className="rounded-2xl bg-white p-4 shadow transition hover:shadow-md"
              >
                <img
                  src={property.image}
                  alt={property.title}
                  className="h-52 w-full rounded-xl object-cover"
                />

                <div className="mt-4">
                  <h2 className="text-xl font-bold">{property.title}</h2>
                  <p className="text-gray-600">{property.location}</p>
                  <p className="mt-2 font-semibold text-green-600">
                    {property.price}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    );
  }

  const property = allProperties.find((item) => item.slug === slug);

  if (!property) {
    return (
      <main className="min-h-screen bg-gray-100 p-5">
        <div className="rounded-2xl bg-white p-6 shadow">
          <h1 className="text-2xl font-bold">Property not found</h1>
          <p className="mt-2 text-gray-600">
            This property slug does not exist.
          </p>
          <Link href="/properties" className="mt-4 inline-block text-blue-600">
            Back to properties
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-5">
      <Link href="/properties" className="mb-4 inline-block text-blue-600">
        ← Back to properties
      </Link>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <img
            src={property.image}
            alt={property.title}
            className="h-80 w-full rounded-2xl object-cover bg-white shadow"
          />

          <div className="grid grid-cols-2 gap-3">
            {property.images?.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`${property.title} ${index + 1}`}
                className="h-28 w-full rounded-xl object-cover bg-white shadow"
              />
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <h1 className="text-3xl font-bold">{property.title}</h1>
          <p className="mt-2 text-gray-600">{property.location}</p>
          <p className="mt-4 text-2xl font-semibold text-green-600">
            {property.price}
          </p>

          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <span className="rounded-full bg-gray-100 px-3 py-1">
              {property.type}
            </span>
            {property.premium && (
              <span className="rounded-full bg-yellow-100 px-3 py-1 text-yellow-700">
                Premium
              </span>
            )}
          </div>

          <p className="mt-5 text-gray-700">{property.description}</p>

          <div className="mt-6 space-y-2 text-sm text-gray-600">
            <p>
              <strong>Area:</strong> {property.area}
            </p>
            {property.beds !== undefined && (
              <p>
                <strong>Beds:</strong> {property.beds}
              </p>
            )}
            {property.baths !== undefined && (
              <p>
                <strong>Baths:</strong> {property.baths}
              </p>
            )}
          </div>

          {property.youtubeUrl && (
            <div className="mt-6">
              <p className="mb-2 font-semibold">Video</p>
              <a
                href={property.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline"
              >
                Open YouTube link
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}