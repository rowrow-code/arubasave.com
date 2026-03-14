export function computeDiscount(
  originalPrice: number,
  discountedPrice: number
): number {
  if (originalPrice <= 0) return 0;
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
}

export function formatAWG(amount: number): string {
  return `AWG ${amount.toFixed(2)}`;
}

export function formatExpiryDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getDaysUntilExpiry(expiryDate: Date | string): number {
  const expiry = typeof expiryDate === "string" ? new Date(expiryDate) : expiryDate;
  const now = new Date();
  const diff = expiry.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function isExpiringSoon(expiryDate: Date | string): boolean {
  return getDaysUntilExpiry(expiryDate) <= 3;
}

export const CATEGORY_COLORS: Record<string, string> = {
  Restaurants: "bg-amber-100 text-amber-800",
  Spa: "bg-pink-100 text-pink-800",
  Tours: "bg-emerald-100 text-emerald-800",
  Sports: "bg-blue-100 text-blue-800",
};

export const CATEGORY_GRADIENTS: Record<string, string> = {
  Restaurants: "from-amber-400 to-orange-500",
  Spa: "from-pink-400 to-rose-500",
  Tours: "from-emerald-400 to-teal-500",
  Sports: "from-blue-400 to-cyan-500",
};

export const CATEGORY_ICONS: Record<string, string> = {
  Restaurants: "🍽️",
  Spa: "💆",
  Tours: "🌴",
  Sports: "🏄",
};
