"use client";
import axios from "axios";

// If a development fallback token was stored in sessionStorage, set the
// Authorization header for axios so pages (e.g. Cart) can use it when cookies
// are not available in the browser. This is a dev convenience only.
try {
  const devToken =
    typeof window !== "undefined" ? sessionStorage.getItem("dev_token") : null;
  if (devToken)
    axios.defaults.headers.common["Authorization"] = `Bearer ${devToken}`;
} catch (e) {}

export default axios;
