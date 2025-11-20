import type { AppProps } from "next/app";
import { useEffect } from "react";

import i18n from "@/lib/i18n";

import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    i18n;
  }, []);

  return <Component {...pageProps} />;
}
