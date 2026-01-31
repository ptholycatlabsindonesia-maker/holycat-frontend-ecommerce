import Header from "../../components/Header";
// Import komponen detail baru
import ProductDetails from "./ProductDetails";

async function getProduct(id) {
  try {
    // ID produk adalah Int, jadi kita parse dulu untuk backend Express.js
    const numericId = parseInt(id);
    if (isNaN(numericId)) return null;

    const res = await fetch(`$\{process.env.NEXT_PUBLIC_API_URL}/products/${numericId}`);
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    console.error("getProduct error", err);
    return null;
  }
}

export default async function ProductPage({ params }) {
  const product = await getProduct(params.id);

  if (!product) {
    return (
      <>
        <Header />
        <div className="p-6 pt-5 max-w-2xl mx-auto text-center">
          <h1 className="text-3xl mb-4 font-bold text-red-600">
            Produk Tidak Ditemukan
          </h1>
          <p className="text-lg text-gray-700">
            Produk dengan ID {params.id} tidak tersedia atau server backend
            sedang bermasalah.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-block text-[#44af7c] hover:underline"
          >
            &larr; Kembali ke Daftar Produk
          </Link>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6]">
      {" "}
      {/* Menggunakan warna background NAV_LIGHT_BG */}
      <Header />
      {/* Menggunakan komponen baru untuk render detail */}
      <ProductDetails product={product} />
    </div>
  );
}
