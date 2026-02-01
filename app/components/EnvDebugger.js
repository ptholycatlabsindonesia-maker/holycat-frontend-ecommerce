"use client";

import { useEffect } from "react";

export default function EnvDebugger() {
  useEffect(() => {
    console.log(
      "DEBUG ENV FRONTEND =>",
      process.env.NEXT_PUBLIC_API_URL
    );
  }, []);

  return null;
}
