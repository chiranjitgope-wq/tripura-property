"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { supabase } from "@/lib/supabase";

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
  whatsappNumber: "",
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
  const [uploadingIndexes, setUploadingIndexes] = useState<{ [key: number]: boolean }>({});
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // LIVE DATABASE FETCHING ON LOAD
  useEffect(() => {
    async function loadLiveSettings() {
      try {
        // First try to load from Supabase directly
        const { data, error } = await supabase
          .from("settings")
          .select("data")
          .eq("id", 1)
          .single();

        if (data?.data) {
          setSettings(normalizeLoadedSettings(data.data));
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.data));
          return;
        }

        // Fallback to localStorage if database row is missing or empty
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setSettings(normalizeLoadedSettings(parsed));
        }
      } catch (error) {
        console.error("Failed to load live settings:", error);
      }
    }
    loadLiveSettings();
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

      try {
        setUploadingIndexes((prev) => ({ ...prev, [index]: true }));
        setSavedMessage(`Uploading Slide ${index + 1}...`);

        const fileExt = file.name.split(".").pop();
        const fileName = `banners/slide_${index}_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("properties")
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("properties")
          .getPublicUrl(fileName);

        updateBannerField(index, "image", publicUrl);
        setSavedMessage(`Slide ${index + 1} Image updated successfully! Please click Save Settings to publish.`);
      } catch (error: any) {
        console.error("Upload error:", error);
        setSavedMessage(`Upload failed: ${error.message || error}`);
      } finally {
        setUploadingIndexes((prev) => ({ ...prev, [index]: false }));
        e.target.value = "";
        setTimeout(() => setSavedMessage(""), 4000);
      }
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

  // SAFE ATOMIC MERGE SAVE METHOD
  const handleSave = async () => {
    try {
      setSavedMessage("Saving settings safely...");
      
      // 1. Fetch deep fresh state straight from DB to ensure no banner gets overwritten
      const { data: currentDB } = await supabase
        .from("settings")
        .select("data")
        .eq("id", 1)
        .single();

      const existingDBData = currentDB?.data || {};

      // 2. Merge user edits accurately with what already exists on backend bucket
      const mergedData = {
        ...existingDBData,
        ...settings,
        sliderBanners: settings.sliderBanners.map((banner, idx) => {
          // If state is empty strings, check if DB holds reference to avoid wipe
          const dbBanner = existingDBData?.sliderBanners?.[idx];
          return {
            ...banner,
            image: banner.image || dbBanner?.image || "",
          };
        }),
      };

      // 3. Save clean snapshot back into local space and Supabase
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedData));

      const { error } = await supabase
        .from("settings")
        .upsert({
          id: 1,
          data: mergedData,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      // sync state back to UI view safety boundary
      setSettings(mergedData);
      setSavedMessage("Settings saved successfully! Everything is safe in Database. 🎉");
    } catch (error) {
      console.error(error);
      setSavedMessage("Failed to safely sync updates with backend.");
    }

    setTimeout(() => setSavedMessage(""), 3000);
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to revert input state back to default?")) {
      setSettings(defaultSettings);
      localStorage.removeItem(STORAGE_KEY);
      setSavedMessage("Form configuration locally reset.");
      setTimeout(() => setSavedMessage(""), 2500);
    }
  };

  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl font-bold">Settings</h1>
      <p className="mt-2 text-gray-600">
        Manage website details, pricing, homepage banners, and slider ads.
      </p>

      <div className="mt-6 space-y-6 rounded-2xl border bg-white p-6 shadow-sm">
        {/* Basic Settings */}
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

        {/* Property Plan Settings */}
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

        {/* Homepage Controls */}
        <section>
          <h2 className="text-xl font-semibold">Homepage Controls</h2>

          <div className="mt-4 flex flex-wrap gap-4">
            <label className="flex items-center gap-2 rounded-xl border px-4 py-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableFeaturedSection}
                onChange={(e) =>
                  updateField("enableFeaturedSection", e.target.checked)
                }
              />
              Show Featured Section
            </label>

            <label className="flex items-center gap-2 rounded-xl border px-4 py-3 cursor-pointer">
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

        {/* Homepage Slider Ads */}
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
                  disabled={uploadingIndexes[index]}
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
                    className="h-32 w-full rounded-xl object-cover shadow-inner bg-white"
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
                      className="flex-1 rounded-xl border bg-white px-3 py-2 text-sm shadow-sm font-medium disabled:opacity-50"
                      disabled={uploadingIndexes[index]}
                    >
                      {uploadingIndexes[index] ? "Uploading..." : banner.image ? "Change" : "Upload"}
                    </button>

                    <button
                      type="button"
                      onClick={() => removeBannerImage(index)}
                      className="flex-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition"
                      disabled={uploadingIndexes[index]}
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
          <div className="rounded-xl bg-slate-900 px-4 py-3 text-sm text-white font-medium shadow-md">
            {savedMessage}
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-6 py-3 font-semibold text-white shadow-md transition"
          >
            Save Settings
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="rounded-xl border border-red-300 bg-white px-6 py-3 font-semibold text-red-600 hover:bg-red-50 transition"
          >
            Reset Form
          </button>
        </div>
      </div>
    </div>
  );
}