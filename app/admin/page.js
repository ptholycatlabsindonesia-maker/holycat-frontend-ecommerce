"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/stats`,
          {
            withCredentials: true,
          },
        );
        setStats(res.data);
      } catch (err) {
        // Jika gagal (misal 403 Forbidden), redirect ke login admin
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [router]);

  if (loading)
    return <div className="p-10 text-center">Loading Dashboard...</div>;
  if (!stats) return null;

  return (
    <>
      <Header />
      <div className="p-6 pt-[140px] max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#2b2b2b]">
            Dashboard Overview
          </h1>
          <div className="flex gap-4">
            <Link
              href="/admin/products"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              Kelola Produk
            </Link>
            <Link
              href="/admin/orders"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Kelola Pesanan
            </Link>
            {/* TOMBOL BARU */}
            <Link
              href="/admin/reports"
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
            >
              <i className="fas fa-chart-line mr-2"></i> Laporan
            </Link>
          </div>
        </div>

        {/* Kartu Statistik */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl shadow border-l-4 border-blue-500">
            <p className="text-gray-500 text-sm font-semibold uppercase">
              Total User
            </p>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {stats.totalUsers}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border-l-4 border-green-500">
            <p className="text-gray-500 text-sm font-semibold uppercase">
              Pendapatan
            </p>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
              }).format(stats.totalRevenue)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border-l-4 border-purple-500">
            <p className="text-gray-500 text-sm font-semibold uppercase">
              Total Pesanan
            </p>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {stats.totalOrders}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border-l-4 border-orange-500">
            <p className="text-gray-500 text-sm font-semibold uppercase">
              Total Produk
            </p>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {stats.totalProducts}
            </p>
          </div>
        </div>

        {/* Tabel Pesanan Terbaru */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h2 className="font-bold text-gray-700">Pesanan Terbaru</h2>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Pelanggan</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-blue-600">
                    <Link href={`/order/${order.id}`}>#{order.id}</Link>
                  </td>
                  <td className="px-6 py-4">{order.user.name}</td>
                  <td className="px-6 py-4">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(order.total)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold
                                    ${
                                      order.status === "Selesai"
                                        ? "bg-green-100 text-green-800"
                                        : order.status === "Menunggu_Pembayaran"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-gray-100 text-gray-800"
                                    }`}
                    >
                      {order.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-4 bg-gray-50 text-center border-t">
            <Link
              href="/admin/orders"
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              Lihat Semua Pesanan &rarr;
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
