"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { properties as staticProperties, type Property } from "@/lib/properties";

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
    if (!map.has(item.slug)) map.set(item.slug, item);
  }
  return Array.from(map.values());
}

export default function PropertyDetailPage() {
  const params = useParams();
  const slugValue = params?.slug;
  const slug = Array.isArray(slugValue) ? slugValue[0] : slugValue;

  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [property, setProperty] = useState<Property | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("tripura-properties");
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) setSavedProperties(parsed.filter(isValidProperty));
    } catch (error) {
      console.error("Failed to load saved properties:", error);
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("tripura-favorites");
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setFavoriteIds(parsed.filter((id) => typeof id === "string"));
      }
    } catch {
      // ignore
    }
  }, []);

  const allProperties = useMemo(
    () => dedupeBySlug([...savedProperties, ...staticProperties]),
    [savedProperties]
  );

  useEffect(() => {
    if (!slug) return;
    const found = allProperties.find((item) => item.slug === slug) || null;
    setProperty(found);
  }, [allProperties, slug]);

  function toggleFavorite(id: string) {
    setFavoriteIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];

      localStorage.setItem("tripura-favorites", JSON.stringify(next));
      return next;
    });
  }

  function openWhatsApp(message: string) {
    const number = "919999999999";
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, "_blank");
  }

  async function shareProperty() {
    if (!property) return;

    const text = `${property.title} - ${property.location}`;
    const url = `${window.location.origin}/properties/${property.slug}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text,
          url,
        });
        return;
      } catch {
        // fall back
      }
    }

    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
    } catch {
      // ignore
    }
  }

  if (!slug) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-6">
        <p>Invalid URL</p>
      </main>
    );
  }

  if (!property) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-6">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold">Property not found</h1>
          <p className="mt-2 text-gray-600">
            This property may not exist yet.
          </p>
          <Link href="/properties" className="mt-4 inline-block text-blue-600">
            Back to properties
          </Link>
        </div>
      </main>
    );
  }

  const isFavorite = favoriteIds.includes(property.id);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto max-w-6xl">
        <Link href="/properties" className="mb-4 inline-block text-blue-600">
          ← Back to properties
        </Link>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <img
              src={property.image}
              alt={property.title}
              className="h-80 w-full rounded-3xl object-cover bg-white shadow"
            />

            <div className="grid grid-cols-2 gap-3">
              {property.images?.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${property.title} ${index + 1}`}
                  className="h-28 w-full rounded-2xl object-cover bg-white shadow"
                />
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">{property.title}</h1>
                <p className="mt-2 text-gray-600">{property.location}</p>
              </div>

              <button
                type="button"
                onClick={() => toggleFavorite(property.id)}
                className="rounded-full border px-4 py-2 text-sm font-medium"
              >
                {isFavorite ? "Saved" : "Save"}
              </button>
            </div>

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
              {property.featured && (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
                  Featured
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

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => openWhatsApp(`Hi, I want details about ${property.title} in ${property.location}.`)}
                className="rounded-full bg-emerald-600 px-5 py-3 font-semibold text-white"
              >
                WhatsApp
              </button>

              <button
                type="button"
                onClick={shareProperty}
                className="rounded-full border px-5 py-3 font-semibold"
              >
                Share
              </button>
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
      </div>
    </main>
  );
}