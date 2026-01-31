"use client";
import { useState, useEffect, useCallback, Suspense } from "react"; // [FIX] Tambahkan import Suspense
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import { showSwalAlert } from "../lib/swalHelper";

const DEFAULT_FORM_VALUES = {
  name: "",
  email: "",
  city: "",
  address: "",
  phone: "",
};

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: DEFAULT_FORM_VALUES });

  // --- Data Fetching (Fetch User saat Load) ---
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      // Menggunakan /auth/me untuk mendapatkan data user saat ini
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
        {
          withCredentials: true,
        },
      );
      const data = res.data;
      setUser(data);

      // Mengisi formulir dengan data yang ada
      setValue("name", data.name);
      setValue("email", data.email); // Email tidak bisa diubah, hanya ditampilkan
      setValue("city", data.city || "");
      setValue("address", data.address || "");
      setValue("phone", data.phone || "");
    } catch (err) {
      console.error("Fetch profile error:", err);
      showSwalAlert("Sesi Kedaluwarsa", "Harap login kembali.", "error");
      router.push("/login"); // Redirect jika gagal autentikasi
    } finally {
      setLoading(false);
    }
  }, [router, setValue]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // --- Form Submission (Update Profile) ---
  const onSubmit = async (data) => {
    try {
      // Hanya kirim field yang ingin diubah (kecuali email, yang tidak bisa diubah)
      const updatePayload = {
        name: data.name,
        city: data.city,
        address: data.address,
        phone: data.phone,
      };

      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/user/profile`,
        updatePayload,
        { withCredentials: true },
      );

      // Memperbarui state user lokal dan memicu event global
      setUser(res.data);
      window.dispatchEvent(new Event("authChanged"));

      showSwalAlert("Berhasil!", "Profil Anda telah diperbarui.", "success");
    } catch (err) {
      const msg = err?.response?.data?.error || "Gagal memperbarui profil.";
      showSwalAlert("Gagal", msg, "error");
      console.error("Update profile submission error:", err);
    }
  };

  if (loading) {
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
        <div className="p-6 pt-5 -w-lg mx-auto text-center">
          Loading Profile...
        </div>
      </>
    );
  }

  if (!user) {
    return null; // Akan di-redirect oleh fetchProfile
  }

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

      <div className="p-6 pt-[140px] max-w-lg mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-[#2b2b2b]">
          Edit Profil Anda
        </h1>
        <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-[#44af7c]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Field Nama */}
            <div className="input-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                {...register("name", { required: "Nama wajib diisi." })}
                className="w-full p-3 border rounded-lg focus:ring-[#ffbf00] focus:border-[#ffbf00] transition"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Field Email (Disabled) */}
            <div className="input-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email (Tidak Dapat Diubah)
              </label>
              <input
                type="email"
                {...register("email")}
                disabled
                className="w-full p-3 border rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>

            {/* Field Kota */}
            <div className="input-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kota
              </label>
              <input
                type="text"
                {...register("city")}
                placeholder="Contoh: Jakarta Selatan"
                className="w-full p-3 border rounded-lg focus:ring-[#ffbf00] focus:border-[#ffbf00] transition"
              />
            </div>

            {/* Field Alamat */}
            <div className="input-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alamat Lengkap
              </label>
              <textarea
                {...register("address")}
                placeholder="Jalan, RT/RW, Kecamatan..."
                rows="3"
                className="w-full p-3 border rounded-lg focus:ring-[#ffbf00] focus:border-[#ffbf00] transition"
              />
            </div>

            {/* Field No. Telepon */}
            <div className="input-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                No. Telepon
              </label>
              <input
                type="tel"
                {...register("phone")}
                placeholder="Contoh: 08123456789"
                className="w-full p-3 border rounded-lg focus:ring-[#ffbf00] focus:border-[#ffbf00] transition"
              />
            </div>

            {/* Tombol Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#44af7c] text-white font-semibold py-3 rounded-lg hover:bg-[#ffbf00] hover:text-[#2b2b2b] transition duration-200 disabled:opacity-60 mt-4"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
