"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Header from "../../../components/Header";
import Swal from "sweetalert2";

export default function AddProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    stock: "",
    category: "Produk_Lainnya",
    image: "/images/product_01.png", // Default image sementara
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/products`,
        formData,
        {
          withCredentials: true,
        },
      );
      Swal.fire("Sukses", "Produk berhasil ditambahkan!", "success");
      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Gagal",
        err.response?.data?.error || "Terjadi kesalahan",
        "error",
      );
    }
  };

  return (
    <>
      <Header />
      <div className="p-6 pt-[140px] max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Tambah Produk Baru</h1>
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow space-y-4"
        >
          <div>
            <label className="block text-sm font-bold mb-1">Nama Produk</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Deskripsi</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              rows="3"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Harga ($)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Stok</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Kategori</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="Obat">Obat</option>
              <option value="Suplemen_dan_Vitamin">Suplemen & Vitamin</option>
              <option value="Grooming">Grooming</option>
              <option value="Produk_Lainnya">Produk Lainnya</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">URL Gambar</label>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="/images/nama_file.png"
            />
            <p className="text-xs text-gray-500 mt-1">
              Gunakan URL eksternal atau path lokal di folder public.
            </p>
          </div>

          <div className="pt-4 flex gap-2">
            <button
              type="submit"
              className="bg-[#44af7c] text-white px-6 py-2 rounded hover:bg-green-700"
            >
              Simpan
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
