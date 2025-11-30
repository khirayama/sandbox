"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "@/sdk/firebase";
import { signIn, signUp, sendPasswordResetEmail } from "@/sdk/mutations/auth";
import { FormInput } from "@/components/FormInput";
import { getErrorMessage } from "@/utils/errors";
import { validateAuthForm } from "@/utils/validation";

type AuthTab = "signin" | "signup" | "reset";

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

// ===== Main Component =====
export default function IndexPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<AuthTab>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Check if user is already authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/app");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleAuthAction = async (
    e: React.FormEvent,
    action: () => Promise<void>,
    validationData: Parameters<typeof validateAuthForm>[0],
    setLoadingState: (loading: boolean) => void,
  ) => {
    e.preventDefault();

    const newErrors = validateAuthForm(validationData, t);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoadingState(true);
    setErrors({});

    try {
      await action();
    } catch (error: any) {
      const errorCode = error.code || "unknown-error";
      setErrors({ general: getErrorMessage(errorCode, t) });
    } finally {
      setLoadingState(false);
    }
  };

  const handleSignIn = (e: React.FormEvent) => {
    handleAuthAction(
      e,
      () => signIn(email, password),
      { email, password },
      setLoading,
    );
  };

  const handleSignUp = (e: React.FormEvent) => {
    handleAuthAction(
      e,
      () => signUp(email, password),
      { email, password, confirmPassword, requirePasswordConfirm: true },
      setLoading,
    );
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = validateAuthForm({ email, password: "" }, t);
    if (newErrors.email) {
      setErrors({ email: newErrors.email });
      return;
    }

    setResetLoading(true);
    setErrors({});

    try {
      await sendPasswordResetEmail(email);
      setResetSent(true);
    } catch (error: any) {
      const errorCode = error.code || "unknown-error";
      setErrors({ general: getErrorMessage(errorCode, t) });
    } finally {
      setResetLoading(false);
    }
  };

  const resetForm = () => {
    setPassword("");
    setConfirmPassword("");
    setErrors({});
    setResetSent(false);
  };

  const handleTabChange = (tab: AuthTab) => {
    setActiveTab(tab);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          {t("title")}
        </h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => handleTabChange("signin")}
            className={`flex-1 py-2 px-4 font-medium rounded-t-lg transition-colors ${
              activeTab === "signin"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {t("auth.tabs.signin")}
          </button>
          <button
            onClick={() => handleTabChange("signup")}
            className={`flex-1 py-2 px-4 font-medium rounded-t-lg transition-colors ${
              activeTab === "signup"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {t("auth.tabs.signup")}
          </button>
        </div>

        {/* Sign In Form */}
        {activeTab === "signin" && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <FormInput
              id="signin-email"
              label={t("auth.form.email")}
              type="email"
              value={email}
              onChange={setEmail}
              error={errors.email}
              disabled={loading}
              placeholder={t("auth.placeholder.email")}
            />
            <FormInput
              id="signin-password"
              label={t("auth.form.password")}
              type="password"
              value={password}
              onChange={setPassword}
              error={errors.password}
              disabled={loading}
              placeholder={t("auth.placeholder.password")}
            />
            {errors.general && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{errors.general}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-medium py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? t("auth.button.signingIn") : t("auth.button.signin")}
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("reset")}
              className="w-full text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium py-2"
            >
              {t("auth.button.forgotPassword")}
            </button>
          </form>
        )}

        {/* Sign Up Form */}
        {activeTab === "signup" && (
          <form onSubmit={handleSignUp} className="space-y-4">
            <FormInput
              id="signup-email"
              label={t("auth.form.email")}
              type="email"
              value={email}
              onChange={setEmail}
              error={errors.email}
              disabled={loading}
              placeholder={t("auth.placeholder.email")}
            />
            <FormInput
              id="signup-password"
              label={t("auth.form.password")}
              type="password"
              value={password}
              onChange={setPassword}
              error={errors.password}
              disabled={loading}
              placeholder={t("auth.placeholder.password")}
            />
            <FormInput
              id="signup-confirm"
              label={t("auth.form.confirmPassword")}
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              error={errors.confirmPassword}
              disabled={loading}
              placeholder={t("auth.placeholder.password")}
            />
            {errors.general && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{errors.general}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-medium py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? t("auth.button.signingUp") : t("auth.button.signup")}
            </button>
          </form>
        )}

        {/* Password Reset Form */}
        {activeTab === "reset" && (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            {resetSent ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  {t("auth.passwordReset.success")}
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  {t("auth.passwordReset.instruction")}
                </p>
                <FormInput
                  id="reset-email"
                  label={t("auth.form.email")}
                  type="email"
                  value={email}
                  onChange={setEmail}
                  error={errors.email}
                  disabled={resetLoading}
                  placeholder={t("auth.placeholder.email")}
                />
                {errors.general && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{errors.general}</p>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full bg-indigo-600 text-white font-medium py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {resetLoading
                    ? t("auth.button.sending")
                    : t("auth.button.sendResetEmail")}
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => handleTabChange("signin")}
              className="w-full text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium py-2"
            >
              {t("auth.button.backToSignIn")}
            </button>
          </form>
        )}

        <p className="text-xs text-gray-500 text-center mt-6">
          {t("copyright")}
        </p>
      </div>
    </div>
  );
}
