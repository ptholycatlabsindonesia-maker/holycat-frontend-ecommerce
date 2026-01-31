/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co", // Untuk gambar dummy (jika masih dipakai)
      },
      {
        protocol: "https",
        hostname: "images.tokopedia.net", // ✅ TAMBAHAN PENTING
      },
      // Tambahkan domain lain di sini jika nanti Anda mengambil gambar dari shopee, dll.
    ],
  },
};

export default nextConfig;
