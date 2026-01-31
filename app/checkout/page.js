"use client";
import { useEffect, useState, useMemo, Suspense } from "react"; // [FIX] Tambahkan import Suspense
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../components/Header";
import { showSwalAlert } from "../lib/swalHelper";
import Link from "next/link";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

// [FIX] Pindahkan logika utama ke sub-komponen
function CheckoutContent() {
  const [cart, setCart] = useState(null);
  const [user, setUser] = useState(null);
  const [loadingCart, setLoadingCart] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  // STATE BARU UNTUK ONGKIR
  const [selectedCourier, setSelectedCourier] = useState(""); // "jne" atau "jnt"
  const [shippingOptions, setShippingOptions] = useState([]); // Daftar paket ongkir dari API
  const [selectedShippingService, setSelectedShippingService] = useState(null); // Paket yang dipilih user
  const [loadingShipping, setLoadingShipping] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams(); // Aman digunakan di sini karena dibungkus Suspense di parent

  const selectedItemIds = useMemo(() => {
    const itemsParam = searchParams.get("items");
    return itemsParam
      ? itemsParam
          .split(",")
          .map((id) => parseInt(id, 10))
          .filter((id) => !isNaN(id))
      : [];
  }, [searchParams]);

  // Fetch Cart (TETAP SAMA)
  useEffect(() => {
    const fetchCart = async () => {
      setLoadingCart(true);
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
          withCredentials: true,
        });
        if (!res.data || res.data.items.length === 0) {
          showSwalAlert(
            "Keranjang Kosong",
            "Tidak ada item di keranjang.",
            "warning",
          );
          router.push("/cart");
          return;
        }
        setCart(res.data);
      } catch (err) {
        console.error("Fetch cart error:", err);
        if (err?.response?.status === 401) {
          router.push(
            "/login?redirect=/checkout" +
              (searchParams.get("items")
                ? `?items=${searchParams.get("items")}`
                : ""),
          );
        } else {
          setError("Gagal memuat data keranjang.");
        }
      } finally {
        setLoadingCart(false);
      }
    };
    fetchCart();
  }, [router, searchParams]);

  // Fetch User (TETAP SAMA)
  useEffect(() => {
    const fetchUser = async () => {
      setLoadingUser(true);
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
          {
            withCredentials: true,
          },
        );
        setUser(res.data);
      } catch (err) {
        console.error("Fetch user error:", err);
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, []);

  // FUNGSI BARU: Ambil Ongkir dari Backend
  useEffect(() => {
    if (selectedCourier && user?.city) {
      const fetchShippingCost = async () => {
        setLoadingShipping(true);
        setShippingOptions([]);
        setSelectedShippingService(null); // Reset pilihan saat ganti kurir
        try {
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/shipping/cost`,
            {
              courier: selectedCourier,
              city: user.city,
              // weight: 1000 // Bisa kirim berat total di sini jika sudah ada di DB
            },
          );
          setShippingOptions(res.data);
        } catch (err) {
          console.error("Shipping cost error:", err);
          showSwalAlert("Gagal", "Gagal memuat ongkos kirim.", "error");
        } finally {
          setLoadingShipping(false);
        }
      };
      fetchShippingCost();
    }
  }, [selectedCourier, user]);

  const { itemsToCheckout, subTotal } = useMemo(() => {
    if (!cart || !cart.items || selectedItemIds.length === 0) {
      return { itemsToCheckout: [], subTotal: 0 };
    }
    const filteredItems = cart.items.filter((item) =>
      selectedItemIds.includes(item.id),
    );

    if (filteredItems.length === 0 && cart.items.length > 0) {
      setError("Item yang dipilih tidak valid.");
      return { itemsToCheckout: [], subTotal: 0 };
    }

    const total = filteredItems.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0,
    );

    return { itemsToCheckout: filteredItems, subTotal: total };
  }, [cart, selectedItemIds]);

  // HITUNG GRAND TOTAL (Barang + Ongkir)
  const shippingCost = selectedShippingService
    ? selectedShippingService.cost
    : 0;
  const grandTotal = subTotal + shippingCost;

  const handlePlaceOrder = async () => {
    if (itemsToCheckout.length === 0) return;

    if (!user?.address || !user?.city) {
      showSwalAlert(
        "Alamat Belum Lengkap",
        "Harap lengkapi alamat & kota di profil Anda.",
        "warning",
      );
      return;
    }

    // Validasi Pengiriman
    if (!selectedShippingService) {
      showSwalAlert(
        "Pilih Pengiriman",
        "Harap pilih jasa pengiriman terlebih dahulu.",
        "warning",
      );
      return;
    }

    setPlacingOrder(true);
    setError(null);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/create`,
        {
          paymentMethod,
          cartItemIds: selectedItemIds,
          // KIRIM DATA ONGKIR KE BACKEND
          shippingCost: shippingCost,
          courierService: `${selectedCourier.toUpperCase()} - ${
            selectedShippingService.service
          }`,
        },
        { withCredentials: true },
      );

      window.dispatchEvent(new Event("cartUpdated"));
      router.push(`/order/${res.data.orderId}`);
    } catch (err) {
      console.error("Place order error:", err);
      const msg =
        err?.response?.data?.error || "Terjadi kesalahan saat membuat pesanan.";
      setError(msg);
      showSwalAlert("Gagal Membuat Pesanan", msg, "error");
    } finally {
      setPlacingOrder(false);
    }
  };

  const isLoading = loadingCart || loadingUser;

  if (isLoading)
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
      <div className="p-6 pt-[140px] max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-[#2b2b2b]">Checkout</h1>

        {cart && user && itemsToCheckout.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* --- KOLOM KIRI --- */}
            <div className="md:col-span-2 space-y-6">
              {/* ITEM LIST */}
              <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
                <h2 className="text-xl font-semibold mb-4 text-[#44af7c]">
                  Barang Belanjaan
                </h2>
                <ul className="space-y-4">
                  {itemsToCheckout.map((item) => (
                    <li
                      key={item.id}
                      className="flex justify-between items-center text-sm border-b pb-2 last:border-0"
                    >
                      <div>
                        <p className="font-bold text-gray-800">
                          {item.product.title}
                        </p>
                        <p className="text-gray-500">
                          {item.quantity} x {formatCurrency(item.product.price)}
                        </p>
                      </div>
                      <span className="font-medium text-gray-800">
                        {formatCurrency(item.quantity * item.product.price)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* PENGIRIMAN & PEMBAYARAN */}
              <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
                <h2 className="text-xl font-semibold mb-4 text-[#44af7c]">
                  Pengiriman & Pembayaran
                </h2>

                {/* PILIH KURIR */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Pilih Kurir
                  </label>
                  <select
                    className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#44af7c] outline-none transition"
                    value={selectedCourier}
                    onChange={(e) => setSelectedCourier(e.target.value)}
                  >
                    <option value="">-- Pilih Ekspedisi --</option>
                    <option value="jne">JNE Express</option>
                    <option value="jnt">J&T Express</option>
                  </select>
                </div>

                {/* PILIH LAYANAN (JIKA KURIR DIPILIH) */}
                {loadingShipping && (
                  <p className="text-sm text-gray-500">
                    Memuat ongkos kirim...
                  </p>
                )}

                {shippingOptions.length > 0 && (
                  <div className="mb-6 animate-fadeIn">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Pilih Layanan
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {shippingOptions.map((option, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedShippingService(option)}
                          className={`p-3 border rounded-lg cursor-pointer transition flex justify-between items-center
                            ${
                              selectedShippingService?.service ===
                              option.service
                                ? "border-[#44af7c] bg-[#e8f5ef] ring-1 ring-[#44af7c]"
                                : "border-gray-200 hover:border-[#44af7c]"
                            }`}
                        >
                          <div>
                            <p className="font-bold text-sm">
                              {option.service}
                            </p>
                            <p className="text-xs text-gray-500">
                              {option.description} ({option.etd})
                            </p>
                          </div>
                          <p className="font-bold text-[#44af7c]">
                            {formatCurrency(option.cost)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <hr className="my-6 border-gray-200" />

                {/* METODE PEMBAYARAN */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Metode Pembayaran
                  </label>
                  <div className="flex gap-4">
                    {/* <label
                      className={`flex-1 p-3 border rounded-lg cursor-pointer flex items-center justify-center gap-2 transition ${
                        paymentMethod === "COD"
                          ? "bg-[#fff8e1] border-[#ffbf00]"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="COD"
                        checked={paymentMethod === "COD"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <span className="font-medium">COD</span>
                    </label> */}
                    <label
                      className={`flex-1 p-3 border rounded-lg cursor-pointer flex items-center justify-center gap-2 transition ${
                        paymentMethod === "BANK_TRANSFER"
                          ? "bg-[#fff8e1] border-[#ffbf00]"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="BANK_TRANSFER"
                        checked={paymentMethod === "BANK_TRANSFER"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <span className="font-medium">Transfer</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* --- KOLOM KANAN (SUMMARY) --- */}
            <div className="md:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow border border-gray-100 sticky top-[150px]">
                <h2 className="text-xl font-semibold mb-4 text-[#44af7c]">
                  Rincian Biaya
                </h2>

                <div className="space-y-3 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Harga Barang</span>
                    <span className="font-medium">
                      {formatCurrency(subTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ongkos Kirim</span>
                    <span className="font-medium text-[#44af7c]">
                      {selectedShippingService
                        ? formatCurrency(shippingCost)
                        : "-"}
                    </span>
                  </div>
                </div>

                <hr className="border-dashed border-gray-300 my-4" />

                <div className="flex justify-between items-center mb-6">
                  <span className="font-bold text-lg text-gray-800">
                    Total Tagihan
                  </span>
                  <span className="font-extrabold text-2xl text-[#ffbf00]">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>

                <div className="mb-4">
                  <h3 className="font-bold text-sm mb-1 text-gray-700">
                    Dikirim ke:
                  </h3>
                  {user.address ? (
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      <p className="font-bold text-gray-800">{user.name}</p>
                      <p>{user.address}</p>
                      <p>{user.city}</p>
                      <p>{user.phone}</p>
                    </div>
                  ) : (
                    <p className="text-red-500 text-sm">Alamat belum diatur!</p>
                  )}
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={
                    placingOrder || !user.address || !selectedShippingService
                  }
                  className="w-full bg-[#44af7c] text-white font-bold py-4 rounded-full shadow-lg hover:bg-[#368f63] hover:shadow-xl transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {placingOrder
                    ? "Memproses..."
                    : `Bayar ${formatCurrency(grandTotal)}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// [FIX] Export Default menggunakan Suspense
export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="h-[70px] bg-white shadow-md fixed top-0 w-full z-50"></div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
