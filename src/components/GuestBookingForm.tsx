"use client";

import { useState } from "react";

interface GuestBookingFormProps {
  dealId: string;
  totalSlots: number;
  claimedSlots: number;
}

export default function GuestBookingForm({
  dealId,
  totalSlots,
  claimedSlots,
}: GuestBookingFormProps) {
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [localClaimed, setLocalClaimed] = useState(claimedSlots);

  const available = totalSlots - localClaimed;
  const isSoldOut = available <= 0;
  const slotPercent = Math.min((localClaimed / totalSlots) * 100, 100);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealId, guestName, guestPhone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to book slot");
        return;
      }

      setSuccess(true);
      setLocalClaimed((prev) => prev + 1);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-emerald-800 mb-2">Slot Booked!</h3>
        <p className="text-emerald-700 text-sm">
          Your slot has been reserved. Show your name at the business and pay on arrival.
        </p>
        <p className="text-emerald-600 font-semibold mt-3 text-sm">
          Name: {guestName} · Phone: {guestPhone}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-xl font-bold text-gray-900 mb-1">Book a Slot</h3>
      <p className="text-sm text-gray-500 mb-5">
        Free to book — pay when you arrive. No account needed.
      </p>

      {/* Slot availability */}
      <div className="mb-5 p-4 bg-sky-50 rounded-xl">
        <div className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
          <span>{localClaimed} / {totalSlots} slots claimed</span>
          <span
            className={
              isSoldOut
                ? "text-red-600"
                : available <= 3
                ? "text-amber-600"
                : "text-emerald-600"
            }
          >
            {isSoldOut ? "Fully Booked" : `${available} left`}
          </span>
        </div>
        <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              slotPercent >= 80
                ? "bg-red-400"
                : slotPercent >= 50
                ? "bg-amber-400"
                : "bg-cyan-400"
            }`}
            style={{ width: `${slotPercent}%` }}
          />
        </div>
      </div>

      {isSoldOut ? (
        <div className="text-center py-4">
          <p className="text-gray-500 font-medium">
            All slots have been claimed. Check back later or explore other deals!
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Your Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="e.g. Maria Tromp"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              placeholder="e.g. +297 5XX XXXX"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 placeholder-gray-400"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-100">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-600 hover:to-sky-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Booking...
              </span>
            ) : (
              "Reserve My Slot — Free"
            )}
          </button>

          <p className="text-xs text-center text-gray-400">
            By booking, you agree to show up and pay the business directly.
          </p>
        </form>
      )}
    </div>
  );
}
