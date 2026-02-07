"use client";

import Link from "next/link";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchParams = useSearchParams();
  const search = searchParams?.get("search") || "";
  const category = searchParams?.get("category") || "";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Bangun URL dengan Query Params
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (category) params.append("category", category);

        const url = `${process.env.NEXT_PUBLIC_API_URL}/products?${params.toString()}`;

        console.log("[Frontend Products] Fetching from:", url);

        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(`Failed to fetch products: ${res.status}`);
        }

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Received non-JSON response from server");
        }

        const data = await res.json();
        console.log(
          `[Frontend Products] Successfully fetched ${data.length} products`,
        );
        setProducts(data || []);
      } catch (err) {
        console.error("[Frontend Products] Error fetching products:", err);
        setError(err.message);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [search, category]);

  // Helper untuk menampilkan judul halaman yang dinamis
  const getPageTitle = () => {
    if (search) return `Hasil Pencarian: "${search}"`;
    if (category) return `Kategori: ${category.replace(/_/g, " ")}`; // Ganti underscore dengan spasi
    return "Semua Produk";
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <div className="p-6 pt-[140px] max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold capitalize">{getPageTitle()}</h1>
          <span className="text-gray-600 font-medium">
            {!isLoading && `${products.length} Produk ditemukan`}
          </span>
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin">
              <i className="fas fa-spinner text-4xl text-[#44af7c]"></i>
            </div>
            <p className="text-xl text-gray-500 mt-4">Loading produk...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-red-50 rounded-lg border border-red-200">
            <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
            <p className="text-xl text-red-600 mb-4">⚠️ Gagal memuat produk</p>
            <p className="text-gray-600 mb-4">Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#44af7c] text-white px-6 py-2 rounded hover:bg-[#3b9a6d]"
            >
              Coba Lagi
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow">
            <p className="text-xl text-gray-500">
              Tidak ada produk ditemukan
              {category ? ` di kategori "${category.replace(/_/g, " ")}"` : ""}
              {search ? ` dengan kata kunci "${search}"` : ""}.
            </p>
            <Link
              href="/products"
              className="text-[#44af7c] hover:underline mt-4 inline-block"
            >
              Lihat Semua Produk
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
