"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { type Property } from "@/lib/properties";

type AdminSettings = {
  whatsappNumber: string;
};

type LeadForm = {
  fullName: string;
  phone: string;
  budget: string;
  area: string;
  message: string;
};

type PropertyItem = Property & {
  verified?: boolean;
  urgent_sale?: boolean;
};

const SETTINGS_KEY = "tripura-settings";
const FAVORITES_KEY = "tripura-favorites";

function dedupeBySlug(items: PropertyItem[]) {
  const map = new Map<string, PropertyItem>();
  for (const item of items) {
    if (!map.has(item.slug)) {
      map.set(item.slug, item);
    }
  }
  return Array.from(map.values());
}

export default function PropertyDetailPage() {
  const params = useParams();
  const slugValue = params?.slug;
  const slug = Array.isArray(slugValue) ? slugValue[0] : slugValue;

  const [savedProperties, setSavedProperties] = useState<PropertyItem[]>([]);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<PropertyItem | null>(null);
  const [previewImage, setPreviewImage] = useState("");
  const [leadForm, setLeadForm] = useState<LeadForm>({
    fullName: "",
    phone: "",
    budget: "",
    area: "",
    message: "",
  });

  // Load WhatsApp settings from Database with formatting check
  useEffect(() => {
    async function fetchSettings() {
      try {
        const rawSettings = localStorage.getItem(SETTINGS_KEY);
        if (rawSettings) {
          const parsed = JSON.parse(rawSettings) as Partial<AdminSettings>;
          if (parsed.whatsappNumber) {
            const cleanNum = parsed.whatsappNumber.replace(/[^\d]/g, "");
            setWhatsappNumber(cleanNum.length === 10 ? `91${cleanNum}` : cleanNum);
          }
        }

        const { data, error } = await supabase.from("settings").select("data").eq("id", 1).single();
        if (data?.data?.whatsappNumber) {
          const dbNum = data.data.whatsappNumber.replace(/[^\d]/g, "");
          const verifiedNum = dbNum.length === 10 ? `91${dbNum}` : dbNum;
          setWhatsappNumber(verifiedNum);
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(data.data));
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    }
    fetchSettings();
  }, []);

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const { data, error } = await supabase
          .from("properties")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Failed to load properties:", error);
          setSavedProperties([]);
        } else {
          const mapped = Array.isArray(data)
            ? data.map((item: any) => ({
                ...item,
                youtubeUrl: item.youtubeUrl || item.youtube_url,
              }))
            : [];
          setSavedProperties(mapped as PropertyItem[]);
        }
      } catch (error) {
        console.error("Failed to load saved properties:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProperties();
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setFavoriteIds(parsed.filter((id) => typeof id === "string"));
      }
    } catch {
      // ignore
    }
  }, []);

  const allProperties = useMemo(() => dedupeBySlug(savedProperties), [savedProperties]);

  const property = useMemo(() => {
    if (!slug) return null;
    return allProperties.find((item) => item.slug === slug) || null;
  }, [allProperties, slug]);

  const similarProperties = useMemo(() => {
    if (!property) return [];
    return allProperties
      .filter(
        (item) =>
          item.id !== property.id &&
          (item.type === property.type ||
            item.location.toLowerCase().includes(property.location.toLowerCase().split(",")[0] || ""))
      )
      .slice(0, 6);
  }, [allProperties, property]);

  function toggleFavorite(id: string) {
    setFavoriteIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  }

  // Optimized WhatsApp link redirect fallback
  async function openWhatsApp(message: string) {
    let targetNumber = whatsappNumber;

    if (!targetNumber) {
      // If state is slow, check Supabase instantly
      const { data } = await supabase.from("settings").select("data").eq("id", 1).single();
      if (data?.data?.whatsappNumber) {
        const dbNum = data.data.whatsappNumber.replace(/[^\d]/g, "");
        targetNumber = dbNum.length === 10 ? `91${dbNum}` : dbNum;
      }
    }

    if (!targetNumber) {
      alert("WhatsApp connection error. Please contact via phone or check Admin dashboard settings.");
      return;
    }

    window.open(`https://wa.me/${targetNumber}?text=${encodeURIComponent(message)}`, "_blank");
  }

  function handleLeadSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedProperty) return;

    const finalMessage = `Hi, I am interested in this property.\n\nProperty: ${selectedProperty.title}\nLocation: ${selectedProperty.location}\nPrice: ${selectedProperty.price}\n\nBuyer Details:\nName: ${leadForm.fullName}\nMobile: ${leadForm.phone}\nBudget: ${leadForm.budget}\nPreferred Area: ${leadForm.area}\n\nMessage:\n${leadForm.message || "Please share more details."}`.trim();

    openWhatsApp(finalMessage);
    setShowLeadForm(false);
    setSelectedProperty(null);
    setLeadForm({ fullName: "", phone: "", budget: "", area: "", message: "" });
  }

  async function shareProperty() {
    if (!property) return;
    const text = `${property.title} - ${property.location}`;
    const url = `${window.location.origin}/properties/${property.slug}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: property.title, text, url });
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

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-6">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-sm">Loading property...</div>
      </main>
    );
  }

  if (!property) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-6">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold">Property not found</h1>
          <p className="mt-2 text-gray-600">This property may not exist yet.</p>
          <Link href="/properties" className="mt-4 inline-block rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md">
            Back to properties
          </Link>
        </div>
      </main>
    );
  }

  const isFavorite = favoriteIds.includes(property.id);
  const badge = property.premium ? "Premium" : property.featured ? "Featured" : property.type.toUpperCase();
  const propertyId = `TP${String(allProperties.findIndex((item) => item.id === property.id) + 1).padStart(3, "0")}`;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link href="/properties" className="inline-block rounded-full bg-gradient-to-r from-slate-900 to-slate-700 px-4 py-2 text-sm font-semibold text-white shadow-md">
            ← Back to properties
          </Link>
          <Link href="/" className="inline-block rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-md">
            Home
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="relative">
              <img src={property.image} alt={property.title} className="h-80 w-full rounded-3xl object-cover bg-white shadow" />
              <div className="absolute left-4 top-4 flex flex-col gap-2">
                <span className={`rounded-full px-3 py-1 text-[10px] font-semibold shadow-md ${property.premium ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-black" : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"}`}>
                  {badge}
                </span>
                {property.verified && <span className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1 text-[10px] font-semibold text-white shadow-md">✅ Verified</span>}
                {property.urgent_sale && <span className="animate-pulse rounded-full bg-gradient-to-r from-red-600 to-rose-500 px-3 py-1 text-[10px] font-semibold text-white shadow-md">🔥 Urgent Sale</span>}
              </div>
              <span className="absolute right-4 top-4 rounded-full bg-black/70 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">#{propertyId}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {(property.images || []).map((img, index) => (
                <img key={index} src={img} alt={`${property.title} ${index + 1}`} onClick={() => setPreviewImage(img)} className="h-28 w-full cursor-pointer rounded-2xl object-cover bg-white shadow transition hover:scale-105" />
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">{property.title}</h1>
                <p className="mt-2 text-gray-600">{property.location}</p>
              </div>
              <button type="button" onClick={() => toggleFavorite(property.id)} className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2 text-sm font-medium text-black shadow-md">
                {isFavorite ? "Saved" : "Save"}
              </button>
            </div>

            <p className="mt-4 text-2xl font-semibold text-green-600">{property.price}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              <span className="rounded-full bg-gray-100 px-3 py-1">{property.type}</span>
              {property.premium && <span className="rounded-full bg-yellow-100 px-3 py-1 text-yellow-700">Premium</span>}
              {property.featured && <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">Featured</span>}
              {property.verified && <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">Verified</span>}
              {property.urgent_sale && <span className="rounded-full bg-red-100 px-3 py-1 text-red-700">Urgent Sale</span>}
            </div>

            <p className="mt-5 text-gray-700">{property.description}</p>
            {property.youtubeUrl && (
              <div className="mt-6">
                <a href={property.youtubeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-3 font-semibold text-white shadow-lg hover:bg-red-700">
                  ▶ Watch Full Property Video on YouTube
                </a>
              </div>
            )}

            <div className="mt-6 space-y-2 text-sm text-gray-600">
              <p><strong>Area:</strong> {property.area}</p>
              {property.beds !== undefined && <p><strong>Beds:</strong> {property.beds}</p>}
              {property.baths !== undefined && <p><strong>Baths:</strong> {property.baths}</p>}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedProperty(property);
                  setLeadForm({ fullName: "", phone: "", budget: "", area: "", message: "" });
                  setShowLeadForm(true);
                }}
                className="rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 px-5 py-3 font-semibold text-white shadow-lg"
              >
                📱 Contact Seller
              </button>
              <button type="button" onClick={shareProperty} className="rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 font-semibold text-white shadow-lg">
                ↗ Share
              </button>
            </div>
          </div>
        </div>

        {similarProperties.length > 0 && (
          <section className="mt-10">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Similar Properties</h2>
              <Link href="/properties" className="text-sm font-semibold text-blue-600">View all</Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
              {similarProperties.map((item) => {
                const itemBadge = item.premium ? "Premium" : item.featured ? "Featured" : item.type.toUpperCase();
                return (
                  <Link key={item.id} href={`/properties/${item.slug}`} className="block">
                    <article className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                      <div className="relative">
                        <img src={item.image} alt={item.title} className="h-32 w-full object-cover sm:h-56" />
                        <div className="absolute left-3 top-3 flex flex-col gap-2">
                          <span className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1 text-[10px] font-semibold text-white shadow-md">{itemBadge}</span>
                          {item.verified && <span className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1 text-[10px] font-semibold text-white shadow-md">✅ Verified</span>}
                          {item.urgent_sale && <span className="rounded-full bg-gradient-to-r from-red-600 to-rose-500 px-3 py-1 text-[10px] font-semibold text-white shadow-md">🔥 Urgent Sale</span>}
                        </div>
                      </div>
                      <div className="p-3 sm:p-5">
                        <h3 className="text-xs font-bold sm:text-lg">{item.title}</h3>
                        <p className="mt-1 text-[10px] text-slate-500 sm:text-sm">{item.location}</p>
                        <div className="mt-3 text-sm font-black text-emerald-600 sm:text-2xl">{item.price}</div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Floating Chat Button */}
      <button
        type="button"
        onClick={() => {
          setSelectedProperty(property);
          setLeadForm({ fullName: "", phone: "", budget: "", area: "", message: "" });
          setShowLeadForm(true);
        }}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-2xl"
        aria-label="Contact seller"
      >
        <span className="text-2xl">💬</span>
      </button>

      {/* CRITICAL FIXED MODAL FOR MOBILE OVERFLOW & VIEWPORT BUTTON */}
      {showLeadForm && selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-2 backdrop-blur-sm">
          <div className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-3xl bg-white shadow-2xl overflow-hidden">
            
            {/* Modal Header (Fixed) */}
            <div className="flex items-start justify-between gap-4 p-6 border-b bg-gray-50">
              <div>
                <h2 className="text-xl font-bold sm:text-2xl">Contact Seller</h2>
                <p className="mt-1 text-xs text-gray-500 sm:text-sm">Fill this form and continue on WhatsApp.</p>
              </div>
              <button type="button" onClick={() => { setShowLeadForm(false); setSelectedProperty(null); }} className="rounded-full border w-8 h-8 flex items-center justify-center text-sm bg-white hover:bg-gray-100">✕</button>
            </div>

            {/* Modal Scrollable Content Section */}
            <form onSubmit={handleLeadSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Full Name *</label>
                <input type="text" required value={leadForm.fullName} onChange={(e) => setLeadForm((prev) => ({ ...prev, fullName: e.target.value }))} className="w-full rounded-xl border px-4 py-2.5 outline-none bg-gray-50 focus:bg-white transition" placeholder="Enter your name" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Mobile Number *</label>
                <input type="tel" required value={leadForm.phone} onChange={(e) => setLeadForm((prev) => ({ ...prev, phone: e.target.value }))} className="w-full rounded-xl border px-4 py-2.5 outline-none bg-gray-50 focus:bg-white transition" placeholder="Enter your mobile number" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Budget *</label>
                <input type="text" required value={leadForm.budget} onChange={(e) => setLeadForm((prev) => ({ ...prev, budget: e.target.value }))} className="w-full rounded-xl border px-4 py-2.5 outline-none bg-gray-50 focus:bg-white transition" placeholder="Example: 35 Lakh" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Preferred Area *</label>
                <input type="text" required value={leadForm.area} onChange={(e) => setLeadForm((prev) => ({ ...prev, area: e.target.value }))} className="w-full rounded-xl border px-4 py-2.5 outline-none bg-gray-50 focus:bg-white transition" placeholder="Example: Agartala" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Message</label>
                <textarea value={leadForm.message} onChange={(e) => setLeadForm((prev) => ({ ...prev, message: e.target.value }))} rows={3} className="w-full rounded-xl border px-4 py-2.5 outline-none bg-gray-50 focus:bg-white transition" placeholder="Any extra requirement..." />
              </div>

              {/* Action Buttons inside scroll viewport boundary */}
              <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-white">
                <button type="button" onClick={() => { setShowLeadForm(false); setSelectedProperty(null); }} className="flex-1 rounded-xl bg-slate-100 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-200 text-sm transition">Cancel</button>
                <button type="submit" className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-3 font-semibold text-white shadow-md text-sm transition hover:opacity-90">Send on WhatsApp</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {previewImage && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90" onClick={() => setPreviewImage("")}>
          <button type="button" onClick={() => setPreviewImage("")} className="absolute right-5 top-5 rounded-full bg-white px-4 py-2 text-xl font-bold text-black">✕</button>
          <img src={previewImage} alt="Preview" className="max-h-[95vh] max-w-[95vw] rounded-xl object-contain" />
        </div>
      )}
    </main>
  );
}