"use client";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { showSwalAlert } from "../lib/swalHelper";
import Image from "next/image"; // [1] Wajib import Image

export default function ProductCard({ product }) {
  const router = useRouter();

  const addToCart = async () => {
    // Cek stok sebelum menambahkan ke keranjang
    if (product.stock <= 0) {
      showSwalAlert("Maaf", "Stok produk tidak tersedia.", "warning");
      return;
    }

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/cart/add`,
        { productId: product.id, quantity: 1 },
        { withCredentials: true },
      );

      // Memberi notifikasi ke komponen lain (misalnya Header)
      try {
        window.dispatchEvent(new Event("cartUpdated"));
      } catch (e) {}

      // Menggunakan SwalAlert untuk notifikasi sukses
      showSwalAlert("Berhasil", "Produk ditambahkan ke keranjang!", "success");
    } catch (err) {
      console.error(err);

      if (err?.response?.status === 401) {
        showSwalAlert(
          "Akses Ditolak",
          "Silakan login untuk menambahkan item ke keranjang.",
          "error",
        );
        router.push("/login");
        return;
      }

      showSwalAlert("Gagal", "Gagal menambahkan produk ke keranjang.", "error");
    }
  };

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col hover:shadow-2xl transition-shadow duration-200">
      {/* [2] Bagian Render Gambar Diperbaiki */}
      <div className="relative h-40 mb-3 bg-gray-100 rounded overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.title}
            fill // Agar gambar mengisi penuh kotak h-40
            className="object-cover" // Agar gambar tidak gepeng (crop tengah)
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No Image
          </div>
        )}
      </div>

      <h3 className="font-semibold mb-1 truncate">{product.title}</h3>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {product.description}
      </p>

      <div className="mt-auto flex-column">
        <div className="text-lg font-bold mb-2">
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
            }).format(product.price)}
          </span>
        </div>

        <div className="flex justify-between items-center gap-2">
          <Link
            href={`/products/${product.id}`}
            className="text-[#44AF7C] text-sm hover:underline"
          >
            Detail Product
          </Link>
          <button
            onClick={addToCart}
            disabled={isOutOfStock}
            className={`px-3 py-1 rounded text-sm whitespace-nowrap ${
              isOutOfStock
                ? "bg-gray-400 text-gray-800 cursor-not-allowed"
                : "bg-[#44AF7C] text-white hover:bg-[#3b9a6d]"
            }`}
          >
            {isOutOfStock ? "Habis" : "Masuk Keranjang"}
          </button>
        </div>
      </div>
    </div>
  );
}
