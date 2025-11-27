import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import ja from "@/locales/ja.json";
import en from "@/locales/en.json";

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "ja",
    defaultNS: "translation",
    ns: ["translation"],
    resources: {
      ja: { translation: ja },
      en: { translation: en },
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18next;
