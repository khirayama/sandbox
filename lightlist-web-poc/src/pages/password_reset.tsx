"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";

import {
  verifyPasswordResetCode,
  confirmPasswordReset,
} from "@/lib/mutations/auth";

interface FormErrors {
  password?: string;
  confirmPassword?: string;
  general?: string;
}

// ===== Components =====
interface FormInputProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled: boolean;
  placeholder: string;
}

const FormInput = ({
  id,
  label,
  type,
  value,
  onChange,
  error,
  disabled,
  placeholder,
}: FormInputProps) => (
  <div>
    <label
      htmlFor={id}
      className="block text-sm font-medium text-gray-700 mb-2"
    >
      {label}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 ${
        error ? "border-red-500" : "border-gray-300"
      }`}
      placeholder={placeholder}
    />
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
    <p className="text-sm text-red-700">{message}</p>
  </div>
);

const SuccessMessage = ({ message }: { message: string }) => (
  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
    <p className="text-sm text-green-700">{message}</p>
  </div>
);

// ===== Utility Functions =====
const getErrorMessage = (
  errorCode: string,
  t: (key: string) => string,
): string => {
  const errorKeyMap: { [key: string]: string } = {
    "auth/expired-action-code": "auth.passwordReset.expiredCode",
    "auth/invalid-action-code": "auth.passwordReset.invalidCode",
    "auth/weak-password": "auth.error.weakPassword",
    "auth/operation-not-allowed": "auth.error.operationNotAllowed",
    "auth/too-many-requests": "auth.error.tooManyRequests",
  };
  const key = errorKeyMap[errorCode] || "auth.error.general";
  return t(key);
};

const validatePasswordForm = (
  data: {
    password: string;
    confirmPassword: string;
  },
  t: (key: string) => string,
): FormErrors => {
  const errors: FormErrors = {};

  // Password validation
  if (!data.password) {
    errors.password = t("auth.validation.password.required");
  } else if (data.password.length < 6) {
    errors.password = t("auth.validation.password.tooShort");
  }

  // Confirm password validation
  if (!data.confirmPassword) {
    errors.confirmPassword = t("auth.validation.confirmPassword.required");
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = t("auth.validation.confirmPassword.notMatch");
  }

  return errors;
};

// ===== Main Component =====
export default function PasswordResetPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [codeValid, setCodeValid] = useState<boolean | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Verify password reset code
  useEffect(() => {
    if (!router.isReady) return;

    const { oobCode } = router.query;

    if (!oobCode || typeof oobCode !== "string") {
      setCodeValid(false);
      return;
    }

    const verifyCode = async () => {
      try {
        await verifyPasswordResetCode(oobCode);
        setCodeValid(true);
      } catch (err: any) {
        setErrors({ general: getErrorMessage(err.code, t) });
        setCodeValid(false);
      }
    };

    verifyCode();
  }, [router.isReady, router.query, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form
    const validationErrors = validatePasswordForm(
      { password, confirmPassword },
      t,
    );

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const { oobCode } = router.query;

      if (!oobCode || typeof oobCode !== "string") {
        throw new Error("Invalid reset code");
      }

      await confirmPasswordReset(oobCode, password);
      setResetSuccess(true);

      // Redirect to home after 2 seconds
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err: any) {
      const errorMessage = getErrorMessage(err.code, t);
      setErrors({ general: errorMessage });
      setLoading(false);
    }
  };

  if (!router.isReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (codeValid === false) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            {t("auth.passwordReset.title")}
          </h1>
          <ErrorMessage
            message={errors.general || t("auth.passwordReset.invalidCode")}
          />
          <button
            onClick={() => router.push("/")}
            className="mt-6 w-full bg-indigo-600 text-white font-medium py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {t("auth.button.backToSignIn")}
          </button>
        </div>
      </div>
    );
  }

  if (resetSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            {t("auth.passwordReset.title")}
          </h1>
          <SuccessMessage message={t("auth.passwordReset.resetSuccess")} />
          <p className="mt-4 text-sm text-gray-600 text-center">
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          {t("auth.passwordReset.title")}
        </h1>

        {errors.general && <ErrorMessage message={errors.general} />}

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <FormInput
            id="password"
            label={t("auth.passwordReset.newPassword")}
            type="password"
            value={password}
            onChange={setPassword}
            error={errors.password}
            disabled={loading}
            placeholder={t("auth.placeholder.password")}
          />

          <FormInput
            id="confirmPassword"
            label={t("auth.passwordReset.confirmNewPassword")}
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            error={errors.confirmPassword}
            disabled={loading}
            placeholder={t("auth.placeholder.password")}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-medium py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed mt-6"
          >
            {loading
              ? t("auth.passwordReset.settingNewPassword")
              : t("auth.passwordReset.setNewPassword")}
          </button>
        </form>

        <button
          onClick={() => router.push("/")}
          className="mt-4 w-full bg-gray-300 text-gray-800 font-medium py-2 rounded-lg hover:bg-gray-400 transition-colors"
        >
          {t("auth.button.backToSignIn")}
        </button>
      </div>
    </div>
  );
}
