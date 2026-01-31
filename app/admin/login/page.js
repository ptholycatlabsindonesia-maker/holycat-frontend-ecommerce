"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link"; // [FIX] Import Link ditambahkan
import { showSwalAlert } from "../../lib/swalHelper";

export default function AdminLoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const router = useRouter();

  // State Flow: 'login' -> 'verify'
  const [step, setStep] = useState("login");
  const [loading, setLoading] = useState(false);

  // Data sementara untuk verifikasi
  const [tempEmail, setTempEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");

  // --- HANDLER 1: LOGIN ---
  const onLoginSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        data,
        {
          withCredentials: true,
        },
      );

      // KASUS 1: Butuh Verifikasi OTP
      if (res.data.requireVerify) {
        setTempEmail(data.email);
        setStep("verify");
        showSwalAlert("Verifikasi Diperlukan", res.data.message, "info");
        return;
      }

      // KASUS 2: Login Sukses Langsung
      const token = res.data.token; // Ambil token dari body
      await verifyAdminAccess(token);
    } catch (err) {
      const msg = err?.response?.data?.error || "Email atau password salah.";
      showSwalAlert("Gagal Login", msg, "error");
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLER 2: VERIFIKASI OTP ---
  const onOtpSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-otp`,
        {
          email: tempEmail,
          otpCode: otpCode,
        },
        { withCredentials: true },
      );

      // Verifikasi sukses, dapat token
      const token = res.data.token;
      showSwalAlert("Berhasil", "Akun terverifikasi!", "success");

      // Lanjut cek akses admin
      await verifyAdminAccess(token);
    } catch (err) {
      const msg = err?.response?.data?.error || "Kode OTP salah.";
      showSwalAlert("Gagal Verifikasi", msg, "error");
    } finally {
      setLoading(false);
    }
  };

  // --- FUNGSI BANTUAN: CEK ROLE ADMIN ---
  const verifyAdminAccess = async (token) => {
    try {
      // PENTING: Kirim token via Header 'Authorization' agar tidak "Unauthorized"
      const meRes = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (meRes.data.role !== "ADMIN") {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`);
        throw new Error("Akun ini bukan Admin.");
      }

      // Sukses!
      window.dispatchEvent(new Event("authChanged"));
      router.push("/admin");
    } catch (err) {
      const msg = err.message || "Gagal memverifikasi hak akses.";
      showSwalAlert("Akses Ditolak", msg, "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {step === "verify" ? "Verifikasi OTP" : "Admin Portal"}
          </h1>
          <p className="text-gray-400">
            {step === "verify"
              ? `Kode dikirim ke ${tempEmail}`
              : "Silakan masuk untuk mengelola toko."}
          </p>
        </div>

        {/* --- FORM LOGIN --- */}
        {step === "login" && (
          <form onSubmit={handleSubmit(onLoginSubmit)} className="space-y-6">
            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2">
                Email Admin
              </label>
              <input
                type="email"
                {...register("email", { required: true })}
                className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="admin@holycat.com"
              />
              {errors.email && (
                <span className="text-red-500 text-xs">Email wajib diisi.</span>
              )}
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2">
                Password
              </label>
              <input
                type="password"
                {...register("password", { required: true })}
                className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="••••••••"
              />
              {errors.password && (
                <span className="text-red-500 text-xs">
                  Password wajib diisi.
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition duration-200 disabled:opacity-50"
            >
              {loading ? "Memeriksa..." : "Masuk"}
            </button>
          </form>
        )}

        {/* --- FORM OTP --- */}
        {step === "verify" && (
          <form onSubmit={onOtpSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2 text-center">
                Masukkan 6 Digit Kode
              </label>
              <input
                type="text"
                maxLength="6"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                className="w-full p-4 rounded bg-gray-700 text-white text-center text-2xl tracking-widest border border-gray-600 focus:border-green-500 focus:outline-none"
                placeholder="000000"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded transition duration-200 disabled:opacity-50"
            >
              {loading ? "Verifikasi..." : "Konfirmasi Kode"}
            </button>

            <button
              type="button"
              onClick={() => setStep("login")}
              className="w-full text-gray-400 hover:text-white text-sm underline"
            >
              Kembali ke Login
            </button>
          </form>
        )}

        {step === "login" && (
          <div className="mt-6 text-center">
            {/* [FIX] Ganti <a> dengan <Link> */}
            <Link
              href="/"
              className="text-gray-500 hover:text-gray-300 text-sm"
            >
              Kembali ke Toko
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
