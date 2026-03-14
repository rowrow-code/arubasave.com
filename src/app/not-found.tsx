import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-cyan-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-7xl mb-6">🏝️</div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
          Deal Not Found
        </h1>
        <p className="text-gray-500 text-lg mb-8 max-w-sm mx-auto">
          This deal may have expired or been removed. Check out other great deals!
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-600 hover:to-sky-700 text-white font-bold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all"
        >
          Browse All Deals
        </Link>
      </div>
    </div>
  );
}
