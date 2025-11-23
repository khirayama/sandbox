interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validateAuthForm = (
  data: {
    email: string;
    password: string;
    confirmPassword?: string;
    requirePasswordConfirm?: boolean;
  },
  t: (key: string) => string,
): FormErrors => {
  const errors: FormErrors = {};

  // Email validation
  if (!data.email.trim()) {
    errors.email = t("auth.validation.email.required");
  } else if (!validateEmail(data.email)) {
    errors.email = t("auth.validation.email.invalid");
  }

  // Password validation
  if (!data.password) {
    errors.password = t("auth.validation.password.required");
  } else if (data.requirePasswordConfirm && data.password.length < 6) {
    errors.password = t("auth.validation.password.tooShort");
  }

  // Confirm password validation
  if (data.requirePasswordConfirm) {
    if (!data.confirmPassword) {
      errors.confirmPassword = t("auth.validation.confirmPassword.required");
    } else if (data.password !== data.confirmPassword) {
      errors.confirmPassword = t("auth.validation.confirmPassword.notMatch");
    }
  }

  return errors;
};

export const validatePasswordForm = (
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
