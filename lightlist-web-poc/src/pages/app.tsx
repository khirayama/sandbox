"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "@/lib/firebase";
import { appStore } from "@/lib/store";
import { AppState } from "@/lib/types";
import { signOut, deleteAccount } from "@/lib/mutations/auth";

export default function AppPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Check authentication and subscribe to store
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/");
      }
    });

    const unsubscribeStore = appStore.subscribe((newState) => {
      setState(newState);
    });

    // Set initial state
    setState(appStore.getState());

    return () => {
      unsubscribeAuth();
      unsubscribeStore();
    };
  }, [router]);

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

  if (!state || !state.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">{t("auth.error.noUserLoggedIn")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("title")}</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="mb-6 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600">{t("auth.form.email")}</p>
          <p className="text-lg font-medium text-gray-800">
            {state.user.email}
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setShowSignOutConfirm(true)}
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-medium py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "..." : t("auth.button.signOut")}
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={loading}
            className="w-full bg-red-600 text-white font-medium py-2 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "..." : t("auth.button.deleteAccount")}
          </button>
        </div>
      </div>

      {/* Sign Out Confirmation Dialog */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              {t("auth.signOutConfirm.title")}
            </h2>
            <p className="text-gray-600 mb-6">
              {t("auth.signOutConfirm.message")}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSignOutConfirm(false)}
                disabled={loading}
                className="flex-1 bg-gray-300 text-gray-800 font-medium py-2 rounded-lg hover:bg-gray-400 transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
              >
                {t("auth.button.cancel")}
              </button>
              <button
                onClick={() => {
                  setShowSignOutConfirm(false);
                  handleSignOut();
                }}
                disabled={loading}
                className="flex-1 bg-indigo-600 text-white font-medium py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {t("auth.button.signOut")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              {t("auth.deleteAccountConfirm.title")}
            </h2>
            <p className="text-gray-600 mb-6">
              {t("auth.deleteAccountConfirm.message")}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
                className="flex-1 bg-gray-300 text-gray-800 font-medium py-2 rounded-lg hover:bg-gray-400 transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
              >
                {t("auth.button.cancel")}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  handleDeleteAccount();
                }}
                disabled={loading}
                className="flex-1 bg-red-600 text-white font-medium py-2 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {t("auth.button.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
