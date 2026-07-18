/**
 * Reusable Validation Utilities
 */

const Messages = {
  ar: {
    required: 'هذا الحقل مطلوب',
    email: 'البريد الإلكتروني غير صالح',
    passwordLength: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
    passwordChars: 'يجب أن تحتوي على أحرف',
    passwordNumbers: 'يجب أن تحتوي على أرقام',
    passwordMismatch: 'كلمات المرور غير متطابقة',
    phone: 'رقم هاتف غير صالح',
    usernameLength: 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل'
  },
  en: {
    required: 'This field is required',
    email: 'Invalid email address',
    passwordLength: 'Password must be at least 8 characters',
    passwordChars: 'Must contain letters',
    passwordNumbers: 'Must contain numbers',
    passwordMismatch: 'Passwords do not match',
    phone: 'Invalid phone number',
    usernameLength: 'Username must be at least 3 characters'
  }
};

// Global default language
let locale = 'ar';
export const setLocale = (l) => locale = l;

export const Validators = {
  required(value) {
    if (!value || String(value).trim() === '') {
      return Messages[locale].required;
    }
    return null;
  },

  email(value) {
    if (!value) return null; // let required() handle empty
    const regex = /^(([^<>()\\[\\]\\\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$/;
    if (!regex.test(String(value).toLowerCase())) {
      return Messages[locale].email;
    }
    return null;
  },

  passwordStrength(value) {
    if (!value) return null;
    if (value.length < 8) return Messages[locale].passwordLength;
    if (!/[A-Z]/.test(value) && !/[a-z]/.test(value)) return Messages[locale].passwordChars;
    if (!/[0-9]/.test(value)) return Messages[locale].passwordNumbers;
    return null;
  },

  confirmPassword(passwordValue, confirmValue) {
    if (!confirmValue) return null;
    if (passwordValue !== confirmValue) {
      return Messages[locale].passwordMismatch;
    }
    return null;
  },

  phone(value) {
    if (!value) return null;
    const regex = /^(00201|\+201|01)[0-2,5]{1}[0-9]{8}$/; // Egyptian numbers as baseline
    if (!regex.test(value)) {
      return Messages[locale].phone;
    }
    return null;
  },

  username(value) {
    if (!value) return null;
    if (value.length < 3) return Messages[locale].usernameLength;
    return null;
  }
};

/**
 * Validates a value against an array of validator functions (sync or async).
 * @param {any} value 
 * @param {Function[]} validators 
 * @returns {Promise<string|null>} Error message or null if valid
 */
export async function validate(value, validators = []) {
  for (const validator of validators) {
    const error = await validator(value);
    if (error) return error;
  }
  return null;
}
