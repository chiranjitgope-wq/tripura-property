"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { properties as staticProperties, type Property, type PropertyType } from "@/lib/properties";

type ViewMode = "all" | "saved";
type CategoryType = "house" | "flat" | "plot" | "rent";

type BannerSlide = {
  title: string;
  subtitle: string;
  image: string;
  link: string;
  category: CategoryType;
};

type Category = {
  title: string;
  icon: ComponentType<{ className?: string }>;
  href: string;
};

type AdminSettings = {
  siteName: string;
  whatsappNumber: string;
  supportEmail: string;
  officeAddress: string;
  facebookLink: string;
  instagramLink: string;
  youtubeLink: string;
  freeListingPrice: string;
  premiumListingPrice: string;
  maxFreePhotos: number;
  maxPremiumPhotos: number;
  enableFeaturedSection: boolean;
  enableCategorySection: boolean;
  adminPassword: string;
  sliderBanners: BannerSlide[];
};

type FavoriteState = string[];

function HouseIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M3 11.5 12 4l9 7.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.5 10.5V20h13V10.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 20v-5a2.5 2.5 0 0 1 5 0v5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BuildingIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M6 20V6.5A1.5 1.5 0 0 1 7.5 5h5A1.5 1.5 0 0 1 14 6.5V20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 20V9.5A1.5 1.5 0 0 1 15.5 8h2A1.5 1.5 0 0 1 19 9.5V20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M4 20h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function PinIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 21s5-5.2 5-10a5 5 0 1 0-10 0c0 4.8 5 10 5 10Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function KeyIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M14.5 10.5a4.5 4.5 0 1 0-3.1 4.3l2.1 2.2H16v1.5h1.5V17H19v-1.5h1.5V14l-2.2-2.2a4.5 4.5 0 0 0-3.8-1.3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HeartIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShareIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M8 12l8-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M8 12l8 4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="6" cy="12" r="2.2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="18" cy="6" r="2.2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="18" cy="18" r="2.2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M20 11.9a8 8 0 0 1-11.7 7.1L4 20l1-4.2A8 8 0 1 1 20 11.9Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const defaultSettings: AdminSettings = {
  siteName: "Tripura Property",
  whatsappNumber: "919999999999",
  supportEmail: "support@tripuraproperty.com",
  officeAddress: "Agartala, Tripura",
  facebookLink: "",
  instagramLink: "",
  youtubeLink: "",
  freeListingPrice: "0",
  premiumListingPrice: "499",
  maxFreePhotos: 2,
  maxPremiumPhotos: 5,
  enableFeaturedSection: true,
  enableCategorySection: true,
  adminPassword: "tripura123",
  sliderBanners: [
    {
      title: "Tripura’s First Property Marketplace",
      subtitle: "Buy • Sell • Rent Properties Across Tripura",
      image:
        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2070&auto=format&fit=crop",
      link: "/properties?type=flat",
      category: "flat",
    },
    {
      title: "Find Trusted House Listings",
      subtitle: "Verified homes, plots and rental properties",
      image:
        "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=2070&auto=format&fit=crop",
      link: "/properties?type=house",
      category: "house",
    },
    {
      title: "Explore Premium Plots",
      subtitle: "Road-facing and investment-ready land offers",
      image:
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2070&auto=format&fit=crop",
      link: "/properties?type=plot",
      category: "plot",
    },
    {
      title: "Best Rental Homes",
      subtitle: "Affordable family homes and city rentals",
      image:
        "https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=2070&auto=format&fit=crop",
      link: "/properties?type=rent",
      category: "rent",
    },
    {
      title: "Premium Property Deals",
      subtitle: "Featured listings with more photos and video",
      image:
        "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=2070&auto=format&fit=crop",
      link: "/properties",
      category: "flat",
    },
  ],
};

const SETTINGS_KEY = "tripura-settings";
const PROPERTIES_KEY = "tripura-properties";
const FAVORITES_KEY = "tripura-favorites";
const waFallback = "919862787368";

function normalizeSettings(parsed: any): AdminSettings {
  const fallback = defaultSettings.sliderBanners;

  const loadedBanners: BannerSlide[] = Array.from({ length: 5 }, (_, i) => {
    const oldBanner = parsed?.sliderBanners?.[i];

    return {
      image: oldBanner?.image || fallback[i].image,
      title: oldBanner?.title || fallback[i].title,
      subtitle: oldBanner?.subtitle || fallback[i].subtitle,
      link: oldBanner?.link || fallback[i].link,
      category: (oldBanner?.category || fallback[i].category) as CategoryType,
    };
  });

  return {
    ...defaultSettings,
    ...parsed,
    sliderBanners: loadedBanners,
  };
}

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

function dedupeProperties(items: Property[]) {
  const map = new Map<string, Property>();
  for (const item of items) {
    if (!map.has(item.slug)) map.set(item.slug, item);
  }
  return Array.from(map.values());
}

