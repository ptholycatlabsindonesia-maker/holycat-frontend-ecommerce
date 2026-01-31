"use client";
import { useEffect, useState, Suspense } from "react"; // [FIX] Tambahkan Import Suspense
import axios from "axios";
import Header from "../../components/Header";
import Link from "next/link";
import Swal from "sweetalert2";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // [BARU] Search State
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchProducts = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/products`,
      );
      // Sort produk terbaru di atas (asumsi ID besar = baru)
      const sorted = res.data.sort((a, b) => b.id - a.id);
      setProducts(sorted);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Gagal memuat produk", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // [BARU] Reset halaman ke 1 saat user mengetik search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Hapus Produk?",
      text: "Tindakan ini tidak dapat dibatalkan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Ya, Hapus!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_API_URL}/products/${id}`,
          {
            withCredentials: true,
          },
        );
        Swal.fire("Terhapus!", "Produk berhasil dihapus.", "success");
        fetchProducts(); // Refresh list
      } catch (err) {
        const msg = err.response?.data?.error || "Gagal menghapus produk";
        Swal.fire("Gagal", msg, "error");
      }
    }
  };

  // [BARU] Logika Filtering Search
  const filteredProducts = products.filter((product) => {
    const query = searchQuery.toLowerCase();
    const titleMatch = product.title?.toLowerCase().includes(query);
    const categoryMatch = product.category?.toLowerCase().includes(query);
    return titleMatch || categoryMatch;
  });

  // Logika Pagination (Menggunakan hasil filter)
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  if (loading)
    return (
      <>
        {/* [FIX] Bungkus Header dengan Suspense */}
        <Suspense
          fallback={
            <div className="h-[70px] bg-white shadow-md fixed top-0 w-full z-50"></div>
          }
        >
          <Header />
        </Suspense>
        <div className="p-10 pt-[140px] text-center">Loading...</div>
      </>
    );

  return (
    <>
      {/* [FIX] Bungkus Header dengan Suspense */}
      <Suspense
        fallback={
          <div className="h-[70px] bg-white shadow-md fixed top-0 w-full z-50"></div>
        }
      >
        <Header />
      </Suspense>

      <div className="p-6 pt-[140px] max-w-7xl mx-auto">
        {/* HEADER SECTION: Judul + Search + Tombol Tambah */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-[#2b2b2b]">Kelola Produk</h1>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* [BARU] Input Search */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400 absolute left-3 top-2.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <Link
              href="/admin/products/add"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-center whitespace-nowrap transition"
            >
              + Tambah Produk
            </Link>
          </div>
        </div>

        {/* TABEL PRODUK */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 text-gray-600 uppercase text-sm">
              <tr>
                <th className="p-4 border-b">ID</th>
                <th className="p-4 border-b">Gambar</th>
                <th className="p-4 border-b">Nama Produk</th>
                <th className="p-4 border-b">Kategori</th>
                <th className="p-4 border-b">Harga</th>
                <th className="p-4 border-b">Stok</th>
                <th className="p-4 border-b text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.length > 0 ? (
                currentProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 border-b transition"
                  >
                    <td className="p-4 text-gray-500">#{product.id}</td>
                    <td className="p-4">
                      <img
                        src={product.image || "/next.svg"}
                        alt={product.title}
                        className="w-12 h-12 object-cover rounded bg-gray-100 border border-gray-200"
                      />
                    </td>
                    <td className="p-4 font-medium text-gray-800">
                      {product.title}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs font-semibold uppercase tracking-wide">
                        {product.category?.replace(/_/g, " ") || "-"}
                      </span>
                    </td>
                    <td className="p-4 text-green-600 font-bold">
                      Rp {product.price?.toLocaleString("id-ID")}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          product.stock > 10
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="p-4 flex justify-center gap-2">
                      <Link
                        href={`/admin/products/edit/${product.id}`}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-10 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 text-gray-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p>
                        {searchQuery
                          ? `Tidak ada produk dengan kata kunci "${searchQuery}"`
                          : "Belum ada produk."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* [MODIFIKASI] Pagination Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          <div className="text-sm text-gray-500">
            Menampilkan <strong>{currentProducts.length}</strong> dari{" "}
            <strong>{filteredProducts.length}</strong> produk
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border bg-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
            >
              Prev
            </button>

            {/* Indikator Halaman */}
            <span className="px-4 py-2 bg-white border rounded">
              {totalPages > 0 ? currentPage : 0} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-4 py-2 border bg-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
