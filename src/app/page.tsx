import { Suspense } from "react";
import DealCard from "@/components/DealCard";
import CategoryFilter from "@/components/CategoryFilter";
import SearchBar from "@/components/SearchBar";
import { prisma } from "@/lib/prisma";
import { Category } from "@prisma/client";

interface Deal {
  id: string;
  title: string;
  description: string;
  category: string;
  originalPrice: number;
  discountedPrice: number;
  expiryDate: string;
  totalSlots: number;
  imageUrl?: string | null;
  business: { id: string; name: string };
  _count: { bookings: number };
}

async function getDeals(search?: string, category?: string): Promise<Deal[]> {
  try {
    const deals = await prisma.deal.findMany({
      where: {
        expiryDate: { gt: new Date() },
        ...(category && Object.values(Category).includes(category as Category)
          ? { category: category as Category }
          : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { business: { name: { contains: search, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
      include: {
        business: { select: { id: true, name: true } },
        _count: { select: { bookings: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return deals as any;
  } catch {
    return [];
  }
}

interface PageProps {
  searchParams: { search?: string; category?: string };
}

export default async function HomePage({ searchParams }: PageProps) {
  const deals = await getDeals(searchParams.search, searchParams.category);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-cyan-600 via-sky-600 to-blue-700 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <span>🌴</span>
            <span>Aruba&apos;s #1 Deals Platform</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight">
            Save Big in{" "}
            <span className="text-cyan-200">Paradise</span>
          </h1>
          <p className="text-lg md:text-xl text-cyan-100 max-w-2xl mx-auto mb-10">
            Discover exclusive deals from restaurants, spas, tours, and sports
            in Aruba. Book your slot for free — pay when you arrive.
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-8 text-center mb-10">
            <div>
              <div className="text-3xl font-bold">{deals.length}</div>
              <div className="text-cyan-200 text-sm">Active Deals</div>
            </div>
            <div className="w-px bg-white/20" />
            <div>
              <div className="text-3xl font-bold">100%</div>
              <div className="text-cyan-200 text-sm">Free to Book</div>
            </div>
            <div className="w-px bg-white/20" />
            <div>
              <div className="text-3xl font-bold">AWG</div>
              <div className="text-cyan-200 text-sm">Local Prices</div>
            </div>
          </div>
        </div>
      </section>

      {/* Deals section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Search + Filters */}
        <div className="space-y-4 mb-10">
          <Suspense fallback={<div className="h-14 bg-gray-100 rounded-2xl animate-pulse" />}>
            <SearchBar />
          </Suspense>
          <Suspense fallback={<div className="h-10 bg-gray-100 rounded-full animate-pulse" />}>
            <CategoryFilter />
          </Suspense>
        </div>

        {/* Results header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {searchParams.category
              ? `${searchParams.category} Deals`
              : searchParams.search
              ? `Results for "${searchParams.search}"`
              : "All Active Deals"}
          </h2>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
            {deals.length} deal{deals.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Deal grid */}
        {deals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🏝️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No deals found
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              {searchParams.search || searchParams.category
                ? "Try a different search or category."
                : "No active deals right now. Check back soon!"}
            </p>
          </div>
        )}
      </section>

      {/* CTA for businesses */}
      <section className="bg-gradient-to-r from-cyan-50 to-sky-50 border-t border-cyan-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Own a Business in Aruba?
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            Post your deals for free and attract more customers from across the island.
          </p>
          <a
            href="/auth/business/register"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-600 hover:to-sky-700 text-white font-bold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all text-lg"
          >
            Start for Free
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </section>
    </div>
  );
}