export default function Home() {
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const featuredRef = useRef<HTMLDivElement | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [settings, setSettings] = useState<AdminSettings>(defaultSettings);
  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const loadAll = () => {
      try {
        const rawSettings = localStorage.getItem(SETTINGS_KEY);
        if (rawSettings) {
          setSettings(normalizeSettings(JSON.parse(rawSettings)));
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      }

      try {
        const rawProperties = localStorage.getItem(PROPERTIES_KEY);
        if (rawProperties) {
          const parsed = JSON.parse(rawProperties);
          if (Array.isArray(parsed)) {
            setSavedProperties(parsed.filter(isValidProperty));
          }
        }
      } catch (error) {
        console.error("Failed to load properties:", error);
      }

      try {
        const rawFavorites = localStorage.getItem(FAVORITES_KEY);
        if (rawFavorites) {
          const parsed = JSON.parse(rawFavorites);
          if (Array.isArray(parsed)) {
            setFavoriteIds(parsed.filter((id) => typeof id === "string"));
          }
        }
      } catch (error) {
        console.error("Failed to load favorites:", error);
      }
    };

    loadAll();

    const onStorage = (event: StorageEvent) => {
      if (
        event.key === SETTINGS_KEY ||
        event.key === PROPERTIES_KEY ||
        event.key === FAVORITES_KEY ||
        event.key === null
      ) {
        loadAll();
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const bannerSlides = useMemo(() => {
    const slides = settings.sliderBanners?.length
      ? settings.sliderBanners
      : defaultSettings.sliderBanners;

    return slides.map((slide, index) => ({
      ...slide,
      image: slide.image || defaultSettings.sliderBanners[index]?.image || "",
    }));
  }, [settings.sliderBanners]);

  useEffect(() => {
    if (currentSlide >= bannerSlides.length) {
      setCurrentSlide(0);
    }
  }, [bannerSlides.length, currentSlide]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 3500);

    return () => window.clearInterval(interval);
  }, [bannerSlides.length]);

  const allProperties = useMemo(() => {
    return dedupeProperties([...savedProperties, ...staticProperties]);
  }, [savedProperties]);

  const featuredProperties = allProperties.filter((p) => p.featured).slice(0, 6);
  const favoriteProperties = allProperties.filter((p) => favoriteIds.includes(p.id));
  const listToShow = viewMode === "saved" ? favoriteProperties : featuredProperties;

  const categories: Category[] = [
    {
      title: "House Sale",
      icon: HouseIcon,
      href: "/properties?type=house",
    },
    {
      title: "Flat Sale",
      icon: BuildingIcon,
      href: "/properties?type=flat",
    },
    {
      title: "Plot Sale",
      icon: PinIcon,
      href: "/properties?type=plot",
    },
    {
      title: "Rent",
      icon: KeyIcon,
      href: "/properties?type=rent",
    },
  ];

  const waNumber = (settings.whatsappNumber || waFallback).replace(/[^\d]/g, "");

  function toggleSaved(id: string) {
    setFavoriteIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];

      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  }

  function openWhatsApp(message: string) {
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`, "_blank");
  }

  async function shareProperty(property: Property) {
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
        // ignore and fall back
      }
    }

    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
    } catch {
      // ignore
    }
  }

  const activeSlide = bannerSlides[currentSlide];

  return (
    <main className="min-h-screen bg-[#f6f7fb] pb-28 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt={settings.siteName}
              width={40}
              height={40}
              className="rounded-full"
            />

            <div>
              <h1 className="text-xl font-black">
                <span>{settings.siteName.split(" ")[0] || "Tripura"}</span>
                <span className="text-emerald-600">
                  {settings.siteName.split(" ").slice(1).join(" ") || "Property"}
                </span>
              </h1>

              <p className="text-xs text-slate-500">
                Premium Property Listings
              </p>
            </div>
          </Link>

          <Link
            href="/properties"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold"
          >
            Properties
          </Link>
        </div>
      </header>

      <section className="px-4 pt-4">
        <div
          ref={sliderRef}
          className="mx-auto flex max-w-6xl snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth"
        >
          {bannerSlides.map((slide, index) => (
            <article
              key={`${slide.title}-${index}`}
              className="relative min-w-full snap-start overflow-hidden rounded-[28px]"
            >
              <div
                className="h-[220px] bg-cover bg-center sm:h-[360px]"
                style={{
                  backgroundImage: `url('${slide.image}')`,
                }}
              >
                <div className="flex h-full items-end bg-gradient-to-b from-black/20 to-black/60 p-6">
                  <div className="max-w-2xl text-white">
                    <h2 className="text-3xl font-black sm:text-5xl">
                      {slide.title}
                    </h2>

                    <p className="mt-2 text-sm text-white/90 sm:text-lg">
                      {slide.subtitle}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <Link
                        href={slide.link}
                        className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black"
                      >
                        Explore Now
                      </Link>

                      <Link
                        href="/properties"
                        className="rounded-full border border-white/30 px-5 py-2 text-sm font-semibold text-white"
                      >
                        Browse All
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-3 flex max-w-6xl justify-center gap-2">
          {bannerSlides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide ? "w-8 bg-emerald-600" : "w-2 bg-slate-300"
              }`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      </section>

      <section className="-mt-6 px-4">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-2 rounded-[24px] border border-slate-200 bg-white p-3 shadow-xl lg:grid-cols-4">
          <input
            type="text"
            placeholder="Search property..."
            className="h-12 rounded-2xl border border-slate-200 px-3 text-sm outline-none"
          />

          <select className="h-12 rounded-2xl border border-slate-200 px-3 text-sm outline-none">
            <option>All Locations</option>
            <option>Agartala</option>
            <option>Dharmanagar</option>
          </select>

          <select className="h-12 rounded-2xl border border-slate-200 px-3 text-sm outline-none">
            <option>Any Budget</option>
            <option>Under 20 Lakh</option>
            <option>20-50 Lakh</option>
          </select>

          <Link
            href="/properties"
            className="flex h-12 items-center justify-center rounded-2xl bg-emerald-600 text-sm font-semibold text-white"
          >
            Search
          </Link>
        </div>
      </section>

      {settings.enableCategorySection && (
        <section className="px-4 py-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-2xl font-black">Category</h3>

              <Link
                href="/properties"
                className="text-sm font-semibold text-emerald-600"
              >
                View All
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {categories.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="rounded-3xl border border-slate-200 bg-white p-4 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <item.icon className="h-6 w-6" />
                  </div>

                  <div className="text-sm font-semibold">{item.title}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {settings.enableFeaturedSection && (
        <section ref={featuredRef} className="px-4">
          <div className="mx-auto max-w-6xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black">
                  {viewMode === "saved" ? "Saved Properties" : "Featured Properties"}
                </h3>

                <p className="text-sm text-slate-500">Premium Tripura listings</p>
              </div>

              <Link
                href="/properties"
                className="text-sm font-semibold text-emerald-600"
              >
                View All
              </Link>
            </div>

            {viewMode === "saved" && favoriteProperties.length === 0 ? (
              <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">No saved properties yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:gap-5">
                {listToShow.map((item) => {
                  const isSaved = favoriteIds.includes(item.id);
                  const badge = item.premium ? "Premium" : item.featured ? "Featured" : item.type.toUpperCase();

                  return (
                    <Link
                      key={item.id}
                      href={`/properties/${item.slug}`}
                      className="block"
                    >
                      <article className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                        <div className="relative">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="h-28 w-full object-cover sm:h-56"
                          />

                          <span className="absolute left-3 top-3 rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-semibold text-emerald-700">
                            {badge}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleSaved(item.id);
                            }}
                            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-emerald-600 shadow"
                          >
                            <HeartIcon
                              className={`h-5 w-5 ${isSaved ? "fill-emerald-600" : ""}`}
                            />
                          </button>
                        </div>

                        <div className="p-3 sm:p-5">
                          <h4 className="text-xs font-bold sm:text-lg">{item.title}</h4>

                          <p className="mt-1 text-[10px] text-slate-500 sm:text-sm">
                            {item.location}
                          </p>

                          <div className="mt-3 text-sm font-black text-emerald-600 sm:text-2xl">
                            {item.price}
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                openWhatsApp(`Hi, I want details for ${item.title}`);
                              }}
                              className="flex items-center justify-center rounded-2xl bg-emerald-600 py-2 text-white"
                            >
                              <WhatsAppIcon className="h-5 w-5" />
                            </button>

                            <button
                              type="button"
                              onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                await shareProperty(item);
                              }}
                              className="flex items-center justify-center rounded-2xl border border-slate-200 py-2 text-slate-700"
                            >
                              <ShareIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      <section className="px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold">About {settings.siteName}</h2>
            <p className="mt-3 max-w-3xl text-gray-600">
              Trusted property listings, category-wise browsing, and admin-managed
              banners for buying, selling, and renting properties in Tripura.
            </p>
          </div>
        </div>
      </section>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-5 px-2 py-2 text-center text-[10px] font-medium">
          <Link
            href="/"
            className="flex flex-col items-center gap-1 text-emerald-600"
          >
            <span className="text-xl">🏠</span>
            Home
          </Link>

          <Link
            href="/properties"
            className="flex flex-col items-center gap-1 text-slate-500"
          >
            <span className="text-xl">▦</span>
            Properties
          </Link>

          <button
            type="button"
            onClick={() =>
              openWhatsApp("Hi, I want to post my property on Tripura Property.")
            }
            className="flex flex-col items-center gap-1"
          >
            <span className="-mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg">
              <WhatsAppIcon className="h-6 w-6" />
            </span>

            <span className="mt-1 text-slate-700">Post</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setViewMode("saved");
              featuredRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }}
            className="flex flex-col items-center gap-1 text-slate-500"
          >
            <span className="text-xl">♡</span>
            Saved
          </button>

          <button
            type="button"
            onClick={() =>
              openWhatsApp("Hi, I want to contact Tripura Property.")
            }
            className="flex flex-col items-center gap-1 text-slate-500"
          >
            <span className="text-xl">☎</span>
            Contact
          </button>
        </div>
      </nav>
    </main>
  );
}