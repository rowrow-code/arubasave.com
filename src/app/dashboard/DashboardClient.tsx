"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DealForm from "@/components/DealForm";
import {
  formatAWG,
  formatExpiryDate,
  computeDiscount,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
} from "@/lib/utils";

interface Deal {
  id: string;
  title: string;
  category: string;
  originalPrice: number;
  discountedPrice: number;
  expiryDate: string;
  totalSlots: number;
  imageUrl?: string | null;
  createdAt: string;
  _count: { bookings: number };
}

interface Props {
  businessName: string;
  deals: Deal[];
}

export default function DashboardClient({ businessName, deals: initialDeals }: Props) {
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const activeDeals = deals.filter((d) => new Date(d.expiryDate) > new Date());
  const expiredDeals = deals.filter((d) => new Date(d.expiryDate) <= new Date());
  const totalBookings = deals.reduce((sum, d) => sum + d._count.bookings, 0);

  async function handleDelete(id: string) {
    if (!confirm("Delete this deal? This action cannot be undone.")) return;
    setDeletingId(id);

    try {
      const res = await fetch(`/api/deals/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDeals((prev) => prev.filter((d) => d.id !== id));
      }
    } finally {
      setDeletingId(null);
    }
  }

  function handleFormSuccess() {
    setShowForm(false);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-sky-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-bold mb-1">
            Welcome, {businessName} 👋
          </h1>
          <p className="text-cyan-100">Manage your deals and track bookings</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 text-center">
              <div className="text-3xl font-bold">{activeDeals.length}</div>
              <div className="text-cyan-100 text-sm mt-1">Active Deals</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 text-center">
              <div className="text-3xl font-bold">{totalBookings}</div>
              <div className="text-cyan-100 text-sm mt-1">Total Bookings</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 text-center">
              <div className="text-3xl font-bold">{expiredDeals.length}</div>
              <div className="text-cyan-100 text-sm mt-1">Expired Deals</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Deals list */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-gray-900">Your Deals</h2>
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-600 hover:to-sky-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {showForm ? "Cancel" : "Post New Deal"}
              </button>
            </div>

            {/* Mobile: show form inline when toggled */}
            {showForm && (
              <div className="lg:hidden bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-5">Post a New Deal</h3>
                <DealForm onSuccess={handleFormSuccess} />
              </div>
            )}

            {deals.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <div className="text-5xl mb-4">🏷️</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No deals yet</h3>
                <p className="text-gray-500 text-sm">Post your first deal to start attracting customers.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Active deals */}
                {activeDeals.length > 0 && (
                  <>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Active</h3>
                    {activeDeals.map((deal) => (
                      <DealRow
                        key={deal.id}
                        deal={deal}
                        onDelete={handleDelete}
                        deleting={deletingId === deal.id}
                        expired={false}
                      />
                    ))}
                  </>
                )}

                {/* Expired deals */}
                {expiredDeals.length > 0 && (
                  <>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mt-6">Expired</h3>
                    {expiredDeals.map((deal) => (
                      <DealRow
                        key={deal.id}
                        deal={deal}
                        onDelete={handleDelete}
                        deleting={deletingId === deal.id}
                        expired={true}
                      />
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Post form (desktop) */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-5">Post a New Deal</h3>
              <DealForm onSuccess={handleFormSuccess} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DealRow({
  deal,
  onDelete,
  deleting,
  expired,
}: {
  deal: Deal;
  onDelete: (id: string) => void;
  deleting: boolean;
  expired: boolean;
}) {
  const discount = computeDiscount(
    Number(deal.originalPrice),
    Number(deal.discountedPrice)
  );
  const slotPercent = Math.min(
    (deal._count.bookings / deal.totalSlots) * 100,
    100
  );

  return (
    <div
      className={`bg-white rounded-2xl border p-5 shadow-sm transition-all ${
        expired ? "border-gray-100 opacity-60" : "border-gray-200"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                CATEGORY_COLORS[deal.category] || "bg-gray-100 text-gray-700"
              }`}
            >
              {CATEGORY_ICONS[deal.category]} {deal.category}
            </span>
            <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-full">
              {discount}% OFF
            </span>
            {expired && (
              <span className="bg-gray-100 text-gray-500 text-xs font-medium px-2.5 py-1 rounded-full">
                Expired
              </span>
            )}
          </div>
          <h4 className="font-bold text-gray-900 truncate text-lg">{deal.title}</h4>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
            <span className="font-semibold text-cyan-600">
              {formatAWG(Number(deal.discountedPrice))}
            </span>
            <span className="line-through">{formatAWG(Number(deal.originalPrice))}</span>
            <span>·</span>
            <span>Expires {formatExpiryDate(deal.expiryDate)}</span>
          </div>
        </div>

        <button
          onClick={() => onDelete(deal.id)}
          disabled={deleting}
          className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 shrink-0 disabled:opacity-50"
          title="Delete deal"
        >
          {deleting ? (
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Slot progress */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>{deal._count.bookings} bookings</span>
          <span>{deal.totalSlots} total slots</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${
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
    </div>
  );
}
