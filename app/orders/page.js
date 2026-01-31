"use client";
import { useEffect, useState, useCallback, Suspense } from "react"; // [FIX] Tambahkan import Suspense
import axios from "axios";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import { showSwalAlert } from "../lib/swalHelper";
import Link from "next/link";
import Swal from "sweetalert2";

// Helper Status Style
const getStatusStyle = (status) => {
  switch (status) {
    case "Selesai":
      return "bg-green-100 text-green-700";
    case "Dikirim":
      return "bg-blue-100 text-blue-700";
    case "Dikemas":
      return "bg-indigo-100 text-indigo-700";
    case "Diproses":
      return "bg-purple-100 text-purple-700";
    case "Dibatalkan":
      return "bg-red-100 text-red-700";
    case "Menunggu_Pembayaran":
    default:
      return "bg-yellow-100 text-yellow-700";
  }
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString) => {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString("id-ID", options);
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Fetch Orders
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        withCredentials: true,
      });
      // Sort agar yang terbaru di atas
      const sorted = res.data.sort((a, b) => b.id - a.id);
      setOrders(sorted);
    } catch (err) {
      console.error("Fetch orders error:", err);
      if (err?.response?.status === 401) {
        router.push("/login?redirect=/orders");
      } else {
        setError("Gagal memuat riwayat pesanan.");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // [FITUR BARU] Handle Pesanan Diterima
  const handleOrderReceived = async (e, orderId) => {
    e.preventDefault(); // Mencegah link parent terklik
    e.stopPropagation();

    const result = await Swal.fire({
      title: "Pesanan Sudah Diterima?",
      text: "Pastikan barang sudah sampai dan sesuai. Status akan berubah menjadi 'Selesai'.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#44af7c", // Warna hijau
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Terima Barang",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      // Panggil endpoint baru di backend
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/receive`,
        {},
        { withCredentials: true },
      );

      // Update state lokal biar langsung berubah tanpa reload
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "Selesai" } : o)),
      );

      showSwalAlert("Terima Kasih!", "Pesanan telah diselesaikan.", "success");
    } catch (err) {
      console.error("Receive order error:", err);
      showSwalAlert("Gagal", "Terjadi kesalahan saat update status.", "error");
    }
  };

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
      <div className="pt-[100px]"></div> {/* Spacer Header */}
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-[#2b2b2b]">
          Riwayat Pesanan Saya
        </h1>

        {loading && (
          <p className="text-center text-gray-500">Memuat pesanan...</p>
        )}
        {error && <p className="text-red-600 text-center">{error}</p>}

        {!loading && !error && orders.length === 0 ? (
          <div className="text-center text-gray-600 bg-white p-12 rounded-lg shadow-sm border border-gray-100">
            <p className="mb-4 text-lg">Anda belum memiliki riwayat pesanan.</p>
            <Link
              href="/"
              className="inline-block bg-[#44af7c] text-white px-6 py-2 rounded-full hover:bg-[#369f6e] transition font-medium"
            >
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusStyle = getStatusStyle(order.status);
              const firstItem = order.items?.[0]?.product;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition duration-200 overflow-hidden"
                >
                  <div className="p-4 flex flex-col sm:flex-row gap-4 items-center">
                    {/* Gambar Produk */}
                    <div className="w-20 h-20 bg-gray-100 rounded-lg shrink-0 overflow-hidden border border-gray-100">
                      {firstItem?.image ? (
                        <img
                          src={firstItem.image}
                          alt={firstItem.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                          No Img
                        </div>
                      )}
                    </div>

                    {/* Detail Order (Link ke Detail) */}
                    <Link
                      href={`/order/${order.id}`}
                      className="flex-1 w-full sm:w-auto group"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <span className="font-bold text-lg text-gray-800 group-hover:text-[#44af7c] transition">
                            Order #{order.id}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full ${statusStyle}`}
                        >
                          {order.status.replace("_", " ")}
                        </span>
                      </div>

                      <div className="mt-2 text-sm text-gray-600">
                        <p className="font-medium text-gray-900">
                          {formatCurrency(order.total)}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {order.paymentMethod?.replace("_", " ") ||
                            "Metode N/A"}
                        </p>
                      </div>
                    </Link>

                    {/* [BAGIAN TOMBOL AKSI] */}
                    <div className="flex flex-col gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                      {/* Tombol Pesanan Diterima (Hanya jika status Dikirim) */}
                      {order.status === "Dikirim" && (
                        <button
                          onClick={(e) => handleOrderReceived(e, order.id)}
                          className="bg-[#44af7c] hover:bg-[#369f6e] text-white text-xs font-bold py-2 px-4 rounded-lg shadow-sm transition transform active:scale-95 whitespace-nowrap"
                        >
                          Pesanan Diterima
                        </button>
                      )}

                      {/* Tombol Detail (Selalu Ada) */}
                      <Link
                        href={`/order/${order.id}`}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold py-2 px-4 rounded-lg text-center transition whitespace-nowrap"
                      >
                        Detail
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
