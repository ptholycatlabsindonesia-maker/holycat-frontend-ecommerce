"use client";

import { Suspense, useEffect, useState } from "react";
import Header from "./components/Header";
import ProductCard from "./components/ProductCard";
import Link from "next/link";

export default function Home() {
  const [products, setProducts] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/products`;

        console.log("[Frontend Client] Fetching products from:", apiUrl);

        const res = await fetch(apiUrl, {
          headers: {
            "User-Agent": "NextJS-Client/Frontend",
          },
        });

        console.log("[Frontend Client] Response Status:", res.status);

        if (!res.ok) {
          throw new Error(`Failed to fetch products: ${res.status}`);
        }

        const data = await res.json();
        console.log(
          `[Frontend Client] Successfully fetched ${data.length} products`,
        );
        setProducts(data);
      } catch (err) {
        console.error(
          "[Frontend Client] Error fetching products:",
          err.message,
        );
        setProducts(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* [FIX] Bungkus Header dengan Suspense */}
      <Suspense
        fallback={
          <div className="h-[70px] bg-white shadow-md fixed top-0 w-full z-50"></div>
        }
      >
        <Header />
      </Suspense>

      <main className="max-w-7xl mx-auto px-6 py-12 pt-[140px]">
        {/* Hero */}
        <section className="relative grid grid-cols-1 lg:grid-cols-3 gap-6 items-center mb-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-10 right-20 w-32 h-32 bg-slate-700/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-slate-700/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-white/40 rounded-full"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white/30 rounded-full"></div>

          <div className="lg:col-span-2 text-white p-10 lg:p-16 relative z-10">
            <p className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-red-500"></span>
              Best Products
            </p>
            <h1 className="text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              PROMO
              <br />
              AKHIR TAHUN
            </h1>
            <Link
              href="/products"
              className="inline-block bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded transition-colors"
            >
              See All Products
            </Link>
          </div>

          <div className="hidden lg:block lg:col-span-1 p-6 relative z-10">
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <div className="mb-4">
                <p className="text-xs font-medium text-red-500 mb-1">
                  Weekly Best Deals
                </p>
                <h3 className="text-2xl font-bold text-gray-900">
                  Save UP to 70%
                </h3>
              </div>
              <button className="w-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2 rounded mb-6 transition-colors flex items-center justify-center gap-2">
                Shop Now
                <span>→</span>
              </button>
              <ul className="space-y-4">
                <li className="flex gap-3 items-start">
                  <div className="w-16 h-16 bg-blue-100 rounded flex-shrink-0 flex items-center justify-center">
                    <div className="w-10 h-10 bg-blue-200 rounded"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-900">
                      Kalung Kucing
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400 line-through">
                        Rp.150.000
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        Rp.130.000
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-yellow-400 text-xs">★★★★★</span>
                      <span className="text-xs text-gray-400">
                        (1.4K Review)
                      </span>
                    </div>
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <div className="w-16 h-16 bg-yellow-100 rounded flex-shrink-0 flex items-center justify-center">
                    <div className="w-10 h-10 bg-yellow-200 rounded"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-900">
                      Baju Kucing Nataru
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400 line-through">
                        Rp.150.000
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        Rp.130.000
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-yellow-400 text-xs">★★★★★</span>
                      <span className="text-xs text-gray-400">
                        (1.4K Review)
                      </span>
                    </div>
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <div className="w-16 h-16 bg-pink-100 rounded flex-shrink-0 flex items-center justify-center">
                    <div className="w-10 h-10 bg-pink-200 rounded"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-900">
                      Wadah Makanan Kucing Tema Nataru
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400 line-through">
                        Rp.150.000
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        Rp.130.000
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-yellow-400 text-xs">★★★★★</span>
                      <span className="text-xs text-gray-400">
                        (1.4K Review)
                      </span>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Featured products */}
        <section id="featured">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <Link href="/products" className="text-sm text-indigo-600">
              View all
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              <div className="col-span-1 sm:col-span-2 lg:col-span-4 bg-white p-6 rounded shadow">
                <p className="text-center text-gray-600">Loading products...</p>
              </div>
            ) : products === null ? (
              <div className="col-span-1 sm:col-span-2 lg:col-span-4 bg-white p-6 rounded shadow">
                <p className="text-center text-gray-600">
                  Products currently unavailable — the backend may be down.
                </p>
              </div>
            ) : products.length === 0 ? (
              <div className="col-span-1 sm:col-span-2 lg:col-span-4 bg-white p-6 rounded shadow">
                <p className="text-center text-gray-600">No products found.</p>
              </div>
            ) : (
              products.map((p) => <ProductCard key={p.id} product={p} />)
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
