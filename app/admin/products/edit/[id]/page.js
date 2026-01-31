"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import Header from "../../../../components/Header"; // Perhatikan level folder
import Swal from "sweetalert2";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    image: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data produk yang akan diedit
    axios
      .get(`$\{process.env.NEXT_PUBLIC_API_URL}/products/${productId}`)
      .then((res) => {
        setFormData({
          title: res.data.title,
          description: res.data.description || "",
          price: res.data.price,
          stock: res.data.stock,
          category: res.data.category,
          image: res.data.image || "",
        });
        setLoading(false);
      })
      .catch((err) => {
        Swal.fire("Error", "Produk tidak ditemukan", "error");
        router.push("/admin/products");
      });
  }, [productId, router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`$\{process.env.NEXT_PUBLIC_API_URL}/products/${productId}`, formData, {
        withCredentials: true,
      });
      Swal.fire("Sukses", "Produk berhasil diperbarui!", "success");
      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Gagal",
        err.response?.data?.error || "Terjadi kesalahan",
        "error"
      );
    }
  };

  if (loading)
    return (
      <>
        {" "}
        <Header />{" "}
        <div className="p-10 pt-[140px] text-center">Loading Data...</div>{" "}
      </>
    );

  return (
    <>
      <Header />
      <div className="p-6 pt-[140px] max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Produk #{productId}</h1>
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow space-y-4"
        >
          {/* Gunakan form yang sama dengan Add Product, tapi value terisi */}
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
            />
          </div>
          <div className="pt-4 flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Update
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
