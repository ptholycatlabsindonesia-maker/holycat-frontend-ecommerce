"use client";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import { showSwalAlert } from "../../lib/swalHelper";
import Link from "next/link";
import Swal from "sweetalert2";

// Helper status style
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
  if (!dateString) return "N/A";
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString("id-ID", options);
};

const allStatuses = [
  "Menunggu_Pembayaran",
  "Diproses",
  "Dikemas",
  "Dikirim",
  "Selesai",
  "Dibatalkan",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // STATE FILTER & SEARCH
  const [filterStatus, setFilterStatus] = useState("SEMUA");
  const [searchQuery, setSearchQuery] = useState("");

  // [BARU] STATE PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Jumlah pesanan per halaman

  // 1. Cek Autentikasi Admin
  const checkAdminAuth = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${"process.env.NEXT_PUBLIC_API_URL"}/auth/me`,
        {
          withCredentials: true,
        },
      );
      if (res.data.role !== "ADMIN") {
        throw new Error("Akses ditolak");
      }
      await fetchOrders();
    } catch (err) {
      console.error("Auth check error:", err);
      showSwalAlert(
        "Akses Ditolak",
        "Anda harus login sebagai Admin.",
        "error",
      );
      router.push("/login?redirect=/admin/orders");
    }
  }, [router]);

  // 2. Fetch Orders
  const fetchOrders = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/orders`,
        {
          withCredentials: true,
        },
      );
      const sorted = res.data.sort((a, b) => b.id - a.id);
      setOrders(sorted);
    } catch (err) {
      console.error("Fetch admin orders error:", err);
      setError("Gagal memuat pesanan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAdminAuth();
  }, [checkAdminAuth]);

  // [BARU] Reset ke Halaman 1 jika Filter atau Search berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchQuery]);

  // 3. Handle Status Change
  const handleStatusChange = async (orderId, newStatus) => {
    let payload = { status: newStatus };

    if (newStatus === "Dikirim") {
      const { value: formValues } = await Swal.fire({
        title: "Masukkan Detail Pengiriman",
        html:
          '<input id="swal-input-courier" class="swal2-input" placeholder="Nama Kurir (cth: JNE)">' +
          '<input id="swal-input-tracking" class="swal2-input" placeholder="Nomor Resi">',
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Simpan & Kirim",
        cancelButtonText: "Batal",
        preConfirm: () => {
          const courier = document.getElementById("swal-input-courier").value;
          const trackingNumber = document.getElementById(
            "swal-input-tracking",
          ).value;
          if (!courier || !trackingNumber) {
            Swal.showValidationMessage(
              "Kurir dan Nomor Resi tidak boleh kosong",
            );
            return false;
          }
          return { courier, trackingNumber };
        },
      });

      if (!formValues) {
        setOrders((prev) => [...prev]);
        return;
      }
      payload.courier = formValues.courier;
      payload.trackingNumber = formValues.trackingNumber;
    }

    try {
      const res = await axios.put(
        `$\{process.env.NEXT_PUBLIC_API_URL}/admin/orders/${orderId}/status`,
        payload,
        { withCredentials: true },
      );
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.data : o)));
      showSwalAlert(
        "Berhasil",
        `Status order #${orderId} diperbarui.`,
        "success",
      );
    } catch (err) {
      console.error("Update status error:", err);
      showSwalAlert("Gagal", "Gagal memperbarui status.", "error");
      setOrders((prev) => [...prev]);
    }
  };

  // --- LOGIKA UTAMA (FILTER -> SEARCH -> PAGINATION) ---

  // 1. Filter & Search
  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      filterStatus === "SEMUA" || order.status === filterStatus;
    const courier = order.courier?.toLowerCase() || "";
    const tracking = order.trackingNumber?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    const matchesSearch = courier.includes(query) || tracking.includes(query);
    return matchesStatus && matchesSearch;
  });

  // 2. Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  // Helper ganti halaman
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading)
    return (
      <>
        <Header />
        <div className="p-6 pt-[140px] text-center">Loading...</div>
      </>
    );
  if (error)
    return (
      <>
        <Header />
        <div className="p-6 pt-[140px] text-center text-red-600">{error}</div>
      </>
    );

  return (
    <>
      <Header />
      <div className="p-6 pt-[140px] max-w-7xl mx-auto">
        {/* HEADER & FILTER SECTION */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-[#2b2b2b]">
            Admin: Kelola Pesanan
          </h1>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {/* Input Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Cari Resi / Kurir..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44af7c] w-full sm:w-64"
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

            {/* Filter Status */}
            <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border border-gray-300">
              <span className="text-sm font-semibold text-gray-600 whitespace-nowrap">
                Status:
              </span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent text-sm focus:outline-none font-medium text-gray-700 cursor-pointer"
              >
                <option value="SEMUA">Semua</option>
                {allStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* TABEL */}
        <div className="bg-white p-6 rounded-lg shadow-lg overflow-x-auto min-h-[400px]">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-gray-700">
                <th className="p-3 font-semibold">Order ID</th>
                <th className="p-3 font-semibold">Tanggal</th>
                <th className="p-3 font-semibold">Pelanggan</th>
                <th className="p-3 font-semibold">Total</th>
                <th className="p-3 font-semibold">Info Resi</th>
                <th className="p-3 font-semibold text-center">Status</th>
                <th className="p-3 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {/* Gunakan currentOrders (data yang sudah dipaginasi) */}
              {currentOrders.length > 0 ? (
                currentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-3 font-medium text-blue-600">
                      <Link
                        href={`/order/${order.id}`}
                        className="hover:underline"
                      >
                        #{order.id}
                      </Link>
                    </td>
                    <td className="p-3 text-gray-600">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-gray-800">
                        {order.user?.name || "User Dihapus"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.user?.email}
                      </div>
                    </td>
                    <td className="p-3 font-medium">
                      {formatCurrency(order.total)}
                    </td>

                    <td className="p-3">
                      {order.trackingNumber ? (
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-700">
                            {order.courier}
                          </span>
                          <span className="text-xs text-gray-500 font-mono bg-gray-100 px-1 rounded w-fit">
                            {order.trackingNumber}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>

                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${getStatusStyle(
                          order.status,
                        )}`}
                      >
                        {order.status.replace("_", " ")}
                      </span>
                    </td>

                    <td className="p-3">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value)
                        }
                        className="p-1.5 text-xs border rounded focus:ring-2 focus:ring-[#44af7c] focus:outline-none cursor-pointer"
                      >
                        {allStatuses.map((s) => (
                          <option key={s} value={s}>
                            {s.replace("_", " ")}
                          </option>
                        ))}
                      </select>
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
                      <p>Tidak ada pesanan ditemukan.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* [BARU] FOOTER PAGINATION */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          <div className="text-sm text-gray-500">
            Menampilkan <strong>{currentOrders.length}</strong> dari{" "}
            <strong>{filteredOrders.length}</strong> pesanan
          </div>

          {totalPages > 1 && (
            <div className="flex items-center space-x-1">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Prev
              </button>

              {/* Generate Page Numbers */}
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => paginate(i + 1)}
                  className={`px-3 py-1 rounded border ${
                    currentPage === i + 1
                      ? "bg-[#44af7c] text-white border-[#44af7c]"
                      : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
