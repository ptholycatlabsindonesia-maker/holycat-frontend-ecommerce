"use client";
import axios from "axios";

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// If a development fallback token was stored in sessionStorage, set the
// Authorization header for axios so pages (e.g. Cart) can use it when cookies
// are not available in the browser. This is a dev convenience only.
try {
  const devToken =
    typeof window !== "undefined" ? sessionStorage.getItem("dev_token") : null;
  if (devToken)
    axiosClient.defaults.headers.common["Authorization"] = `Bearer ${devToken}`;
} catch (e) {}

export default axiosClient;
