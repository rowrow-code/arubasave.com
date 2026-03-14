import Link from "next/link";
import Image from "next/image";
import {
  computeDiscount,
  formatAWG,
  formatExpiryDate,
  isExpiringSoon,
  CATEGORY_COLORS,
  CATEGORY_GRADIENTS,
  CATEGORY_ICONS,
} from "@/lib/utils";

interface Deal {
  id: string;
  title: string;
  description: string;
  category: string;
  originalPrice: number | string;
  discountedPrice: number | string;
  expiryDate: string | Date;
  totalSlots: number;
  imageUrl?: string | null;
  business: { id: string; name: string };
  _count: { bookings: number };
}

export default function DealCard({ deal }: { deal: Deal }) {
  const original = Number(deal.originalPrice);
  const discounted = Number(deal.discountedPrice);
  const discount = computeDiscount(original, discounted);
  const claimedSlots = deal._count.bookings;
  const availableSlots = deal.totalSlots - claimedSlots;
  const isSoldOut = availableSlots <= 0;
  const slotPercent = Math.min((claimedSlots / deal.totalSlots) * 100, 100);
  const expiringSoon = isExpiringSoon(deal.expiryDate);

  return (
    <Link href={`/deals/${deal.id}`} className="group block">
      <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group-hover:-translate-y-1">
        {/* Image / Placeholder */}
        <div className="relative h-48 overflow-hidden">
          {deal.imageUrl ? (
            <Image
              src={deal.imageUrl}
              alt={deal.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div
              className={`w-full h-full bg-gradient-to-br ${
                CATEGORY_GRADIENTS[deal.category] || "from-cyan-400 to-sky-500"
              } flex items-center justify-center`}
            >
              <span className="text-6xl opacity-80">
                {CATEGORY_ICONS[deal.category] || "🏝️"}
              </span>
            </div>
          )}

          {/* Discount badge */}
          <div className="absolute top-3 left-3">
            <span className="bg-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
              {discount}% OFF
            </span>
          </div>

          {/* Expiring soon badge */}
          {expiringSoon && !isSoldOut && (
            <div className="absolute top-3 right-3">
              <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-lg animate-pulse">
                Expiring Soon
              </span>
            </div>
          )}

          {/* Sold out overlay */}
          {isSoldOut && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-gray-900 font-bold text-lg px-6 py-2 rounded-full">
                Fully Booked
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Category + Business */}
          <div className="flex items-center justify-between mb-3">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                CATEGORY_COLORS[deal.category] || "bg-gray-100 text-gray-700"
              }`}
            >
              {CATEGORY_ICONS[deal.category]} {deal.category}
            </span>
            <span className="text-xs text-gray-500 truncate max-w-[120px]">
              {deal.business.name}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-2 group-hover:text-cyan-600 transition-colors">
            {deal.title}
          </h3>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-bold text-cyan-600">
              {formatAWG(discounted)}
            </span>
            <span className="text-sm text-gray-400 line-through">
              {formatAWG(original)}
            </span>
          </div>

          {/* Slots progress */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{claimedSlots} claimed</span>
              <span>{deal.totalSlots} total slots</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
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

          {/* Expiry */}
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>Expires {formatExpiryDate(deal.expiryDate)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
