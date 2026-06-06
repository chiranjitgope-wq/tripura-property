import { supabase } from "@/lib/supabase";

export type SiteSettings = {
  siteName: string;
  whatsappNumber: string;
};

export const defaultSiteSettings: SiteSettings = {
  siteName: "Tripura Property",
  whatsappNumber: "",
};

export async function loadSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("site_name, whatsapp_number")
    .eq("id", 1)
    .single();

  if (error || !data) {
    return defaultSiteSettings;
  }

  return {
    siteName: data.site_name || defaultSiteSettings.siteName,
    whatsappNumber: data.whatsapp_number || defaultSiteSettings.whatsappNumber,
  };
}

export async function saveSiteSettings(settings: SiteSettings) {
  const { error } = await supabase.from("site_settings").upsert({
    id: 1,
    site_name: settings.siteName,
    whatsapp_number: settings.whatsappNumber,
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;
}