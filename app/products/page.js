import Link from "next/link";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";

// Fungsi getProducts menerima search DAN category
async function getProducts(search, category) {
  try {
    // Bangun URL dengan Query Params
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (category) params.append("category", category);

    const url = `${process.env.NEXT_PUBLIC_API_URL}/products?${params.toString()}`;

    // Gunakan no-store agar data selalu fresh
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) throw new Error("Failed to fetch products");

    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Received non-JSON response from server");
    }

    return res.json();
  } catch (err) {
    console.error("Error fetching products:", err);
    return [];
  }
}

// Next.js 15: searchParams adalah Promise
export default async function ProductsPage(props) {
  const searchParams = await props.searchParams; // Tunggu params
  const search = searchParams?.search || "";
  const category = searchParams?.category || "";

  const products = await getProducts(search, category);

  // Helper untuk menampilkan judul halaman yang dinamis
  const getPageTitle = () => {
    if (search) return `Hasil Pencarian: "${search}"`;
    if (category) return `Kategori: ${category.replace(/_/g, " ")}`; // Ganti underscore dengan spasi
    return "Semua Produk";
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <div className="p-6 pt-[140px] max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold capitalize">{getPageTitle()}</h1>
          <span className="text-gray-600 font-medium">
            {products.length} Produk ditemukan
          </span>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow">
            <p className="text-xl text-gray-500">
              Tidak ada produk ditemukan
              {category ? ` di kategori "${category.replace(/_/g, " ")}"` : ""}
              {search ? ` dengan kata kunci "${search}"` : ""}.
            </p>
            <Link
              href="/products"
              className="text-[#44af7c] hover:underline mt-4 inline-block"
            >
              Lihat Semua Produk
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
