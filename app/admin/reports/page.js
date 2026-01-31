"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Header from "../../components/Header";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// --- PERBAIKAN IMPORT PDF ---
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Import sebagai variable
// ----------------------------

// Registrasi komponen Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminReportsPage() {
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState({ totalOrders: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(false);

  // State Filter (Default: 30 hari terakhir)
  const today = new Date().toISOString().split("T")[0];
  const lastMonth = new Date();
  lastMonth.setDate(lastMonth.getDate() - 30);
  const [filters, setFilters] = useState({
    startDate: lastMonth.toISOString().split("T")[0],
    endDate: today,
    status: "ALL",
  });

  // Helper Format Rupiah
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Fetch Data
  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        ${process.env.NEXT_PUBLIC_API_URL}/admin/reports/orders,
        {
          params: filters,
          withCredentials: true,
        }
      );
      setOrders(res.data.orders);
      setSummary(res.data.summary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []); // Fetch pertama kali load

  // Handle Filter Change
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // --- LOGIKA CHART ---
  const chartData = {
    labels: [],
    datasets: [
      {
        label: "Pendapatan (IDR)",
        data: [],
        backgroundColor: "rgba(68, 175, 124, 0.6)",
        borderColor: "rgba(68, 175, 124, 1)",
        borderWidth: 1,
      },
    ],
  };

  const groupedData = {};
  orders.forEach((order) => {
    if (
      order.status !== "Dibatalkan" &&
      order.status !== "Menunggu_Pembayaran"
    ) {
      const date = new Date(order.createdAt).toLocaleDateString("id-ID");
      if (!groupedData[date]) groupedData[date] = 0;
      groupedData[date] += order.total;
    }
  });

  chartData.labels = Object.keys(groupedData);
  chartData.datasets[0].data = Object.values(groupedData);

  // --- LOGIKA EXPORT CSV ---
  const downloadCSV = () => {
    if (orders.length === 0) return;

    const headers = [
      "Order ID",
      "Tanggal",
      "Pelanggan",
      "Total",
      "Status",
      "Kurir",
      "Resi",
    ];
    const rows = orders.map((order) => [
      order.id,
      new Date(order.createdAt).toLocaleDateString("id-ID"),
      `"${order.user.name}"`,
      order.total,
      order.status,
      order.courier || "-",
      order.trackingNumber || "-",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((e) => e.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `report_sales_${filters.startDate}_to_${filters.endDate}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- LOGIKA EXPORT PDF (PERBAIKAN) ---
  const downloadPDF = () => {
    if (orders.length === 0) return;

    const doc = new jsPDF();

    // 1. Judul & Header Laporan
    doc.setFontSize(18);
    doc.text("Laporan Penjualan Holycat", 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Periode: ${filters.startDate} s/d ${filters.endDate}`, 14, 30);
    doc.text(`Total Pesanan: ${summary.totalOrders}`, 14, 36);
    doc.text(`Total Pendapatan: ${formatRupiah(summary.totalRevenue)}`, 14, 42);

    // 2. Persiapan Data Tabel
    const tableColumn = [
      "ID",
      "Tanggal",
      "Pelanggan",
      "Status",
      "Kurir",
      "Total",
    ];
    const tableRows = [];

    orders.forEach((order) => {
      const orderData = [
        order.id,
        new Date(order.createdAt).toLocaleDateString("id-ID"),
        order.user.name,
        order.status,
        order.courier || "-",
        formatRupiah(order.total),
      ];
      tableRows.push(orderData);
    });

    // 3. Generate Tabel menggunakan AutoTable (Cara Eksplisit)
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 50, // Mulai setelah header teks
      theme: "grid",
      headStyles: { fillColor: [68, 175, 124] }, // Warna Hijau Holycat
      styles: { fontSize: 10 },
    });

    // 4. Simpan File
    doc.save(`Laporan_Holycat_${filters.startDate}.pdf`);
  };

  return (
    <>
      <Header />
      <div className="p-6 pt-[140px] max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-[#2b2b2b]">
          Laporan Penjualan
        </h1>

        {/* Filter Section */}
        <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">
              Dari Tanggal
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="border p-2 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">
              Sampai Tanggal
            </label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="border p-2 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">
              Status
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="border p-2 rounded text-sm"
            >
              <option value="ALL">Semua Status</option>
              <option value="Selesai">Selesai</option>
              <option value="Dikirim">Dikirim</option>
              <option value="Diproses">Diproses</option>
              <option value="Dibatalkan">Dibatalkan</option>
            </select>
          </div>
          <button
            onClick={fetchReport}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm h-10"
          >
            Terapkan Filter
          </button>

          {/* GROUP BUTTON EXPORT */}
          <div className="ml-auto flex gap-2">
            <button
              onClick={downloadCSV}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm h-10 flex items-center gap-2"
            >
              <i className="fas fa-file-csv"></i> Export CSV
            </button>

            {/* Tombol PDF Baru */}
            <button
              onClick={downloadPDF}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm h-10 flex items-center gap-2"
            >
              <i className="fas fa-file-pdf"></i> Export PDF
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
            <h3 className="text-gray-500 font-bold text-sm uppercase">
              Total Pesanan
            </h3>
            <p className="text-3xl font-bold text-gray-800">
              {summary.totalOrders}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
            <h3 className="text-gray-500 font-bold text-sm uppercase">
              Total Pendapatan (Valid)
            </h3>
            <p className="text-3xl font-bold text-gray-800">
              {formatRupiah(summary.totalRevenue)}
            </p>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-bold mb-4">Tren Pendapatan</h3>
          <div className="h-[300px]">
            {loading ? (
              <p>Loading chart...</p>
            ) : (
              <Bar data={chartData} options={{ maintainAspectRatio: false }} />
            )}
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="font-bold">Rincian Pesanan</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Tanggal</th>
                  <th className="px-6 py-3">Pelanggan</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">{order.id}</td>
                    <td className="px-6 py-3">
                      {new Date(order.createdAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-6 py-3">{order.user.name}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          order.status === "Selesai"
                            ? "bg-green-100 text-green-800"
                            : order.status === "Dibatalkan"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      {formatRupiah(order.total)}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      Tidak ada data untuk periode ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
