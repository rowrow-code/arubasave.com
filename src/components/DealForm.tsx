"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = ["Restaurants", "Spa", "Tours", "Sports"] as const;

interface DealFormProps {
  onSuccess?: () => void;
}

export default function DealForm({ onSuccess }: DealFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Restaurants",
    originalPrice: "",
    discountedPrice: "",
    expiryDate: "",
    totalSlots: "",
  });

  function update(field: string, val: string) {
    setForm((prev) => ({ ...prev, [field]: val }));
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setUploading(true);

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Image upload failed");
        return;
      }
      setImageUrl(data.imageUrl);
    } catch {
      setError("Failed to upload image");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const orig = Number(form.originalPrice);
    const disc = Number(form.discountedPrice);

    if (disc >= orig) {
      setError("Discounted price must be less than original price");
      return;
    }

    if (new Date(form.expiryDate) <= new Date()) {
      setError("Expiry date must be in the future");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          originalPrice: orig,
          discountedPrice: disc,
          totalSlots: Number(form.totalSlots),
          imageUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create deal");
        return;
      }

      // Reset form
      setForm({
        title: "",
        description: "",
        category: "Restaurants",
        originalPrice: "",
        discountedPrice: "",
        expiryDate: "",
        totalSlots: "",
      });
      setImageUrl(null);
      setImagePreview(null);

      if (onSuccess) onSuccess();
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Min date for expiry (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Photo upload */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Deal Photo <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-cyan-300 transition-colors">
          {imagePreview ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-40 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null);
                  setImageUrl(null);
                }}
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {uploading && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg">
                  <span className="text-sm text-gray-600 font-medium">Uploading...</span>
                </div>
              )}
            </div>
          ) : (
            <label className="flex flex-col items-center gap-2 cursor-pointer">
              <div className="w-12 h-12 bg-cyan-50 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-sm text-gray-500">Click to upload photo</span>
              <span className="text-xs text-gray-400">PNG, JPG, WebP up to 5MB</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
          )}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Deal Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="e.g. 50% Off Spa Day Package"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 placeholder-gray-400"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          rows={3}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Describe what's included in this deal..."
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 placeholder-gray-400 resize-none"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          value={form.category}
          onChange={(e) => update("category", e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 bg-white"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Prices */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Original Price (AWG) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={form.originalPrice}
            onChange={(e) => update("originalPrice", e.target.value)}
            placeholder="100.00"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 placeholder-gray-400"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Discounted Price (AWG) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={form.discountedPrice}
            onChange={(e) => update("discountedPrice", e.target.value)}
            placeholder="50.00"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Expiry + Slots */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Expiry Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            required
            min={minDate}
            value={form.expiryDate}
            onChange={(e) => update("expiryDate", e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Total Slots <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            required
            min="1"
            value={form.totalSlots}
            onChange={(e) => update("totalSlots", e.target.value)}
            placeholder="20"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 placeholder-gray-400"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-100">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || uploading}
        className="w-full bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-600 hover:to-sky-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all disabled:cursor-not-allowed"
      >
        {loading ? "Publishing Deal..." : "Publish Deal"}
      </button>
    </form>
  );
}
