export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import GuestBookingForm from "@/components/GuestBookingForm";
import {
  computeDiscount,
  formatAWG,
  formatExpiryDate,
  getDaysUntilExpiry,
  CATEGORY_COLORS,
  CATEGORY_GRADIENTS,
  CATEGORY_ICONS,
} from "@/lib/utils";

interface Props {
  params: { id: string };
}

export default async function DealPage({ params }: Props) {
  const deal = await prisma.deal.findUnique({
    where: { id: params.id },
    include: {
      business: { select: { id: true, name: true, phone: true, description: true } },
      _count: { select: { bookings: true } },
    },
  });

  if (!deal || deal.expiryDate < new Date()) {
    notFound();
  }

  const original = Number(deal.originalPrice);
  const discounted = Number(deal.discountedPrice);
  const discount = computeDiscount(original, discounted);
  const claimedSlots = deal._count.bookings;
  const daysLeft = getDaysUntilExpiry(deal.expiryDate);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-cyan-600 transition-colors">
              Deals
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate">{deal.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero image */}
            <div className="relative h-72 md:h-96 rounded-3xl overflow-hidden shadow-lg">
              {deal.imageUrl ? (
                <Image
                  src={deal.imageUrl}
                  alt={deal.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div
                  className={`w-full h-full bg-gradient-to-br ${
                    CATEGORY_GRADIENTS[deal.category] || "from-cyan-400 to-sky-500"
                  } flex items-center justify-center`}
                >
                  <span className="text-8xl opacity-80">
                    {CATEGORY_ICONS[deal.category] || "🏝️"}
                  </span>
                </div>
              )}

              {/* Discount badge */}
              <div className="absolute top-5 left-5">
                <span className="bg-orange-500 text-white text-xl font-bold px-5 py-2 rounded-full shadow-xl">
                  {discount}% OFF
                </span>
              </div>
            </div>

            {/* Deal info */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              {/* Category */}
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`text-sm font-semibold px-3 py-1.5 rounded-full ${
                    CATEGORY_COLORS[deal.category] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  {CATEGORY_ICONS[deal.category]} {deal.category}
                </span>
                {daysLeft <= 3 && (
                  <span className="bg-red-100 text-red-700 text-sm font-semibold px-3 py-1.5 rounded-full">
                    ⚡ {daysLeft} day{daysLeft !== 1 ? "s" : ""} left
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
                {deal.title}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-4xl font-extrabold text-cyan-600">
                  {formatAWG(discounted)}
                </span>
                <span className="text-xl text-gray-400 line-through">
                  {formatAWG(original)}
                </span>
                <span className="text-lg text-emerald-600 font-bold">
                  Save {formatAWG(original - discounted)}
                </span>
              </div>

              <p className="text-gray-600 leading-relaxed text-lg mb-6">
                {deal.description}
              </p>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-sky-50 rounded-2xl p-4">
                  <div className="text-xs text-gray-500 font-medium mb-1">Expiry Date</div>
                  <div className="font-bold text-gray-900">
                    {formatExpiryDate(deal.expiryDate)}
                  </div>
                </div>
                <div className="bg-sky-50 rounded-2xl p-4">
                  <div className="text-xs text-gray-500 font-medium mb-1">Slots Available</div>
                  <div className="font-bold text-gray-900">
                    {Math.max(0, deal.totalSlots - claimedSlots)} of {deal.totalSlots}
                  </div>
                </div>
              </div>
            </div>

            {/* Business info */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg mb-4">About the Business</h3>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-sky-500 rounded-2xl flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-lg">
                    {deal.business.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-lg">{deal.business.name}</div>
                  {deal.business.description && (
                    <p className="text-gray-500 text-sm mt-1">{deal.business.description}</p>
                  )}
                  {deal.business.phone && (
                    <a
                      href={`tel:${deal.business.phone}`}
                      className="inline-flex items-center gap-1.5 text-sm text-cyan-600 font-medium mt-2 hover:underline"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {deal.business.phone}
                    </a>
                  )}
                </div>
              </div>

              {/* How it works */}
              <div className="mt-5 pt-5 border-t border-gray-100">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">How it works</h4>
                <div className="space-y-2">
                  {[
                    { step: "1", text: "Book your slot below — it's free" },
                    { step: "2", text: "Show your name at the business" },
                    { step: "3", text: "Pay the discounted price on arrival" },
                  ].map(({ step, text }) => (
                    <div key={step} className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-6 h-6 bg-cyan-100 text-cyan-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                        {step}
                      </div>
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Booking sidebar */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-4">
            <GuestBookingForm
              dealId={deal.id}
              totalSlots={deal.totalSlots}
              claimedSlots={claimedSlots}
            />

            <Link
              href="/"
              className="block text-center text-sm text-gray-500 hover:text-cyan-600 transition-colors"
            >
              ← Browse more deals
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
