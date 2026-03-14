import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "AurubaSave — Best Deals in Aruba",
  description:
    "Discover the best deals from restaurants, spas, tours, and sports in Aruba. Book your slot for free and pay on arrival.",
  keywords: "Aruba, deals, discounts, restaurants, spa, tours, sports, AWG",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <Navbar />
          <main>{children}</main>
          <footer className="bg-gray-900 text-gray-400 py-12 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-sky-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">A</span>
                  </div>
                  <span className="text-white font-bold text-lg">
                    Aruba<span className="text-cyan-400">Save</span>
                  </span>
                </div>
                <p className="text-sm text-center">
                  The best deals platform for businesses and visitors in Aruba 🌴
                </p>
                <p className="text-sm">
                  © {new Date().getFullYear()} AurubaSave. All rights reserved.
                </p>
              </div>
            </div>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
