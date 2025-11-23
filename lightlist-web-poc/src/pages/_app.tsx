import type { AppProps } from "next/app";
import { useEffect, useRef, useState } from "react";

import i18n from "@/lib/i18n";
import { appStore } from "@/lib/store";

import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false);
  const prevLanguageRef = useRef<string | null>(null);

  useEffect(() => {
    const applyTheme = (theme: string) => {
      const isDark =
        theme === "dark" ||
        (theme === "system" &&
          typeof window !== "undefined" &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);

      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", isDark);
      }
    };

    const initialState = appStore.getState();
    if (initialState.settings) {
      applyTheme(initialState.settings.theme);
      prevLanguageRef.current = initialState.settings.language;
      i18n.changeLanguage(initialState.settings.language);
    }

    setMounted(true);

    const unsubscribe = appStore.subscribe((state) => {
      if (state.settings) {
        applyTheme(state.settings.theme);
        if (prevLanguageRef.current !== state.settings.language) {
          prevLanguageRef.current = state.settings.language;
          i18n.changeLanguage(state.settings.language);
        }
      }
    });

    // Listen for system theme changes when theme is set to "system"
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = () => {
      const state = appStore.getState();
      if (state.settings?.theme === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleMediaChange);

    return () => {
      unsubscribe();
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, []);

  if (!mounted) {
    return null;
  }

  return <Component {...pageProps} />;
}
