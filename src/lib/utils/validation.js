// lib/utils/validation.js - Week 4

import { z } from 'zod';

// ==================== PROFILE VALIDATION ====================

export const profileSchema = z.object({
  firstName: z.string()
    .min(2, 'שם פרטי חייב להכיל לפחות 2 תווים')
    .max(50, 'שם פרטי יכול להכיל עד 50 תווים'),
  lastName: z.string()
    .min(2, 'שם משפחה חייב להכיל לפחות 2 תווים')
    .max(50, 'שם משפחה יכול להכיל עד 50 תווים'),
  phone: z.string()
    .regex(/^05\d{8}$/, 'מספר טלפון לא תקין (דוגמה: 0501234567)'),
  bio: z.string()
    .max(500, 'ביוגרפיה יכולה להכיל עד 500 תווים')
    .optional()
    .or(z.literal(''))
});

// ==================== PASSWORD VALIDATION ====================

export const passwordSchema = z.object({
  currentPassword: z.string()
    .min(6, 'סיסמה נוכחית חייבת להכיל לפחות 6 תווים'),
  newPassword: z.string()
    .min(6, 'סיסמה חדשה חייבת להכיל לפחות 6 תווים')
    .max(50, 'סיסמה יכולה להכיל עד 50 תווים'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'הסיסמאות אינן תואמות',
  path: ['confirmPassword']
});

// ==================== ADDRESS VALIDATION ====================

export const addressSchema = z.object({
  fullName: z.string()
    .min(2, 'שם מלא חייב להכיל לפחות 2 תווים')
    .max(100, 'שם מלא יכול להכיל עד 100 תווים'),
  phone: z.string()
    .regex(/^05\d{8}$/, 'מספר טלפון לא תקין (דוגמה: 0501234567)'),
  street: z.string()
    .min(3, 'רחוב חייב להכיל לפחות 3 תווים')
    .max(200, 'רחוב יכול להכיל עד 200 תווים'),
  apartment: z.string()
    .max(10, 'דירה יכולה להכיל עד 10 תווים')
    .optional()
    .or(z.literal('')),
  floor: z.string()
    .max(10, 'קומה יכולה להכיל עד 10 תווים')
    .optional()
    .or(z.literal('')),
  entrance: z.string()
    .max(10, 'כניסה יכולה להכיל עד 10 תווים')
    .optional()
    .or(z.literal('')),
  city: z.string()
    .min(2, 'עיר חייבת להכיל לפחות 2 תווים')
    .max(100, 'עיר יכולה להכיל עד 100 תווים'),
  zipCode: z.string()
    .regex(/^\d{7}$/, 'מיקוד חייב להיות בן 7 ספרות'),
  label: z.enum(['home', 'work', 'other'], {
    errorMap: () => ({ message: 'תווית לא תקינה' })
  }).optional().default('home'),
  isDefault: z.boolean().optional().default(false)
});

// ==================== DELETE ACCOUNT VALIDATION ====================

export const deleteAccountSchema = z.object({
  password: z.string()
    .min(6, 'נא להזין סיסמה לאישור'),
  confirmation: z.string()
}).refine((data) => data.confirmation === 'מחק את החשבון שלי', {
  message: 'נא להקליד בדיוק: "מחק את החשבון שלי"',
  path: ['confirmation']
});

// ==================== HELPER FUNCTIONS ====================

/**
 * Validate Israeli phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Is valid
 */
export const isValidPhone = (phone) => {
  return /^05\d{8}$/.test(phone);
};

/**
 * Validate Israeli ZIP code
 * @param {string} zipCode - ZIP code to validate
 * @returns {boolean} Is valid
 */
export const isValidZipCode = (zipCode) => {
  return /^\d{7}$/.test(zipCode);
};

/**
 * Validate email
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid
 */
export const isValidEmail = (email) => {
  return /^\S+@\S+\.\S+$/.test(email);
};

/**
 * Get error message from Zod error
 * @param {Object} error - Zod error object
 * @returns {string} Error message
 */
export const getErrorMessage = (error) => {
  if (!error) return '';
  
  if (error.message) return error.message;
  
  if (error.issues && error.issues.length > 0) {
    return error.issues[0].message;
  }
  
  return 'שגיאה בולידציה';
};