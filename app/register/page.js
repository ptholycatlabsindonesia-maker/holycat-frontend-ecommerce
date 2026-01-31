"use client";
import { useState, useRef, useEffect, Suspense } from "react"; // [FIX] Tambahkan Suspense
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../components/Header";
import { showSwalAlert } from "../lib/swalHelper";

const COLOR_PRIMARY_GREEN = "text-[#44af7c]";
const COLOR_PRIMARY_YELLOW_BG = "bg-[#ffbf00]";
const COLOR_LIGHT_GREEN_BG = "bg-[#e8f5ef]";
const COLOR_TEXT_DARK = "text-[#2b2b2b]";
const COLOR_BTN_DEFAULT =
  "bg-[#44af7c] text-white hover:bg-[#ffbf00] hover:text-[#2b2b2b]";

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();
  const router = useRouter();

  // STATE: 'register' (form isi data) atau 'otp' (form verifikasi)
  const [step, setStep] = useState("register");
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  // Simpan email sementara untuk verifikasi OTP
  const [tempEmail, setTempEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const password = watch("password"); // Untuk validasi konfirmasi password

  // --- HANDLER STEP 1: REGISTER ---
  const onRegisterSubmit = async (data) => {
    try {
      setLoading(true);
      setServerError(null);

      // Kirim data registrasi ke backend
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          name: data.name,
          email: data.email,
          password: data.password,
          phone: data.phone,
          city: data.city,
          address: data.address,
        },
      );

      if (res.data.requireOtp) {
        setTempEmail(data.email);
        setStep("otp"); // Pindah ke tampilan OTP
        showSwalAlert("Registrasi Berhasil", res.data.message, "success");
      }
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.errors?.[0]?.msg ||
        "Gagal mendaftar.";
      setServerError(msg);
      showSwalAlert("Gagal", msg, "error");
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLER STEP 2: VERIFIKASI OTP ---
  const onOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otpCode) return;

    try {
      setLoading(true);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-register`,
        {
          email: tempEmail,
          otpCode: otpCode,
        },
        { withCredentials: true },
      );

      // Simpan token dev jika ada (sama seperti login)
      try {
        const devToken = res?.data?.token;
        if (devToken && typeof window !== "undefined") {
          sessionStorage.setItem("dev_token", devToken);
          axios.defaults.headers.common["Authorization"] = `Bearer ${devToken}`;
        }
      } catch (e) {}

      if (typeof window !== "undefined")
        window.dispatchEvent(new Event("authChanged"));

      await showSwalAlert(
        "Akun Terverifikasi!",
        "Selamat datang di Holycat!",
        "success",
      );
      router.push("/"); // Redirect ke home
    } catch (err) {
      const msg =
        err?.response?.data?.error || "Kode OTP salah atau kedaluwarsa.";
      setServerError(msg);
      showSwalAlert("Gagal Verifikasi", msg, "error");
    } finally {
      setLoading(false);
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

      <section
        className={`auth-section ${COLOR_LIGHT_GREEN_BG} flex min-h-screen items-center justify-center p-10 pt-[140px]`}
      >
        <div className="max-w-lg w-full bg-white p-10 rounded-xl shadow-2xl text-center border-t-8 border-[#44af7c]">
          <div className="auth-header mb-8">
            <h2
              className={`text-4xl font-extrabold ${COLOR_PRIMARY_GREEN} mb-2`}
            >
              {step === "otp" ? "Verifikasi Email" : "Daftar Akun"}
            </h2>
            <p className={`text-xl ${COLOR_TEXT_DARK} opacity-80 m-0`}>
              {step === "otp"
                ? `Masukkan kode yang dikirim ke ${tempEmail}`
                : "Bergabunglah dengan kami!"}
            </p>
          </div>

          {/* TAMPILAN FORM REGISTRASI */}
          {step === "register" && (
            <form
              onSubmit={handleSubmit(onRegisterSubmit)}
              className="register-form text-left"
            >
              {/* Nama Lengkap */}
              <div className="mb-4">
                <label className="block font-bold mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  {...register("name", { required: true })}
                  className="w-full p-3 border rounded-lg"
                  placeholder="Nama Anda"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">Nama wajib diisi.</p>
                )}
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className="block font-bold mb-1">Email</label>
                <input
                  type="email"
                  {...register("email", { required: true })}
                  className="w-full p-3 border rounded-lg"
                  placeholder="nama@email.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">Email wajib diisi.</p>
                )}
              </div>

              {/* Password */}
              <div className="mb-4 flex gap-4">
                <div className="w-1/2">
                  <label className="block font-bold mb-1">Kata Sandi</label>
                  <input
                    type="password"
                    {...register("password", { required: true, minLength: 6 })}
                    className="w-full p-3 border rounded-lg"
                    placeholder="******"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm">Min. 6 karakter.</p>
                  )}
                </div>
                <div className="w-1/2">
                  <label className="block font-bold mb-1">Konfirmasi</label>
                  <input
                    type="password"
                    {...register("confirmPassword", {
                      required: true,
                      validate: (val) =>
                        val === password || "Password tidak sama",
                    })}
                    className="w-full p-3 border rounded-lg"
                    placeholder="******"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Kontak Tambahan */}
              <div className="mb-4">
                <label className="block font-bold mb-1">No. WhatsApp</label>
                <input
                  type="text"
                  {...register("phone", { required: true })}
                  className="w-full p-3 border rounded-lg"
                  placeholder="08..."
                />
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-1">Kota Domisili</label>
                <input
                  type="text"
                  {...register("city")}
                  className="w-full p-3 border rounded-lg"
                  placeholder="Contoh: Bandung"
                />
              </div>

              <div className="mb-6">
                <label className="block font-bold mb-1">Alamat Lengkap</label>
                <textarea
                  {...register("address")}
                  className="w-full p-3 border rounded-lg"
                  placeholder="Alamat pengiriman..."
                  rows="2"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full ${COLOR_BTN_DEFAULT} font-extrabold py-3 rounded-full text-xl shadow-md`}
              >
                {loading ? "Memproses..." : "Daftar Sekarang"}
              </button>
            </form>
          )}

          {/* TAMPILAN FORM OTP */}
          {step === "otp" && (
            <form onSubmit={onOtpSubmit} className="otp-form">
              <div className="mb-6">
                <input
                  type="text"
                  maxLength="6"
                  value={otpCode}
                  onChange={(e) =>
                    setOtpCode(e.target.value.replace(/\D/g, ""))
                  }
                  className="w-full p-4 border-2 border-gray-300 rounded-lg text-center text-3xl tracking-[10px] font-bold focus:border-[#44af7c] outline-none"
                  placeholder="000000"
                  autoFocus
                />
                <p className="text-gray-500 text-sm mt-2">
                  Cek kotak masuk atau folder spam email Anda.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full ${COLOR_BTN_DEFAULT} font-extrabold py-3 rounded-full text-xl shadow-md`}
              >
                {loading ? "Verifikasi..." : "Konfirmasi Kode"}
              </button>

              <button
                type="button"
                onClick={() => setStep("register")}
                className="mt-4 text-gray-500 underline hover:text-[#44af7c]"
              >
                Ubah Email / Daftar Ulang
              </button>
            </form>
          )}

          {serverError && (
            <p className="text-red-600 text-lg mt-4">{serverError}</p>
          )}

          {step === "register" && (
            <div className="auth-footer mt-6">
              <p className="text-lg">
                Sudah punya akun?
                <Link
                  href="/login"
                  className="text-[#44af7c] font-bold ml-1 hover:text-[#ffbf00] hover:underline"
                >
                  Masuk di sini
                </Link>
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
