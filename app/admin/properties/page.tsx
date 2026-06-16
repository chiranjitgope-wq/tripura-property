"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// Indian Currency Formatter for Dashboard Display
function formatIndianCurrency(num: number | string) {
  const price = Number(num);
  if (isNaN(price)) return "N/A";
  return `₹${price.toLocaleString("en-IN")}`;
}

export default function PropertiesInventoryAdmin() {
  const [properties, setProperties] = useState<any[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [uploading, setUploading] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any | null>(null);

  // Stats Counters
  const [stats, setStats] = useState({
    total: 0,
    premium: 0,
    free: 0
  });

  useEffect(() => {
    fetchPropertiesInventory();
  }, []);

  useEffect(() => {
    const runningFilter = properties.filter((item) => {
      const titleText = (item.title || "").toLowerCase();
      const locateText = (item.location || "").toLowerCase();
      const catText = (item.category || item.type || "").toLowerCase();
      const normalizedQuery = searchQuery.toLowerCase();
      
      const matchSearch = titleText.includes(normalizedQuery) || locateText.includes(normalizedQuery);
      
      if (categoryFilter !== "all") {
        return matchSearch && catText === categoryFilter.toLowerCase();
      }
      return matchSearch;
    });
    setFilteredProperties(runningFilter);
  }, [searchQuery, categoryFilter, properties]);

  async function fetchPropertiesInventory() {
    setLoading(true);
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .order("id", { ascending: false });

    if (!error && data) {
      setProperties(data);
      setFilteredProperties(data);
      setStats({
        total: data.length,
        premium: data.filter((p) => p.premium).length,
        free: data.filter((p) => !p.premium).length
      });
    }
    setLoading(false);
  }

  // Master Compatible Image Parser (Handles JSON string, Array, or plain text string uniformly)
  function parsePropertyImages(propertyRow: any): string[] {
    if (!propertyRow) return [];
    const val = propertyRow.images || propertyRow.image_url;
    if (!val) return [];
    
    if (Array.isArray(val)) {
      return val.map(v => String(v).trim());
    }
    if (typeof val === "string") {
      if (val.startsWith("[")) {
        try {
          const parsed = JSON.parse(val);
          return Array.isArray(parsed) ? parsed : [val];
        } catch (e) {
          return [val];
        }
      }
      return [val];
    }
    return [];
  }

  // Helper to determine which image column name is used by the database row
  Object.defineProperty(parsePropertyImages, "name", { value: "parsePropertyImages" });
  function getImageColumnName(propertyRow: any): string {
    if (propertyRow && "images" in propertyRow) return "images";
    if (propertyRow && "image_url" in propertyRow) return "image_url";
    return "images"; // Default fallback
  }

  // Safe Upload Engine for Edit Modal (Keeps format identical to existing system)
  async function executeStorageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0 || !editingProperty) return;

    setUploading(true);
    try {
      const selectedFile = e.target.files[0];
      const extension = selectedFile.name.split(".").pop();
      const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${extension}`;
      const destinationPath = `uploads/${uniqueName}`;

      const { error: storageError } = await supabase.storage
        .from("properties")
        .upload(destinationPath, selectedFile, {
          cacheControl: "3600",
          upsert: true,
          contentType: selectedFile.type
        });

      if (storageError) throw new Error(storageError.message);

      const { data: publicUrlData } = supabase.storage.from("properties").getPublicUrl(destinationPath);
      if (publicUrlData?.publicUrl) {
        const currentUrls = parsePropertyImages(editingProperty);
        const targetColumn = getImageColumnName(editingProperty);
        
        // Match the data structure (Stringified JSON vs Native Array) based on current row type
        const rawValue = typeof editingProperty[targetColumn] === "string" 
          ? JSON.stringify([...currentUrls, publicUrlData.publicUrl])
          : [...currentUrls, publicUrlData.publicUrl];

        setEditingProperty({
          ...editingProperty,
          [targetColumn]: rawValue
        });
      }
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  }

  // Save changes back to the exact same master columns
  async function handleUpdatePropertySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingProperty) return;

    // Build update object dynamically using only the columns received from the database
    const updatePayload: any = {};
    Object.keys(editingProperty).forEach((key) => {
      if (key !== "created_at" && key !== "updated_at") {
        updatePayload[key] = editingProperty[key];
      }
    });

    const { error } = await supabase
      .from("properties")
      .update(updatePayload)
      .eq("id", editingProperty.id);

    if (error) {
      alert("Database sync failed: " + error.message);
    } else {
      alert("Property updated successfully!");
      setEditingProperty(null);
      fetchPropertiesInventory();
    }
  }

  async function executeDeleteRow(id: string | number) {
    if (!confirm("Are you sure you want to permanently delete this listing?")) return;
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (!error) fetchPropertiesInventory();
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white min-h-screen text-black">
      
      {/* Overview Statistics Grid */}
      <div className="grid gap-4 grid-cols-3 mb-8">
        <div className="rounded-xl border bg-gray-50 p-4 shadow-sm">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Listings</p>
          <h2 className="mt-1 text-2xl font-black text-gray-900">{stats.total}</h2>
        </div>
        <div className="rounded-xl border bg-amber-50 border-amber-200 p-4 shadow-sm">
          <p className="text-xs text-amber-700 font-bold uppercase tracking-wider">👑 Premium Ads</p>
          <h2 className="mt-1 text-2xl font-black text-amber-800">{stats.premium}</h2>
        </div>
        <div className="rounded-xl border bg-gray-50 p-4 shadow-sm">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Standard Ads</p>
          <h2 className="mt-1 text-2xl font-black text-gray-700">{stats.free}</h2>
        </div>
      </div>

      {/* Filter Options Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b pb-5">
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight uppercase">Properties Inventory</h1>
          <p className="text-xs text-gray-500">Manage listings created by the Master Sidebar Add Property system.</p>
        </div>
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg text-xs bg-white font-bold text-black focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="House Sale">House Sale</option>
            <option value="Flat Sale">Flat Sale</option>
            <option value="Plot Sale">Plot Sale</option>
            <option value="Rent">Rent</option>
          </select>
          <input
            type="text"
            placeholder="Search title or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 w-full sm:w-64 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Main Inventory Presentation Grid */}
      {loading ? (
        <div className="text-center py-12 text-xs text-gray-400 animate-pulse">Loading database index parameters...</div>
      ) : (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Property Display Details</th>
                  <th className="p-4">Geographic Location</th>
                  <th className="p-4">Price Matrix</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProperties.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-400">No matching database indices discovered.</td>
                  </tr>
                ) : (
                  filteredProperties.map((property) => {
                    const parsedMediaUrls = parsePropertyImages(property);
                    const thumbnailImage = parsedMediaUrls[0] || "";
                    const displayCategory = property.category || property.type || "Unassigned";

                    return (
                      <tr key={property.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {thumbnailImage ? (
                              <img 
                                src={thumbnailImage} 
                                alt="" 
                                className="w-12 h-12 rounded-lg object-cover bg-gray-100 border shadow-sm"
                                onError={(e) => { e.currentTarget.style.display = "none"; }}
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gray-50 border flex items-center justify-center text-[9px] text-gray-400 font-bold uppercase">No Image</div>
                            )}
                            <div>
                              <div className="font-bold text-gray-900 flex items-center gap-1.5">
                                {property.title || "Untitled Master Record"}
                                {property.premium && (
                                  <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-1 rounded uppercase">Premium</span>
                                )}
                              </div>
                              <div className="text-xs font-bold text-blue-600 mt-0.5">{displayCategory}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-gray-600 font-medium">{property.location || "Not Configured"}</td>
                        <td className="p-4 font-black text-gray-900">
                          {formatIndianCurrency(property.price)}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setEditingProperty({ ...property })}
                              className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded font-bold text-xs transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => executeDeleteRow(property.id)}
                              className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded font-bold text-xs transition"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- REUSABLE EDIT OVERLAY MODAL --- */}
      {editingProperty && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-xl w-full border max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xs font-black text-gray-900 uppercase tracking-wider">Modify Existing Object Properties</h2>
              <button type="button" onClick={() => setEditingProperty(null)} className="text-gray-400 hover:text-black font-bold text-sm">✕</button>
            </div>

            <form onSubmit={handleUpdatePropertySubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Property Title</label>
                <input
                  type="text"
                  value={editingProperty.title || ""}
                  onChange={(e) => setEditingProperty({ ...editingProperty, title: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg bg-white font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Category</label>
                  {/* Supports either 'category' or 'type' target mapping seamlessly */}
                  <select
                    value={editingProperty.category !== undefined ? (editingProperty.category || "") : (editingProperty.type || "")}
                    onChange={(e) => {
                      const targetField = editingProperty.category !== undefined ? "category" : "type";
                      setEditingProperty({ ...editingProperty, [targetField]: e.target.value });
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg bg-white font-bold"
                  >
                    <option value="House Sale">House Sale</option>
                    <option value="Flat Sale">Flat Sale</option>
                    <option value="Plot Sale">Plot Sale</option>
                    <option value="Rent">Rent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Price (INR)</label>
                  <input
                    type="number"
                    value={editingProperty.price || ""}
                    onChange={(e) => setEditingProperty({ ...editingProperty, price: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg bg-white font-bold text-green-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Geographic Location</label>
                <input
                  type="text"
                  value={editingProperty.location || ""}
                  onChange={(e) => setEditingProperty({ ...editingProperty, location: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                />
              </div>

              {/* Connected Storage Image Loop Engine */}
              <div className="border p-4 rounded-xl space-y-2 bg-gray-50">
                <label className="block text-xs font-black text-gray-700 uppercase">Attached Media Management</label>
                <div className="grid grid-cols-4 gap-2 bg-white p-2 rounded-lg border">
                  {parsePropertyImages(editingProperty).map((url, idx) => (
                    <div key={idx} className="relative h-14 border rounded overflow-hidden group">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          const remainingUrls = parsePropertyImages(editingProperty).filter((_, i) => i !== idx);
                          const targetColumn = getImageColumnName(editingProperty);
                          const updatedValue = typeof editingProperty[targetColumn] === "string" 
                            ? JSON.stringify(remainingUrls) 
                            : remainingUrls;
                          setEditingProperty({ ...editingProperty, [targetColumn]: updatedValue });
                        }}
                        className="absolute inset-0 bg-red-600/90 text-white font-bold text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <label className="h-14 border-2 border-dashed border-blue-300 bg-blue-50/50 hover:border-blue-500 rounded flex items-center justify-center cursor-pointer font-bold text-blue-600">
                    +
                    <input type="file" accept="image/*" onChange={executeStorageUpload} className="hidden" disabled={uploading} />
                  </label>
                </div>
                {uploading && <p className="text-[10px] text-blue-600 animate-pulse font-bold">Processing asset payload file...</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">YouTube Presentation Link</label>
                <input
                  type="text"
                  value={editingProperty.youtube_link || editingProperty.youtube_url || ""}
                  onChange={(e) => {
                    const targetField = "youtube_link" in editingProperty ? "youtube_link" : "youtube_url";
                    setEditingProperty({ ...editingProperty, [targetField]: e.target.value });
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Description</label>
                <textarea
                  value={editingProperty.description || ""}
                  onChange={(e) => setEditingProperty({ ...editingProperty, description: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                  rows={3}
                />
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                {["premium", "featured", "verified"].map((flag) => (
                  <label key={flag} className="flex items-center gap-1.5 select-none font-bold text-xs cursor-pointer capitalize">
                    <input
                      type="checkbox"
                      checked={!!editingProperty[flag]}
                      onChange={(e) => setEditingProperty({ ...editingProperty, [flag]: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-0"
                    />
                    {flag}
                  </label>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setEditingProperty(null)} className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-xs font-bold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-xs font-bold shadow-sm">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}