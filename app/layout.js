import EnvDebugger from "./components/EnvDebugger";

// [BARU] Impor 'Script' dari 'next/script'
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ToastProvider from "./components/ToastProvider";
import "./lib/axiosClient";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "HolyCat",
  description:
    "Pusat belanja makanan dan kebutuhan anabul terlengkap dan terpercaya.",
  icons: {
    icon: "/favicon.ico", // Pastikan file ini ada di folder app/ atau public/
    // Jika Anda punya logo PNG berkualitas tinggi di public/images:
    // icon: "/images/logo.png",
    // apple: "/images/logo.png", // Untuk icon di iPhone/iPad
  },
};

export default function RootLayout({ children }) {
  // [BARU] Ambil Client Key dari environment (jika perlu, atau hardcode untuk sandbox)
  // Anda harus membuat file .env.local di frontend dan menambahkannya
  // NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="SB-Mid-client-..."
  const midtransClientKey =
    process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ||
    "SB-Mid-client-xxxxxxxxxxxxxx"; // Ganti dengan Client Key Anda

  return (
    <html lang="en">
      {/* [BARU] Tambahkan Script Midtrans Snap */}
      <head>
        <Script
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={midtransClientKey}
          strategy="lazyOnload"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="pt-5">{children}</div>
        <ToastProvider />
        <EnvDebugger />
      </body>
    </html>
  );
}
