"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Plan = "Free" | "Premium";
type Category = "house" | "flat" | "plot" | "rent";

type PhotoSlot = {
  file: File | null;
  previewUrl: string | null;
};

const emptySlot = (): PhotoSlot => ({
  file: null,
  previewUrl: null,
});

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.readAsDataURL(file);
  });

export default function AddPropertyPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState<Category>("house");
  const [plan, setPlan] = useState<Plan>("Free");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [description, setDescription] = useState("");
  const [area, setArea] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [verified, setVerified] = useState(false);
  const [urgentSale, setUrgentSale] = useState(false);

  const [photoSlots, setPhotoSlots] = useState<PhotoSlot[]>([
    emptySlot(),
    emptySlot(),
    emptySlot(),
    emptySlot(),
    emptySlot(),
  ]);

  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const maxPhotos = plan === "Free" ? 2 : 5;
  const visibleSlots = photoSlots.slice(0, maxPhotos);

  useEffect(() => {
    return () => {
      photoSlots.forEach((slot) => {
        if (slot.previewUrl) URL.revokeObjectURL(slot.previewUrl);
      });
    };
  }, [photoSlots]);

  const setSlotFile = (index: number, file: File | null) => {
    setPhotoSlots((prev) => {
      const next = [...prev];

      if (next[index]?.previewUrl) {
        URL.revokeObjectURL(next[index].previewUrl!);
      }

      next[index] = file
        ? {
            file,
            previewUrl: URL.createObjectURL(file),
          }
        : emptySlot();

      return next;
    });
  };

  const handlePhotoChange =
    (index: number) => (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        setMessage("Only image files allowed.");
        e.target.value = "";
        return;
      }

      setMessage("");
      setSlotFile(index, file);
      e.target.value = "";
    };

  const handleSelectClick = (index: number) => {
    fileInputRefs.current[index]?.click();
  };

  const handleRemovePhoto = (index: number) => {
    setSlotFile(index, null);
    setMessage("");
  };

  const handlePlanChange = (nextPlan: Plan) => {
    setPlan(nextPlan);
    setMessage("");

    if (nextPlan === "Free") {
      setYoutubeLink("");

      setPhotoSlots((prev) => {
        const next = [...prev];

        for (let i = 2; i < next.length; i++) {
          if (next[i]?.previewUrl) {
            URL.revokeObjectURL(next[i].previewUrl!);
          }
          next[i] = emptySlot();
        }

        return next;
      });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title.trim() || !price.trim() || !location.trim()) {
      setMessage("Fill all required fields.");
      return;
    }

    const filledPhotos = visibleSlots.filter((slot) => slot.file !== null);

    if (filledPhotos.length === 0) {
      setMessage("Upload at least 1 photo.");
      return;
    }

    if (plan === "Premium" && !youtubeLink.trim()) {
      setMessage("Premium needs YouTube link.");
      return;
    }

    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    setSaving(true);
    setMessage("");

    try {
      const images = await Promise.all(
        filledPhotos.map((slot) => fileToDataUrl(slot.file!))
      );

      const { error } = await supabase.from("properties").insert({
        slug,
        type: category,
        featured: plan === "Premium",
        premium: plan === "Premium",
        verified,
        urgent_sale: urgentSale,
        title: title.trim(),
        location: location.trim(),
        price: price.trim(),
        price_value: Number(price.replace(/[^0-9]/g, "")) || 0,
        area: area.trim() || "Not Added",
        description: description.trim() || "Description not added yet.",
        image: images[0],
        images,
        whatsapp_message: `Hi, I want details about ${title.trim()} in ${location.trim()}.`,
        stats: [area.trim() || "New Listing"],
        youtube_url: plan === "Premium" ? youtubeLink.trim() : null,
      });

      if (error) throw error;

      setMessage("Property saved successfully.");

      setTitle("");
      setPrice("");
      setLocation("");
      setCategory("house");
      setPlan("Free");
      setYoutubeLink("");
      setDescription("");
      setArea("");
      setVerified(false);
      setUrgentSale(false);
      setPhotoSlots([
        emptySlot(),
        emptySlot(),
        emptySlot(),
        emptySlot(),
        emptySlot(),
      ]);

      router.push("/admin/properties");
    } catch (error) {
      console.error(error);
      setMessage("Failed to save property.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl">
      <h1 className="mb-6 text-3xl font-bold">Add New Property</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-2 block font-medium">Property Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="2 BHK Flat"
            className="w-full rounded-xl border px-4 py-3 outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">Price *</label>
          <input
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="₹35.00 Lakh"
            className="w-full rounded-xl border px-4 py-3 outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">Location *</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Agartala"
            className="w-full rounded-xl border px-4 py-3 outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">Area</label>
          <input
            type="text"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="1200 Sqft"
            className="w-full rounded-xl border px-4 py-3 outline-none"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-3 rounded-2xl border px-4 py-3">
            <input
              type="checkbox"
              checked={verified}
              onChange={(e) => setVerified(e.target.checked)}
              className="h-4 w-4"
            />
            <span className="font-medium">Verified Property</span>
          </label>

          <label className="flex items-center gap-3 rounded-2xl border px-4 py-3">
            <input
              type="checkbox"
              checked={urgentSale}
              onChange={(e) => setUrgentSale(e.target.checked)}
              className="h-4 w-4"
            />
            <span className="font-medium">Urgent Sale</span>
          </label>
        </div>

        <div>
          <label className="mb-2 block font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Write property details..."
            className="w-full rounded-xl border px-4 py-3 outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full rounded-xl border px-4 py-3 outline-none"
          >
            <option value="house">House</option>
            <option value="flat">Flat</option>
            <option value="plot">Plot</option>
            <option value="rent">Rent</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block font-medium">Listing Plan</label>
          <select
            value={plan}
            onChange={(e) => handlePlanChange(e.target.value as Plan)}
            className="w-full rounded-xl border px-4 py-3 outline-none"
          >
            <option>Free</option>
            <option>Premium</option>
          </select>

          <p className="mt-2 text-sm text-gray-500">
            Free = 2 Photos | Premium = 5 Photos + YouTube
          </p>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <label className="font-medium">Upload Photos</label>
            <span className="text-sm text-gray-500">{maxPhotos} Slots</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleSlots.map((slot, index) => (
              <div key={index} className="rounded-2xl border bg-gray-50 p-4">
                <input
                  ref={(el) => {
                    fileInputRefs.current[index] = el;
                  }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange(index)}
                />

                {slot.previewUrl ? (
                  <>
                    <img
                      src={slot.previewUrl}
                      alt=""
                      className="h-40 w-full rounded-xl object-cover"
                    />

                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectClick(index)}
                        className="flex-1 rounded-xl border px-3 py-2 text-sm"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(index)}
                        className="flex-1 rounded-xl border border-red-300 px-3 py-2 text-sm text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex h-40 items-center justify-center rounded-xl border border-dashed bg-white text-sm text-gray-400">
                      No Image
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectClick(index)}
                      className="mt-3 w-full rounded-xl bg-black px-3 py-2 text-white"
                    >
                      Choose File
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {plan === "Premium" && (
          <div>
            <label className="mb-2 block font-medium">YouTube Link *</label>
            <input
              type="text"
              value={youtubeLink}
              onChange={(e) => setYoutubeLink(e.target.value)}
              placeholder="https://youtube.com/..."
              className="w-full rounded-xl border px-4 py-3 outline-none"
            />
          </div>
        )}

        {message && (
          <div className="rounded-xl bg-gray-100 px-4 py-3 text-sm">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-black px-6 py-3 text-white disabled:opacity-60"
        >
          {saving ? "Saving..." : "Add Property"}
        </button>
      </form>
    </div>
  );
}