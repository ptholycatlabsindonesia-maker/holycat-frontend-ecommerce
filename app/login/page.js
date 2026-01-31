"use client";
import { useState, useRef, useEffect } from "react";
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

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const router = useRouter();

  // STATE: 'login' (input email/pass) atau 'verify' (input OTP)
  const [step, setStep] = useState("login");
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // State untuk OTP
  const [tempEmail, setTempEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const emailRef = useRef(null);

  useEffect(() => {
    if (step === "login") emailRef.current?.focus();
  }, [step]);

  // --- 1. HANDLER LOGIN ---
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setServerError(null);
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, data, {
        withCredentials: true,
      });

      // JIKA AKUN BELUM VERIFIKASI
      if (res.data.requireVerify) {
        setTempEmail(data.email); // Simpan email
        setStep("verify"); // Pindah ke form OTP
        showSwalAlert("Verifikasi Diperlukan", res.data.message, "info");
        return;
      }

      // JIKA LOGIN SUKSES LANGSUNG
      handleLoginSuccess(res);
    } catch (err) {
      console.error("Login error:", err);
      const msg = err?.response?.data?.error || "Gagal masuk.";
      setServerError(msg);
      showSwalAlert("Gagal Login", msg, "error");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. HANDLER VERIFIKASI OTP ---
  const onOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otpCode) return;

    try {
      setLoading(true);
      // Gunakan endpoint verify-register karena tujuannya mengaktifkan akun
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-register`,
        {
          email: tempEmail,
          otpCode: otpCode,
        },
        { withCredentials: true }
      );

      handleLoginSuccess(res);
    } catch (err) {
      const msg = err?.response?.data?.error || "Kode OTP Salah/Kadaluwarsa.";
      setServerError(msg);
      showSwalAlert("Gagal Verifikasi", msg, "error");
    } finally {
      setLoading(false);
    }
  };

  // Helper untuk menyimpan token & redirect
  const handleLoginSuccess = async (res) => {
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
      "Berhasil!",
      "Selamat datang kembali di Holycat!",
      "success"
    );
    router.push("/");
  };

  const emailRegister = register("email", {
    required: true,
    pattern: /^\S+@\S+$/i,
  });
  const passwordRegister = register("password", { required: true });

  return (
    <>
      <Header />
      <section
        className={`auth-section ${COLOR_LIGHT_GREEN_BG} flex min-h-screen items-center justify-center p-10 pt-[140px]`}
      >
        <div
          className={`max-w-md w-full bg-white p-10 rounded-xl shadow-2xl text-center border-t-8 border-[#44af7c]`}
        >
          <div className="auth-header mb-8">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${COLOR_PRIMARY_YELLOW_BG}`}
            >
              <i
                className={`fas ${
                  step === "verify" ? "fa-envelope-open-text" : "fa-sign-in-alt"
                } text-4xl ${COLOR_TEXT_DARK}`}
              ></i>
            </div>

            <h2
              className={`text-4xl sm:text-4xl font-extrabold ${COLOR_PRIMARY_GREEN} mb-2`}
            >
              {step === "verify" ? "Verifikasi Akun" : "Masuk ke Akun"}
            </h2>

            <p className={`text-xl ${COLOR_TEXT_DARK} opacity-80 m-0`}>
              {step === "verify"
                ? `Kode OTP baru dikirim ke ${tempEmail}`
                : "Selamat datang kembali!"}
            </p>
          </div>

          {/* --- TAMPILAN FORM LOGIN --- */}
          {step === "login" && (
            <form onSubmit={handleSubmit(onSubmit)} className="login-form">
              <div className="input-group text-left mb-5">
                <label
                  htmlFor="email"
                  className={`block text-xl font-bold ${COLOR_TEXT_DARK} mb-1 leading-none`}
                >
                  <i
                    className={`fas fa-envelope ${COLOR_PRIMARY_GREEN} mr-2 text-lg`}
                  ></i>
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="nama@email.com"
                  {...emailRegister}
                  ref={(e) => {
                    emailRegister.ref(e);
                    emailRef.current = e;
                  }}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg text-lg focus:border-[#ffbf00] outline-none"
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">
                    Email wajib diisi.
                  </p>
                )}
              </div>

              <div className="input-group text-left mb-5 relative">
                <label
                  htmlFor="password"
                  className={`block text-xl font-bold ${COLOR_TEXT_DARK} mb-1 leading-none`}
                >
                  <i
                    className={`fas fa-lock ${COLOR_PRIMARY_GREEN} mr-2 text-lg`}
                  ></i>
                  Kata Sandi
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Kata sandi Anda"
                  {...passwordRegister}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg text-lg pr-12 focus:border-[#ffbf00] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-[38px] text-sm text-gray-500 hover:text-[#44af7c]"
                >
                  <i
                    className={`fas ${
                      showPassword ? "fa-eye-slash" : "fa-eye"
                    }`}
                  ></i>
                </button>
                {errors.password && (
                  <p className="text-red-600 text-sm mt-1">
                    Kata sandi wajib diisi.
                  </p>
                )}
              </div>

              <div className="login-cta">
                <button
                  type="submit"
                  disabled={loading}
                  className={`auth-btn w-full ${COLOR_BTN_DEFAULT} font-extrabold py-3 px-5 rounded-full text-2xl cursor-pointer transition-all duration-300 mt-3 shadow-md hover:shadow-xl`}
                >
                  {loading ? "Memuat..." : "Masuk"}
                </button>
              </div>
            </form>
          )}

          {/* --- TAMPILAN FORM OTP (VERIFIKASI) --- */}
          {step === "verify" && (
            <form onSubmit={onOtpSubmit} className="otp-form">
              <div className="input-group text-left mb-5">
                <label
                  className={`block text-xl font-bold ${COLOR_TEXT_DARK} mb-2 text-center`}
                >
                  Masukkan 6 Digit Kode
                </label>
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
                <p className="text-sm text-center text-gray-500 mt-2">
                  Cek folder Inbox atau Spam email Anda.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full ${COLOR_BTN_DEFAULT} font-extrabold py-3 px-5 rounded-full text-2xl mt-3 shadow-md hover:shadow-xl`}
              >
                {loading ? "Memproses..." : "Verifikasi Sekarang"}
              </button>

              <button
                type="button"
                onClick={() => setStep("login")}
                className="mt-4 text-gray-500 underline hover:text-[#44af7c]"
              >
                Kembali ke Login
              </button>
            </form>
          )}

          {serverError && (
            <p className="text-red-600 text-lg mt-3">{serverError}</p>
          )}

          {step === "login" && (
            <div className="auth-footer mt-6">
              <p className="text-xl m-0">
                Belum punya akun?
                <Link
                  href="/register"
                  className="text-[#44af7c] font-bold ml-1 hover:text-[#ffbf00] hover:underline transition-colors duration-300"
                >
                  Daftar di sini
                </Link>
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
