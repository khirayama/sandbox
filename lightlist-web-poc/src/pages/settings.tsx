"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "@/sdk/firebase";
import { appStore } from "@/sdk/store";
import { AppState, Theme, Language } from "@/sdk/types";
import { updateSettings } from "@/sdk/mutations/app";
import { signOut, deleteAccount } from "@/sdk/mutations/auth";
import { Spinner } from "@/components/Spinner";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export default function SettingsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/");
      }
    });

    const unsubscribeStore = appStore.subscribe((newState) => {
      setState(newState);
    });

    setState(appStore.getState());

    return () => {
      unsubscribeAuth();
      unsubscribeStore();
    };
  }, [router]);

  const handleThemeChange = async (theme: Theme) => {
    setError(null);
    try {
      await updateSettings({ theme });
    } catch (err: any) {
      setError(err.message || t("auth.error.general"));
    }
  };

  const handleLanguageChange = async (language: Language) => {
    setError(null);
    try {
      await updateSettings({ language });
      await i18next.changeLanguage(language);
    } catch (err: any) {
      setError(err.message || t("auth.error.general"));
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    setError(null);

    try {
      await signOut();
      router.push("/");
    } catch (err: any) {
      setError(err.message || t("auth.error.general"));
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    setError(null);

    try {
      await deleteAccount();
      router.push("/");
    } catch (err: any) {
      setError(err.message || t("auth.error.general"));
      setLoading(false);
    }
  };

  const isLoading = !state || !state.user || !state.settings;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!state || !state.user || !state.settings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            title="Back"
          >
            <svg
              className="w-5 h-5 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-800 flex-1 text-center">
            {t("settings.title")}
          </h1>
          <div className="w-10" />
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="mb-6 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600">
            {t("settings.userInfo.title")}
          </p>
          <p className="text-lg font-medium text-gray-800">
            {state.user.email}
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("settings.language.title")}
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="language"
                value="ja"
                checked={state.settings.language === "ja"}
                onChange={() => handleLanguageChange("ja")}
                className="w-4 h-4 text-indigo-600"
              />
              <span className="ml-2 text-gray-700">
                {t("settings.language.japanese")}
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="language"
                value="en"
                checked={state.settings.language === "en"}
                onChange={() => handleLanguageChange("en")}
                className="w-4 h-4 text-indigo-600"
              />
              <span className="ml-2 text-gray-700">
                {t("settings.language.english")}
              </span>
            </label>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("settings.theme.title")}
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="theme"
                value="system"
                checked={state.settings.theme === "system"}
                onChange={() => handleThemeChange("system")}
                className="w-4 h-4 text-indigo-600"
              />
              <span className="ml-2 text-gray-700">
                {t("settings.theme.system")}
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="theme"
                value="light"
                checked={state.settings.theme === "light"}
                onChange={() => handleThemeChange("light")}
                className="w-4 h-4 text-indigo-600"
              />
              <span className="ml-2 text-gray-700">
                {t("settings.theme.light")}
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="theme"
                value="dark"
                checked={state.settings.theme === "dark"}
                onChange={() => handleThemeChange("dark")}
                className="w-4 h-4 text-indigo-600"
              />
              <span className="ml-2 text-gray-700">
                {t("settings.theme.dark")}
              </span>
            </label>
          </div>
        </div>

        <div className="border-t pt-6 mt-6">
          <h2 className="text-sm font-bold text-gray-800 mb-3">
            {t("settings.danger.title")}
          </h2>
          <div className="space-y-3">
            <button
              onClick={() => setShowSignOutConfirm(true)}
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-medium py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {!loading && t("settings.danger.signOut")}
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={loading}
              className="w-full bg-red-600 text-white font-medium py-2 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {!loading && t("settings.danger.deleteAccount")}
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showSignOutConfirm}
        onClose={() => setShowSignOutConfirm(false)}
        onConfirm={() => {
          setShowSignOutConfirm(false);
          handleSignOut();
        }}
        title={t("auth.signOutConfirm.title")}
        message={t("auth.signOutConfirm.message")}
        confirmText={t("auth.button.signOut")}
        cancelText={t("auth.button.cancel")}
        disabled={loading}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          setShowDeleteConfirm(false);
          handleDeleteAccount();
        }}
        title={t("auth.deleteAccountConfirm.title")}
        message={t("auth.deleteAccountConfirm.message")}
        confirmText={t("auth.button.delete")}
        cancelText={t("auth.button.cancel")}
        isDestructive={true}
        disabled={loading}
      />
    </div>
  );
}
