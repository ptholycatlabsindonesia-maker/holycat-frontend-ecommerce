"use client";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { showLogoutConfirm, showSwalAlert } from "../lib/swalHelper";

// Konstanta Warna
const COLOR_PRIMARY_GREEN_CLASS = "text-[#44af7c]";
const COLOR_TEXT_DARK_CLASS = "text-[#2b2b2b]";

export default function Header() {
  const [user, setUser] = useState(null);
  const [count, setCount] = useState(0);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // State untuk pencarian
  const [searchTerm, setSearchTerm] = useState("");

  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isSearchMobileOpen, setIsSearchMobileOpen] = useState(false);
  const [isCategoryMobileOpen, setIsCategoryMobileOpen] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Sinkronkan input dengan URL jika user refresh halaman
  useEffect(() => {
    const currentSearch = searchParams.get("search");
    if (currentSearch) {
      setSearchTerm(currentSearch);
    }
  }, [searchParams]);

  // Fungsi untuk melakukan pencarian
  const handleSearch = () => {
    if (searchTerm.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchTerm)}`);
      setIsSearchMobileOpen(false);
    } else {
      router.push("/products");
    }
  };

  // Handle Enter Key
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const fetchCount = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
        withCredentials: true,
      });
      const items = res.data?.items || [];
      setCount(items.reduce((s, i) => s + i.quantity, 0));
    } catch (err) {
      setCount(0);
    }
  };

  const checkAuth = useCallback(async () => {
    setIsLoadingAuth(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
        {
          withCredentials: true,
        },
      );
      setUser(res.data);
    } catch (err) {
      setUser(null);
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  const handleLogout = async () => {
    if (typeof window === "undefined") return;
    try {
      await axios.post(
        `${"process.env.NEXT_PUBLIC_API_URL"}/auth/logout`,
        {},
        { withCredentials: true },
      );
    } catch (err) {
      console.error("Logout failed", err);
    }
    setCount(0);
    setUser(null);
    setIsAccountOpen(false);
    try {
      sessionStorage.removeItem("dev_token");
      delete axios.defaults.headers.common["Authorization"];
    } catch (e) {}
    window.dispatchEvent(new Event("cartUpdated"));
    window.dispatchEvent(new Event("authChanged"));
    showSwalAlert("Berhasil Keluar", "Anda telah keluar.", "info");
    router.push("/");
  };

  const logout = () => {
    showLogoutConfirm(handleLogout);
  };

  const toggleAccountMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAccountOpen((s) => !s);
    setIsSearchMobileOpen(false);
    setIsCategoryMobileOpen(false);
  };

  const toggleMobileSearchBar = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSearchMobileOpen((s) => !s);
    setIsAccountOpen(false);
    setIsCategoryMobileOpen(false);
  };

  const toggleMobileCategoryMenu = () => {
    setIsCategoryMobileOpen((s) => !s);
    setIsAccountOpen(false);
    setIsSearchMobileOpen(false);
  };

  useEffect(() => {
    const clickOutsideHandler = (event) => {
      const headerElement = document.querySelector(".custom-navbar");
      if (headerElement && !headerElement.contains(event.target)) {
        setIsAccountOpen(false);
        setIsSearchMobileOpen(false);
        setIsCategoryMobileOpen(false);
      }
    };
    document.addEventListener("click", clickOutsideHandler);
    checkAuth();
    fetchCount();
    const authHandler = () => checkAuth();
    const cartHandler = () => fetchCount();
    window.addEventListener("authChanged", authHandler);
    window.addEventListener("cartUpdated", cartHandler);
    return () => {
      document.removeEventListener("click", clickOutsideHandler);
      window.removeEventListener("authChanged", authHandler);
      window.removeEventListener("cartUpdated", cartHandler);
    };
  }, [checkAuth]);

  const isAuth = !!user;
  const userName = user?.name || "User";
  const userEmail = user?.email || "user@holycat.com";

  return (
    <header className="custom-navbar fixed top-0 left-0 right-0 z-[1000] shadow-md bg-white">
      {/* MOBILE SEARCH BAR */}
      <div
        className={`mobile-search-bar absolute top-full left-0 right-0 p-3 bg-white z-[500] shadow-lg md:hidden ${
          isSearchMobileOpen ? "block" : "hidden"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full p-2 rounded-lg border-2 border-[#44af7c] text-lg font-bold bg-white text-[#2b2b2b] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#ffbf00]"
            placeholder="Cari produk..."
          />
          <button
            onClick={handleSearch}
            className="bg-[#44af7c] text-white px-4 rounded-lg"
          >
            <i className="fas fa-search"></i>
          </button>
        </div>
      </div>

      {/* NAVBAR DESKTOP */}
      <div
        className={`nav-top bg-white h-[70px] px-4 md:px-10 flex items-center justify-between relative`}
      >
        <div className="nav-group-left flex items-center gap-5">
          <Link
            href="/"
            className={`logo-flowbite flex items-center font-['Lilita_One'] text-[30px] md:text-[30px] ${COLOR_PRIMARY_GREEN_CLASS}`}
          >
            <img
              src="/images/logo.png"
              alt="Holycat Logo"
              className="h-[55px] w-auto mr-1"
            />
          </Link>

          {/* Search Bar Desktop */}
          <div className="search-container hidden lg:flex rounded-lg overflow-hidden w-[500px] border-2 border-[#44af7c] shadow-inner">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="search-input flex-grow p-[8px] border-none text-[18px] font-bold bg-white text-[#2b2b2b] placeholder-gray-400 focus:outline-none"
              placeholder="Cari vitamin, obat, atau aksesoris..."
            />
            <button
              onClick={handleSearch}
              className={`search-button bg-[#44af7c] text-white px-[15px] text-[20px] hover:text-[#ffbf00] cursor-pointer`}
            >
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>

        {/* Group Kanan */}
        <div className="nav-group-right flex items-center gap-7 text-[#2b2b2b]">
          <a
            href="#"
            className={`nav-icon-link search-icon-link lg:hidden text-2xl ${COLOR_PRIMARY_GREEN_CLASS}`}
            onClick={toggleMobileSearchBar}
          >
            <i className="fas fa-search text-2xl"></i>
          </a>

          <Link
            href="/cart"
            className={`nav-icon-link relative flex items-center text-[24px] font-bold ${COLOR_PRIMARY_GREEN_CLASS} hover:text-[#ffbf00]`}
          >
            <i className="fas fa-shopping-cart text-2xl"></i>
            <span className="hidden md:inline ml-2 text-[#2b2b2b]">
              Keranjang
            </span>
            {count > 0 && (
              <span
                className={`absolute top-[-5px] right-[-10px] bg-[#ef4444] text-white rounded-full px-[7px] text-[14px] font-['Lilita_One'] leading-none flex items-center justify-center`}
              >
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>

          {isLoadingAuth ? (
            <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
          ) : !isAuth ? (
            <div className="flex items-center gap-4 text-[24px] font-bold">
              <Link
                href="/login"
                className={`text-[#44af7c] hover:text-[#ffbf00] p-1 rounded transition-colors`}
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className={`text-[#44af7c] px-3 py-1 rounded-[30px] hover:text-[#ffbf00] transition-colors text-[24px] font-bold`}
              >
                Daftar
              </Link>
            </div>
          ) : (
            <div
              className="relative inline-block"
              onClick={(e) => e.stopPropagation()}
            >
              <a
                href="#"
                onClick={toggleAccountMenu}
                className={`nav-icon-link flex items-center text-[24px] font-bold cursor-pointer ${COLOR_PRIMARY_GREEN_CLASS}`}
              >
                <img
                  src="/next.svg"
                  alt="Avatar"
                  className="w-[30px] h-[30px] rounded-full mr-[5px] object-cover"
                />
                <span className="hidden md:inline font-bold text-[#2b2b2b]">
                  Akun Saya
                </span>
                <i className="fas fa-caret-down ml-1 text-sm text-[#2b2b2b]"></i>
              </a>

              {/* Dropdown Menu */}
              <div
                className={`absolute top-full right-0 mt-2 w-[280px] bg-white rounded-lg shadow-xl border border-gray-100 p-0 z-[100] ${
                  isAccountOpen ? "block" : "hidden"
                }`}
              >
                <div className="dropdown-header text-center p-[15px] border-b border-gray-200">
                  <h4 className="text-[26px] font-extrabold text-[#2B2B2B] m-0 leading-none">
                    Halo, {userName.split(" ")[0]}
                  </h4>
                  <p className="text-[18px] text-gray-500 m-0 leading-none">
                    {userEmail}
                  </p>
                </div>
                <ul className="list-none p-[10px] m-0 text-[20px] font-bold">
                  {/* --- MENU KHUSUS ADMIN --- */}
                  {user?.role === "ADMIN" && (
                    <>
                      <li className="px-2 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                        Admin Menu
                      </li>
                      <Link
                        href="/admin"
                        className="flex items-center p-2 text-[#2B2B2B] bg-yellow-50 hover:bg-yellow-100 rounded-md mb-2"
                      >
                        <i
                          className={`fas fa-chart-line ${COLOR_PRIMARY_GREEN_CLASS} mr-3 text-lg w-6 text-center`}
                        ></i>{" "}
                        Admin Dashboard
                      </Link>
                      <li>
                        <Link
                          href="/admin/products"
                          className="flex items-center p-2 text-[#2B2B2B] bg-yellow-50 hover:bg-yellow-100 rounded-md mb-1"
                        >
                          <i
                            className={`fas fa-box-open ${COLOR_PRIMARY_GREEN_CLASS} mr-3 text-lg w-6 text-center`}
                          ></i>{" "}
                          Kelola Produk
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/admin/orders"
                          className="flex items-center p-2 text-[#2B2B2B] bg-yellow-50 hover:bg-yellow-100 rounded-md mb-1"
                        >
                          <i
                            className={`fas fa-clipboard-list ${COLOR_PRIMARY_GREEN_CLASS} mr-3 text-lg w-6 text-center`}
                          ></i>{" "}
                          Kelola Pesanan
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/admin/reports"
                          className="flex items-center p-2 text-[#2B2B2B] bg-yellow-50 hover:bg-yellow-100 rounded-md mb-2"
                        >
                          <i
                            className={`fas fa-chart-line ${COLOR_PRIMARY_GREEN_CLASS} mr-3 text-lg w-6 text-center`}
                          ></i>{" "}
                          Laporan
                        </Link>
                      </li>
                      <li className="border-t border-gray-100 my-2"></li>
                    </>
                  )}
                  {/* ------------------------- */}

                  <li>
                    <Link
                      href="/profile"
                      className="flex items-center p-2 text-[#2B2B2B] hover:bg-gray-100 rounded-md"
                    >
                      <i
                        className={`fas fa-user-circle ${COLOR_PRIMARY_GREEN_CLASS} mr-3 text-lg w-6 text-center`}
                      ></i>{" "}
                      Akun Saya
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/orders"
                      className="flex items-center p-2 text-[#2B2B2B] hover:bg-gray-100 rounded-md"
                    >
                      <i
                        className={`fas fa-truck-moving ${COLOR_PRIMARY_GREEN_CLASS} mr-3 text-lg w-6 text-center`}
                      ></i>{" "}
                      Pesanan Saya
                    </Link>
                  </li>
                  <li className="border-t border-gray-200 mt-2 pt-2">
                    <button
                      onClick={logout}
                      className="w-full flex items-center p-2 text-red-500 hover:bg-red-50 rounded-md"
                    >
                      <i className="fas fa-sign-out-alt mr-3 text-lg w-6 text-center"></i>{" "}
                      Keluar
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Kategori (Statis untuk saat ini) */}
      <div
        className={`nav-bottom bg-[#f3f4f6] border-t border-[#e5e7eb] h-[50px] px-4 md:px-10 flex items-center justify-between relative`}
      >
        <div className="mobile-bottom-menu-wrapper flex w-full justify-between items-center md:hidden">
          <div
            className={`mobile-menu-text flex items-center text-[24px] font-bold cursor-pointer ${COLOR_TEXT_DARK_CLASS}`}
            onClick={toggleMobileCategoryMenu}
          >
            <i className="fas fa-bars mr-2 text-xl"></i>{" "}
            <span className="font-bold">Menu Kategori</span>
          </div>
        </div>

        {/* Desktop Category Links - PERBAIKAN LINK */}
        <div
          className={`nav-links-bottom hidden md:flex items-center gap-[25px] text-[24px] font-bold ${COLOR_TEXT_DARK_CLASS}`}
        >
          <Link href="/" className="hover:text-[#44af7c]">
            Beranda
          </Link>
          <Link href="/products" className="hover:text-[#44af7c]">
            Semua Produk
          </Link>
          <Link href="/products?category=Obat" className="hover:text-[#44af7c]">
            Obat
          </Link>
          <Link
            href="/products?category=Suplemen_dan_Vitamin"
            className="hover:text-[#44af7c]"
          >
            Suplemen & Vitamin
          </Link>
          <Link
            href="/products?category=Grooming"
            className="hover:text-[#44af7c]"
          >
            Grooming
          </Link>
          <Link
            href="/products?category=Produk_Lainnya"
            className="hover:text-[#44af7c]"
          >
            Lainnya
          </Link>
        </div>

        {/* KATEGORI MOBILE DROPDOWN - PERBAIKAN LINK */}
        <div
          id="mobile-category-menu"
          className={`mobile-category-list absolute top-full left-0 right-0 w-full bg-white shadow-xl z-50 ${
            isCategoryMobileOpen ? "block" : "hidden"
          } md:hidden`}
        >
          <ul className="list-none p-0 m-0 text-[24px] font-bold text-[#2b2b2b]">
            <li>
              <Link
                href="/"
                className="block p-3 hover:bg-gray-100 hover:text-[#44af7c]"
              >
                Beranda
              </Link>
            </li>
            <li>
              <Link
                href="/products"
                className="block p-3 hover:bg-gray-100 hover:text-[#44af7c]"
              >
                Semua Produk
              </Link>
            </li>
            <li>
              <Link
                href="/products?category=Obat"
                className="block p-3 hover:bg-gray-100 hover:text-[#44af7c]"
              >
                Obat
              </Link>
            </li>
            <li>
              <Link
                href="/products?category=Suplemen_dan_Vitamin"
                className="block p-3 hover:bg-gray-100 hover:text-[#44af7c]"
              >
                Suplemen & Vitamin
              </Link>
            </li>
            <li>
              <Link
                href="/products?category=Grooming"
                className="block p-3 hover:bg-gray-100 hover:text-[#44af7c]"
              >
                Grooming
              </Link>
            </li>
            <li>
              <Link
                href="/products?category=Produk_Lainnya"
                className="block p-3 hover:bg-gray-100 hover:text-[#44af7c]"
              >
                Lainnya
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
