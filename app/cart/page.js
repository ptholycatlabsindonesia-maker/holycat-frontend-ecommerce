"use client";
import { useEffect, useState, useMemo } from "react"; // Tambahkan useMemo
import axios from "axios";
import Link from "next/link";
import Header from "../components/Header";
import { showSwalAlert } from "../lib/swalHelper";
import { useRouter, useSearchParams } from "next/navigation"; // Tambahkan useSearchParams

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState({});
  const [inputQuantities, setInputQuantities] = useState({});
  const [selectedItems, setSelectedItems] = useState({}); // State baru untuk item terpilih

  const router = useRouter();
  const searchParams = useSearchParams(); // Untuk membaca query params nanti (jika diperlukan)

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await axios.get(${process.env.NEXT_PUBLIC_API_URL}/cart, {
        withCredentials: true,
      });
      setCart(res.data);
      const quantities = res.data.items.reduce((acc, item) => {
        acc[item.id] = item.quantity;
        return acc;
      }, {});
      setInputQuantities(quantities);
      // Inisialisasi semua item sebagai terpilih secara default
      const initialSelection = res.data.items.reduce((acc, item) => {
        acc[item.id] = true;
        return acc;
      }, {});
      setSelectedItems(initialSelection);
      setError(null);
    } catch (err) {
      console.error(err);
      const status = err?.response?.status;
      if (status === 401) {
        setError("Sesi kedaluwarsa atau Anda belum login.");
        showSwalAlert(
          "Sesi Kedaluwarsa",
          "Harap login untuk melihat keranjang Anda.",
          "warning"
        );
        router.push("/login?redirect=/cart"); // Tambahkan redirect param
        return;
      }
      setError(err?.response?.data?.error || "Failed to load cart");
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdate = async (id, qty) => {
    const newQty = parseInt(qty, 10);
    if (isNaN(newQty) || newQty < 1) {
      showSwalAlert(
        "Input tidak valid",
        "Kuantitas minimal adalah 1.",
        "error"
      );
      setInputQuantities((prev) => ({
        ...prev,
        [id]: cart.items.find((item) => item.id === id)?.quantity || 1, // Fallback ke 1 jika item tidak ditemukan
      }));
      return;
    }

    try {
      setUpdating((s) => ({ ...s, [id]: true }));
      await axios.put(
        `$\{process.env.NEXT_PUBLIC_API_URL}/cart/update/${id}`,
        { quantity: newQty },
        { withCredentials: true }
      );
      await fetchCart(); // Fetch ulang untuk data terbaru (termasuk subtotal)
      window.dispatchEvent(new Event("cartUpdated"));
      showSwalAlert(
        "Sukses",
        "Kuantitas keranjang berhasil diperbarui!",
        "success"
      );
    } catch (err) {
      console.error(err);
      const status = err?.response?.status;
      const msg = err?.response?.data?.error || "Gagal memperbarui kuantitas.";
      if (status === 401) router.push("/login?redirect=/cart");
      else showSwalAlert("Gagal", msg, "error");
    } finally {
      setUpdating((s) => ({ ...s, [id]: false })); // Setel kembali updating
    }
  };

  const handleRemove = async (id) => {
    // Konfirmasi sebelum menghapus
    const result = await Swal.fire({
      title: "Hapus Item?",
      text: "Anda yakin ingin menghapus item ini dari keranjang?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) {
      return; // Batalkan jika pengguna tidak konfirmasi
    }

    try {
      setUpdating((s) => ({ ...s, [id]: true }));
      await axios.delete(`$\{process.env.NEXT_PUBLIC_API_URL}/cart/remove/${id}`, {
        withCredentials: true,
      });
      // Hapus item dari state lokal agar UI update instan
      setCart((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.id !== id),
      }));
      setSelectedItems((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
      window.dispatchEvent(new Event("cartUpdated")); // Update header count
      showSwalAlert("Dihapus", "Item berhasil dihapus dari keranjang.", "info");
      // Fetch ulang di background untuk sinkronisasi total (opsional, tergantung kebutuhan)
      // fetchCart();
    } catch (err) {
      console.error(err);
      const status = err?.response?.status;
      const msg = err?.response?.data?.error || "Gagal menghapus item.";
      if (status === 401) router.push("/login?redirect=/cart");
      else showSwalAlert("Gagal", msg, "error");
    } finally {
      setUpdating((s) => ({ ...s, [id]: false }));
    }
  };

  const handleQuantityChange = (id, value) => {
    setInputQuantities((prev) => ({ ...prev, [id]: value }));
  };

  const handleBlur = (id) => {
    const originalQuantity = cart?.items.find(
      (item) => item.id === id
    )?.quantity;
    const newQuantity = inputQuantities[id];
    // Hanya update jika nilai berubah dan valid
    if (
      newQuantity !== originalQuantity &&
      !isNaN(parseInt(newQuantity, 10)) &&
      parseInt(newQuantity, 10) >= 1
    ) {
      handleUpdate(id, newQuantity);
    } else if (newQuantity !== originalQuantity) {
      // Reset jika input tidak valid saat blur
      showSwalAlert(
        "Input tidak valid",
        "Kuantitas minimal adalah 1.",
        "error"
      );
      setInputQuantities((prev) => ({ ...prev, [id]: originalQuantity }));
    }
  };

  // --- Handler Checkbox ---
  const handleSelectItem = (itemId) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleSelectAll = (event) => {
    const isChecked = event.target.checked;
    const newSelection = {};
    if (cart?.items) {
      cart.items.forEach((item) => {
        newSelection[item.id] = isChecked;
      });
    }
    setSelectedItems(newSelection);
  };

  // --- Kalkulasi Total & Cek Status Pilihan ---
  const { selectedTotal, isAllSelected, hasSelectedItems } = useMemo(() => {
    let total = 0;
    let allSelected = true;
    let anySelected = false;
    if (cart?.items) {
      cart.items.forEach((item) => {
        if (selectedItems[item.id]) {
          total +=
            (inputQuantities[item.id] || item.quantity) * item.product.price;
          anySelected = true;
        } else {
          allSelected = false;
        }
      });
    } else {
      allSelected = false; // Tidak ada item, tidak bisa 'all selected'
    }
    return {
      selectedTotal: total.toFixed(2),
      isAllSelected: allSelected && cart?.items?.length > 0, // Pastikan ada item
      hasSelectedItems: anySelected,
    };
  }, [cart, selectedItems, inputQuantities]);

  // --- Navigasi ke Checkout ---
  const proceedToCheckout = () => {
    const selectedIds = Object.entries(selectedItems)
      .filter(([, isSelected]) => isSelected)
      .map(([id]) => id);

    if (selectedIds.length === 0) {
      showSwalAlert(
        "Pilih Item",
        "Pilih setidaknya satu item untuk checkout.",
        "warning"
      );
      return;
    }

    // Kirim ID item terpilih via query parameter
    router.push(`/checkout?items=${selectedIds.join(",")}`);
  };

  // --- Render ---
  if (loading)
    return (
      <>
        {" "}
        <Header />{" "}
        <div className="p-6 pt-5 max-w-4xl mx-auto">Loading cart...</div>{" "}
      </>
    );
  if (error && !cart)
    return (
      <>
        {" "}
        <Header />{" "}
        <div className="p-6 pt-5 max-w-4xl mx-auto text-red-600">
          {" "}
          Error: {error}{" "}
        </div>{" "}
      </>
    );

  return (
    <>
      <Header />
      <div className="p-6 pt-[140px] max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Keranjang Belanja Anda</h2>
        {!cart || !cart.items || cart.items.length === 0 ? (
          <div className="bg-white p-8 rounded shadow text-center">
            <div className="text-xl font-semibold mb-2">
              Keranjang Anda kosong
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {" "}
              Mulai jelajahi produk kami dan tambahkan item.{" "}
            </p>
            <Link
              href="/"
              className="inline-block bg-indigo-600 text-white px-4 py-2 rounded"
            >
              {" "}
              Belanja Sekarang{" "}
            </Link>
          </div>
        ) : (
          <>
            {/* Header Keranjang dengan Pilih Semua */}
            <div className="bg-white p-4 rounded shadow mb-4 flex items-center">
              <input
                type="checkbox"
                id="select-all"
                checked={isAllSelected}
                onChange={handleSelectAll}
                className="mr-3 h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label
                htmlFor="select-all"
                className="font-semibold text-gray-700"
              >
                {" "}
                Pilih Semua Item ({cart.items.length}){" "}
              </label>
            </div>

            {/* Daftar Item Keranjang */}
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white p-4 rounded shadow flex flex-col md:flex-row items-center gap-4 transition-opacity duration-300 ${
                    updating[item.id] ? "opacity-50" : ""
                  }`}
                >
                  {/* Checkbox Item */}
                  <input
                    type="checkbox"
                    checked={!!selectedItems[item.id]}
                    onChange={() => handleSelectItem(item.id)}
                    className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded flex-shrink-0"
                  />
                  {/* Gambar Item */}
                  <div className="w-20 h-20 bg-gray-100 flex items-center justify-center rounded overflow-hidden flex-shrink-0">
                    <img
                      src={item.product.image || "/next.svg"}
                      alt={item.product.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  {/* Detail Item */}
                  <div className="flex-1 w-full md:w-auto">
                    <div className="font-semibold text-base md:text-lg">
                      {item.product.title}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatCurrency(item.product.price)}
                    </div>
                    <div className="text-xs text-gray-500 md:hidden mt-1">
                      {" "}
                      {/* Tampilkan subtotal di mobile */}
                      Subtotal:{" "}
                      {formatCurrency(
                        (inputQuantities[item.id] || item.quantity) *
                          item.product.price
                      )}
                    </div>
                  </div>
                  {/* Kontrol Kuantitas */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleUpdate(
                          item.id,
                          Math.max(
                            1,
                            (inputQuantities[item.id] || item.quantity) - 1
                          )
                        )
                      }
                      className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={
                        updating[item.id] ||
                        (inputQuantities[item.id] || item.quantity) <= 1
                      }
                    >
                      {" "}
                      -{" "}
                    </button>
                    <input
                      type="number"
                      value={inputQuantities[item.id] ?? ""} // Gunakan ?? '' untuk handle undefined/null
                      onChange={(e) =>
                        handleQuantityChange(item.id, e.target.value)
                      }
                      onBlur={() => handleBlur(item.id)}
                      className="w-12 text-center border rounded py-1"
                      disabled={updating[item.id]}
                      min="1" // Tambahkan atribut min
                    />
                    <button
                      onClick={() =>
                        handleUpdate(
                          item.id,
                          (inputQuantities[item.id] || item.quantity) + 1
                        )
                      }
                      className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={updating[item.id]}
                    >
                      {" "}
                      +{" "}
                    </button>
                  </div>
                  {/* Subtotal Item (Desktop) & Hapus */}
                  <div className="flex flex-col items-end w-full md:w-auto mt-2 md:mt-0">
                    <div className="text-sm font-semibold hidden md:block">
                      {" "}
                      {/* Sembunyikan di mobile */}
                      {formatCurrency(
                        (inputQuantities[item.id] || item.quantity) *
                          item.product.price
                      )}
                    </div>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-xs text-red-600 hover:underline mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={updating[item.id]}
                    >
                      {" "}
                      Remove{" "}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Keranjang: Total & Checkout */}
            <div className="bg-white p-4 rounded shadow mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-left sm:text-left">
                <div className="font-semibold">Total Terpilih:</div>
                <div className="text-xl font-bold text-indigo-600">
                  {formatCurrency(selectedTotal)}
                </div>
              </div>
              <button
                onClick={proceedToCheckout}
                disabled={!hasSelectedItems} // Disable jika tidak ada item terpilih
                className="w-full sm:w-auto bg-[#44af7c] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#ffbf00] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed to Checkout (
                {Object.values(selectedItems).filter(Boolean).length} item)
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

// Import Swal di akhir untuk mengatasi potensi masalah SSR (meskipun use client seharusnya cukup)
import Swal from "sweetalert2";
