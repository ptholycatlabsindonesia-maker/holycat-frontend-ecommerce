"use client";
import Swal from "sweetalert2";

/**
 * Menampilkan SweetAlert kustom untuk notifikasi.
 * @param {string} title Judul notifikasi.
 * @param {string} message Isi pesan notifikasi.
 * @param {'success' | 'error' | 'info' | 'warning'} icon Jenis ikon.
 */
export function showSwalAlert(title, message, icon) {
  const customConfig = {
    title: title,
    text: message,
    icon: icon,
    // Gaya kustom Holycatlabs
    confirmButtonText: "OK",
    confirmButtonColor:
      icon === "success" ? "#44af7c" : icon === "error" ? "#ef4444" : "#ffbf00",
    customClass: {
      container: "font-sans", // Gunakan font Next.js/Tailwind
    },
  };

  Swal.fire(customConfig);
}

// Fungsi khusus untuk Logout (agar ada konfirmasi)
export function showLogoutConfirm(onConfirm) {
  Swal.fire({
    title: "Yakin Ingin Keluar?",
    text: "Anda harus login kembali untuk melanjutkan belanja.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#44af7c",
    cancelButtonColor: "#374151",
    confirmButtonText: "Ya, Keluar!",
    cancelButtonText: "Batal",
  }).then((result) => {
    if (result.isConfirmed) {
      onConfirm();
    }
  });
}
