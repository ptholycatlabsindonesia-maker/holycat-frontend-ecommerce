import { Suspense } from "react";
import Header from "../components/Header";
import ProductsContent from "./ProductsContent";

// Disable static rendering untuk halaman ini
export const dynamic = "force-dynamic";

function HeaderLoader() {
  return (
    <div className="h-[120px] bg-white shadow-md fixed top-0 w-full z-50 animate-pulse"></div>
  );
}

// Main page component (Server Component)
export default function ProductsPage() {
  return (
    <>
      <Suspense fallback={<HeaderLoader />}>
        <Header />
      </Suspense>
      <ProductsContent />
    </>
  );
}
