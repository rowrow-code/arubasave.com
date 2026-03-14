"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("search") || "");

  const push = useCallback(
    (val: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (val) {
        params.set("search", val);
      } else {
        params.delete("search");
      }
      router.push(`/?${params.toString()}`);
    },
    [router, searchParams]
  );

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      push(value);
    }, 300);
    return () => clearTimeout(timer);
  }, [value, push]);

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search deals or businesses..."
        className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent shadow-sm text-base"
      />
      {value && (
        <button
          onClick={() => setValue("")}
          className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
