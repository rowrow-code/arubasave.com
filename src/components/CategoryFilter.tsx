"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CATEGORY_ICONS } from "@/lib/utils";

const categories = ["All", "Restaurants", "Spa", "Tours", "Sports"] as const;

export default function CategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("category") || "All";

  function handleClick(cat: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (cat === "All") {
      params.delete("category");
    } else {
      params.set("category", cat);
    }
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((cat) => {
        const isActive = active === cat || (cat === "All" && !searchParams.get("category"));
        return (
          <button
            key={cat}
            onClick={() => handleClick(cat)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              isActive
                ? "bg-cyan-500 text-white shadow-md shadow-cyan-200"
                : "bg-white text-gray-600 border border-gray-200 hover:border-cyan-300 hover:text-cyan-600"
            }`}
          >
            {cat !== "All" && <span>{CATEGORY_ICONS[cat]}</span>}
            {cat}
          </button>
        );
      })}
    </div>
  );
}
