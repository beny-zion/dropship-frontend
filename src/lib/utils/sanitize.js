/**
 * Input Sanitization Utilities
 *
 * ✅ XSS Protection without external dependencies
 */

/**
 * Sanitize HTML to prevent XSS attacks
 * Removes all HTML tags and dangerous characters
 */
export function sanitizeHTML(input) {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');

  // Escape dangerous characters
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  sanitized = sanitized.replace(/[&<>"'/]/g, (char) => map[char]);

  return sanitized;
}

/**
 * Sanitize user input for text fields
 * Removes dangerous characters but allows basic text
 */
export function sanitizeText(input) {
  if (typeof input !== 'string') {
    return '';
  }

  // Trim whitespace
  let sanitized = input.trim();

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

  // Limit length to prevent DoS
  const maxLength = 10000;
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Sanitize URL to prevent javascript: and data: URIs
 */
export function sanitizeURL(url) {
  if (typeof url !== 'string') {
    return '';
  }

  const trimmed = url.trim().toLowerCase();

  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];

  for (const protocol of dangerousProtocols) {
    if (trimmed.startsWith(protocol)) {
      console.warn(`Blocked dangerous URL protocol: ${protocol}`);
      return '';
    }
  }

  // Only allow http, https, mailto, tel
  const allowedProtocols = /^(https?:\/\/|mailto:|tel:)/i;

  if (trimmed.includes(':') && !allowedProtocols.test(trimmed)) {
    console.warn(`Blocked non-whitelisted URL protocol: ${url}`);
    return '';
  }

  return url.trim();
}

/**
 * Sanitize number input
 */
export function sanitizeNumber(input, options = {}) {
  const {
    min = -Infinity,
    max = Infinity,
    integer = false,
    defaultValue = 0
  } = options;

  // Convert to number
  let num = Number(input);

  // Check if valid number
  if (isNaN(num) || !isFinite(num)) {
    return defaultValue;
  }

  // Force integer if needed
  if (integer) {
    num = Math.floor(num);
  }

  // Clamp to min/max
  num = Math.max(min, Math.min(max, num));

  return num;
}

/**
 * Sanitize email
 */
export function sanitizeEmail(email) {
  if (typeof email !== 'string') {
    return '';
  }

  // Basic email validation and sanitization
  const trimmed = email.trim().toLowerCase();

  // Simple email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmed)) {
    return '';
  }

  // Remove any HTML encoding
  return sanitizeHTML(trimmed);
}

/**
 * Sanitize phone number
 */
export function sanitizePhone(phone) {
  if (typeof phone !== 'string') {
    return '';
  }

  // Remove everything except digits, +, -, (, ), and spaces
  return phone.replace(/[^\d+\-() ]/g, '').trim();
}

/**
 * Sanitize object recursively
 * Useful for sanitizing form data
 */
export function sanitizeObject(obj, options = {}) {
  const {
    allowHTML = false,
    maxDepth = 10,
    currentDepth = 0
  } = options;

  // Prevent infinite recursion
  if (currentDepth >= maxDepth) {
    console.warn('Max depth reached in sanitizeObject');
    return obj;
  }

  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item =>
      sanitizeObject(item, { ...options, currentDepth: currentDepth + 1 })
    );
  }

  if (typeof obj === 'object') {
    const sanitized = {};

    for (const [key, value] of Object.entries(obj)) {
      // ✅ SECURITY: Prevent Prototype Pollution
      if (['__proto__', 'constructor', 'prototype'].includes(key)) {
        console.warn(`⚠️ Blocked dangerous key during sanitization: ${key}`);
        continue; // Skip dangerous keys
      }

      // Sanitize key
      const sanitizedKey = sanitizeText(key);

      if (typeof value === 'string') {
        sanitized[sanitizedKey] = allowHTML ? value : sanitizeText(value);
      } else if (typeof value === 'number') {
        sanitized[sanitizedKey] = sanitizeNumber(value);
      } else if (typeof value === 'object') {
        sanitized[sanitizedKey] = sanitizeObject(
          value,
          { ...options, currentDepth: currentDepth + 1 }
        );
      } else {
        sanitized[sanitizedKey] = value;
      }
    }

    return sanitized;
  }

  if (typeof obj === 'string') {
    return allowHTML ? obj : sanitizeText(obj);
  }

  return obj;
}

/**
 * React hook for sanitized input
 */
export function useSanitizedInput(initialValue = '', sanitizeFn = sanitizeText) {
  const [value, setValue] = React.useState(initialValue);

  const handleChange = (e) => {
    const rawValue = e.target?.value || e;
    const sanitized = sanitizeFn(rawValue);
    setValue(sanitized);
  };

  return [value, handleChange, setValue];
}

/**
 * Validate and sanitize file upload
 */
export function sanitizeFile(file, options = {}) {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  } = options;

  if (!file || !(file instanceof File)) {
    return { valid: false, error: 'Invalid file' };
  }

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${maxSize / 1024 / 1024}MB`
    };
  }

  // Check MIME type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`
    };
  }

  // Check file extension
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `Invalid file extension. Allowed: ${allowedExtensions.join(', ')}`
    };
  }

  // Sanitize filename
  const sanitizedName = sanitizeText(file.name.replace(/[^a-zA-Z0-9._-]/g, '_'));

  return {
    valid: true,
    file,
    sanitizedName
  };
}

export default {
  sanitizeHTML,
  sanitizeText,
  sanitizeURL,
  sanitizeNumber,
  sanitizeEmail,
  sanitizePhone,
  sanitizeObject,
  sanitizeFile
};
