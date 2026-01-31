"use client";
import AddToCartButton from "./AddToCartButton";
import Link from "next/link"; // Menggunakan Link dari Next.js

// Konstanta warna dari Header/Register
const COLOR_PRIMARY_GREEN = "#44af7c";
const COLOR_PRIMARY_YELLOW = "#ffbf00";
const COLOR_TEXT_DARK = "#2b2b2b";
const COLOR_LIGHT_BG = "#f3f4f6";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function ProductDetails({ product }) {
  const stockStatus = product.stock > 0 ? "In Stock" : "Out of Stock";
  const stockColor =
    product.stock > 10
      ? "text-green-600"
      : product.stock > 0
      ? "text-yellow-600"
      : "text-red-600";
  const isAvailable = product.stock > 0;

  // Asumsi: path gambar produk ada di field 'image'
  const imageUrl = product.image || "/next.svg"; // Fallback ke next.svg jika tidak ada gambar

  return (
    <div className="max-w-6xl mx-auto p-6 pt-[140px]">
      <Link
        href="/"
        className="text-sm text-gray-600 hover:text-[#44af7c] mb-4 inline-block"
      >
        &larr; Kembali ke Daftar Produk
      </Link>

      {/* Container Utama - Layout Dua Kolom */}
      <div className="bg-white rounded-xl shadow-2xl p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Kolom Kiri: Gambar Produk */}
        <div className="lg:col-span-1 flex justify-center items-center bg-[#f7f7f7] rounded-lg p-6">
          {/* Ganti dengan komponen Image next/image jika diperlukan */}
          <img
            src={imageUrl}
            alt={product.title}
            className="w-full max-h-[500px] object-contain rounded-md"
          />
        </div>

        {/* Kolom Kanan: Detail & Aksi */}
        <div className="lg:col-span-1 flex flex-col justify-start text-[#2b2b2b]">
          {/* Judul & Brand */}
          <h1
            className={`text-4xl sm:text-5xl font-['Lilita_One'] mb-2 ${COLOR_TEXT_DARK}`}
          >
            {product.title}
          </h1>
          <p className="text-gray-500 text-sm mb-4">Brand: HolyCat</p>

          {/* Harga */}
          <div className="my-4 p-4 rounded-lg bg-[#e8f5ef] border-l-4 border-[#44af7c]">
            <span className="text-2xl font-extrabold text-[#44af7c]">
              {formatCurrency(product.price)}
            </span>
          </div>

          {/* Status Stok */}
          <div className="text-sm font-semibold mb-6">
            Status: <span className={stockColor}>{stockStatus}</span> (Tersedia{" "}
            {product.stock} unit)
          </div>

          {/* Deskripsi */}
          <h3 className="text-xl font-bold mb-2">Deskripsi Produk:</h3>
          <p className="text-gray-700 text-base leading-relaxed mb-6">
            {product.description}
          </p>

          {/* Tombol Add to Cart */}
          <div className="mt-auto">
            <AddToCartButton
              productId={product.id}
              disabled={!isAvailable}
              className={`w-full py-3 rounded-full text-lg font-bold transition-all duration-300 shadow-md 
                        ${
                          isAvailable
                            ? `bg-[${COLOR_PRIMARY_YELLOW}] text-[${COLOR_TEXT_DARK}] hover:bg-[#44af7c] hover:text-white`
                            : "bg-gray-400 text-gray-600 cursor-not-allowed"
                        }`}
            />
            {!isAvailable && (
              <p className="text-red-500 text-sm mt-2">
                Mohon maaf, stok sedang habis.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
