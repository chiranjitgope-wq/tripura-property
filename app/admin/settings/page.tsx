"use client";

import { useEffect, useState, type FormEvent } from "react";
import { loadSiteSettings, saveSiteSettings } from "@/lib/site-settings";

export default function AdminSettingsPage() {
  const [siteName, setSiteName] = useState("Tripura Property");
  const [whatsappNumber, setWhatsappNumber] = useState("919999999999");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const settings = await loadSiteSettings();
        setSiteName(settings.siteName);
        setWhatsappNumber(settings.whatsappNumber);
      } catch (error) {
        console.error("Failed to load site settings:", error);
        setMessage("Failed to load settings.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      await saveSiteSettings({
        siteName: siteName.trim() || "Tripura Property",
        whatsappNumber: whatsappNumber.replace(/[^\d]/g, ""),
      });

      setMessage("Settings saved successfully.");
    } catch (error) {
      console.error("Failed to save settings:", error);
      setMessage("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-3xl font-bold">Site Settings</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-2 block font-medium">Site Name</label>
          <input
            type="text"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="w-full rounded-xl border px-4 py-3 outline-none"
            placeholder="Tripura Property"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">WhatsApp Number</label>
          <input
            type="tel"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            className="w-full rounded-xl border px-4 py-3 outline-none"
            placeholder="919999999999"
          />
        </div>

        {message && (
          <div className="rounded-xl bg-gray-100 px-4 py-3 text-sm">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-black px-6 py-3 font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}