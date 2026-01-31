"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { showSwalAlert } from "../../lib/swalHelper"; // Gunakan SwalAlert untuk notifikasi

// Tambahkan props 'className' dan 'disabled'
export default function AddToCartButton({ productId, className, disabled }) {
  const router = useRouter();

  const add = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/cart/add`,
        { productId, quantity: 1 },
        { withCredentials: true }
      );

      // Memberi notifikasi global
      window.dispatchEvent(new Event("cartUpdated"));
      showSwalAlert(
        "Sukses",
        "Produk berhasil ditambahkan ke keranjang!",
        "success"
      );
    } catch (err) {
      console.error(err);
      const status = err?.response?.status;

      if (status === 401) {
        showSwalAlert(
          "Akses Ditolak",
          "Harap login untuk menambahkan item ke keranjang.",
          "error"
        );
        router.push("/login");
      } else {
        const msg =
          err?.response?.data?.error || "Gagal menambahkan ke keranjang.";
        showSwalAlert("Gagal", msg, "error");
      }
    }
  };

  return (
    <button onClick={add} className={className} disabled={disabled}>
      {/* Teks tombol yang dinamis */}
      {disabled ? "Stok Habis" : "Tambah ke Keranjang"}
    </button>
  );
}
