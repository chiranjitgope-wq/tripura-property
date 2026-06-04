"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";

type CategoryType = "house" | "flat" | "plot" | "rent";

type BannerSlide = {
  image: string;
  title: string;
  subtitle: string;
  link: string;
  category: CategoryType;
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

const STORAGE_KEY = "tripura-settings";
const BANNER_COUNT = 5;

const emptyBanner = (index: number): BannerSlide => ({
  image: "",
  title: `Banner Title ${index + 1}`,
  subtitle: `Banner subtitle ${index + 1}`,
  link: "/properties",
  category: "flat",
});

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
  sliderBanners: Array.from({ length: BANNER_COUNT }, (_, i) => emptyBanner(i)),
};

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.readAsDataURL(file);
  });
}

function normalizeLoadedSettings(parsed: any): AdminSettings {
  const oldSlides: string[] = Array.isArray(parsed?.sliderImages)
    ? parsed.sliderImages
    : [];

  const loadedBanners: BannerSlide[] = Array.from({ length: BANNER_COUNT }, (_, i) => {
    const oldBanner = parsed?.sliderBanners?.[i];

    return {
      image:
        oldBanner?.image ||
        oldSlides[i] ||
        defaultSettings.sliderBanners[i].image,
      title:
        oldBanner?.title ||
        parsed?.heroTitle ||
        defaultSettings.sliderBanners[i].title,
      subtitle:
        oldBanner?.subtitle ||
        parsed?.heroSubtitle ||
        defaultSettings.sliderBanners[i].subtitle,
      link: oldBanner?.link || defaultSettings.sliderBanners[i].link,
      category: oldBanner?.category || defaultSettings.sliderBanners[i].category,
    };
  });

  return {
    ...defaultSettings,
    ...parsed,
    sliderBanners: loadedBanners,
  };
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettings>(defaultSettings);
  const [savedMessage, setSavedMessage] = useState("");
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      setSettings(normalizeLoadedSettings(parsed));
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  }, []);

  const updateField = <K extends keyof AdminSettings>(key: K, value: AdminSettings[K]) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateBannerField = <K extends keyof BannerSlide>(
    index: number,
    key: K,
    value: BannerSlide[K]
  ) => {
    setSettings((prev) => {
      const next = [...prev.sliderBanners];
      next[index] = {
        ...next[index],
        [key]: value,
      };
      return {
        ...prev,
        sliderBanners: next,
      };
    });
  };

  const handleBannerUpload =
    (index: number) => async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        setSavedMessage("Only image files are allowed.");
        e.target.value = "";
        return;
      }

      const dataUrl = await readFileAsDataUrl(file);

      setSettings((prev) => {
        const next = [...prev.sliderBanners];
        next[index] = {
          ...next[index],
          image: dataUrl,
        };
        return {
          ...prev,
          sliderBanners: next,
        };
      });

      setSavedMessage("");
      e.target.value = "";
    };

  const removeBannerImage = (index: number) => {
    setSettings((prev) => {
      const next = [...prev.sliderBanners];
      next[index] = {
        ...next[index],
        image: "",
      };
      return {
        ...prev,
        sliderBanners: next,
      };
    });
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSavedMessage("Settings saved successfully.");
    setTimeout(() => setSavedMessage(""), 2500);
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    localStorage.removeItem(STORAGE_KEY);
    setSavedMessage("Settings reset.");
    setTimeout(() => setSavedMessage(""), 2500);
  };

  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl font-bold">Settings</h1>
      <p className="mt-2 text-gray-600">
        Manage website details, pricing, homepage banners, and slider ads.
      </p>

      <div className="mt-6 space-y-6 rounded-2xl border bg-white p-6 shadow-sm">
        <section>
          <h2 className="text-xl font-semibold">Basic Settings</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-medium">Website Name</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => updateField("siteName", e.target.value)}
                className="w-full rounded-xl border px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">WhatsApp Number</label>
              <input
                type="text"
                value={settings.whatsappNumber}
                onChange={(e) => updateField("whatsappNumber", e.target.value)}
                className="w-full rounded-xl border px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">Support Email</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => updateField("supportEmail", e.target.value)}
                className="w-full rounded-xl border px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">Office Address</label>
              <input
                type="text"
                value={settings.officeAddress}
                onChange={(e) => updateField("officeAddress", e.target.value)}
                className="w-full rounded-xl border px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">Facebook Link</label>
              <input
                type="text"
                value={settings.facebookLink}
                onChange={(e) => updateField("facebookLink", e.target.value)}
                className="w-full rounded-xl border px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">Instagram Link</label>
              <input
                type="text"
                value={settings.instagramLink}
                onChange={(e) => updateField("instagramLink", e.target.value)}
                className="w-full rounded-xl border px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">YouTube Link</label>
              <input
                type="text"
                value={settings.youtubeLink}
                onChange={(e) => updateField("youtubeLink", e.target.value)}
                className="w-full rounded-xl border px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">Admin Password</label>
              <input
                type="text"
                value={settings.adminPassword}
                onChange={(e) => updateField("adminPassword", e.target.value)}
                className="w-full rounded-xl border px-4 py-3 outline-none"
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Property Plan Settings</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-medium">Free Listing Price</label>
              <input
                type="text"
                value={settings.freeListingPrice}
                onChange={(e) => updateField("freeListingPrice", e.target.value)}
                className="w-full rounded-xl border px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">Premium Listing Price</label>
              <input
                type="text"
                value={settings.premiumListingPrice}
                onChange={(e) => updateField("premiumListingPrice", e.target.value)}
                className="w-full rounded-xl border px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">Max Free Photos</label>
              <input
                type="number"
                value={settings.maxFreePhotos}
                onChange={(e) =>
                  updateField("maxFreePhotos", Number(e.target.value) || 2)
                }
                className="w-full rounded-xl border px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">Max Premium Photos</label>
              <input
                type="number"
                value={settings.maxPremiumPhotos}
                onChange={(e) =>
                  updateField("maxPremiumPhotos", Number(e.target.value) || 5)
                }
                className="w-full rounded-xl border px-4 py-3 outline-none"
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Homepage Controls</h2>

          <div className="mt-4 flex flex-wrap gap-4">
            <label className="flex items-center gap-2 rounded-xl border px-4 py-3">
              <input
                type="checkbox"
                checked={settings.enableFeaturedSection}
                onChange={(e) =>
                  updateField("enableFeaturedSection", e.target.checked)
                }
              />
              Show Featured Section
            </label>

            <label className="flex items-center gap-2 rounded-xl border px-4 py-3">
              <input
                type="checkbox"
                checked={settings.enableCategorySection}
                onChange={(e) =>
                  updateField("enableCategorySection", e.target.checked)
                }
              />
              Show Category Section
            </label>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Homepage Slider Ads</h2>
          <p className="mt-2 text-sm text-gray-500">
            Each slide can have its own image, title, subtitle, category link, and button link.
          </p>

          <div className="mt-4 grid gap-4 xl:grid-cols-5">
            {settings.sliderBanners.map((banner, index) => (
              <div key={index} className="rounded-2xl border bg-gray-50 p-4">
                <input
                  ref={(el) => {
                    fileInputRefs.current[index] = el;
                  }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleBannerUpload(index)}
                />

                <div className="mb-3 flex items-center justify-between">
                  <p className="font-medium">Slide {index + 1}</p>
                  {banner.image ? (
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                      Added
                    </span>
                  ) : (
                    <span className="rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-600">
                      Empty
                    </span>
                  )}
                </div>

                {banner.image ? (
                  <img
                    src={banner.image}
                    alt={`Banner ${index + 1}`}
                    className="h-32 w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-32 items-center justify-center rounded-xl border border-dashed bg-white text-sm text-gray-400">
                    No image
                  </div>
                )}

                <div className="mt-3 space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      Title
                    </label>
                    <input
                      type="text"
                      value={banner.title}
                      onChange={(e) =>
                        updateBannerField(index, "title", e.target.value)
                      }
                      className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={banner.subtitle}
                      onChange={(e) =>
                        updateBannerField(index, "subtitle", e.target.value)
                      }
                      className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      Category
                    </label>
                    <select
                      value={banner.category}
                      onChange={(e) =>
                        updateBannerField(
                          index,
                          "category",
                          e.target.value as CategoryType
                        )
                      }
                      className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    >
                      <option value="house">House</option>
                      <option value="flat">Flat</option>
                      <option value="plot">Plot</option>
                      <option value="rent">Rent</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      Button Link
                    </label>
                    <input
                      type="text"
                      value={banner.link}
                      onChange={(e) =>
                        updateBannerField(index, "link", e.target.value)
                      }
                      className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                      placeholder="/properties?type=flat"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRefs.current[index]?.click()}
                      className="flex-1 rounded-xl border px-3 py-2 text-sm"
                    >
                      {banner.image ? "Change" : "Upload"}
                    </button>

                    <button
                      type="button"
                      onClick={() => removeBannerImage(index)}
                      className="flex-1 rounded-xl border border-red-300 px-3 py-2 text-sm text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {savedMessage && (
          <div className="rounded-xl bg-gray-100 px-4 py-3 text-sm text-gray-700">
            {savedMessage}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-black px-6 py-3 text-white"
          >
            Save Settings
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="rounded-xl border border-red-300 px-6 py-3 text-red-600"
          >
            Reset Settings
          </button>
        </div>
      </div>
    </div>
  );
}