/**
 * Security Utilities Module
 *
 * Provides security-focused utility functions for safe data handling and URL validation.
 * These utilities help prevent XSS attacks and ensure safe rendering of user-generated content.
 *
 * @module utils/security
 */

/**
 * Safely stringifies a value to JSON for use in HTML contexts (like script tags).
 * Escapes characters that could break out of the script tag or be misinterpreted.
 *
 * This function prevents XSS attacks by escaping potentially dangerous characters:
 * - < and > prevent script tag breaking
 * - & prevents HTML entity confusion
 * - ' prevents breaking out of single-quoted attributes
 * - \u2028 and \u2029 (line/paragraph separators) prevent breaking out of JavaScript strings
 *
 * @param {any} value - The value to stringify.
 * @param {function|array} [replacer] - A function that alters the behavior of the stringification process, or an array of String and Number objects that serve as a whitelist for selecting/filtering the properties of the value object to be included in the JSON string.
 * @param {string|number} [space] - A String or Number object that's used to insert white space into the output JSON string for readability purposes.
 * @returns {string} The escaped JSON string.
 *
 * @example
 * const data = { script: '<script>alert("xss")</script>' };
 * const safe = safeJSONStringify(data);
 * // Returns: {"script":"\\u003cscript\\u003ealert(\"xss\")\\u003c/script\\u003e"}
 */
export const safeJSONStringify = (value, replacer, space) => {
  let json;

  try {
    json = JSON.stringify(value, replacer, space);
  } catch {
    return 'null';
  }

  if (typeof json !== 'string') {
    return 'null';
  }

  return json.replace(/[<>&'\u2028\u2029]/g, char => {
    // Map each dangerous character to its Unicode escape sequence
    switch (char) {
      case '<':
        return '\\u003c';
      case '>':
        return '\\u003e';
      case '&':
        return '\\u0026';
      case "'":
        return '\\u0027';
      case '\u2028':
        return '\\u2028'; // Line separator
      case '\u2029':
        return '\\u2029'; // Paragraph separator
      default:
        return char;
    }
  });
};

/**
 * Validates a URL to ensure it uses a safe protocol (http, https, or mailto).
 * Decodes the URL first to prevent protocol bypassing via URL encoding.
 *
 * This function prevents javascript: protocol attacks and other dangerous URLs.
 * It decodes percent-encoded characters to catch attempts like "javascript%3Aalert(1)".
 * Only http://, https://, and mailto: protocols are allowed for security.
 *
 * @param {string} href - The URL to validate.
 * @returns {boolean} True if the URL is safe, false otherwise.
 *
 * @example
 * isSafeHref("https://example.com"); // true
 * isSafeHref("javascript:alert(1)"); // false
 * isSafeHref("javascript%3Aalert(1)"); // false (catches encoded attacks)
 * isSafeHref("mailto:hello@example.com"); // true
 */
export const isSafeHref = href => {
  if (!href || typeof href !== 'string') {
    return false;
  }

  // Iteratively decode URL to catch multiple layers of encoding
  // Limit iterations to prevent infinite loops on malformed input
  let normalizedHref = href.trim();
  let previousHref;
  let iterations = 0;
  const maxIterations = 10;

  while (iterations < maxIterations && normalizedHref !== previousHref) {
    previousHref = normalizedHref;
    try {
      normalizedHref = decodeURIComponent(normalizedHref);
    } catch {
      // If decoding fails, stop and use the current value
      break;
    }
    iterations++;
  }

  normalizedHref = normalizedHref.trim();

  // Allow relative URLs (starting with / or #) but strictly block protocol-relative (//)
  // to prevent potential open redirects or loading from arbitrary domains
  if (/^(\/|#)/.test(normalizedHref)) {
    if (normalizedHref.startsWith('//')) {
      return false;
    }
    return true;
  }

  // Only allow http, https, and mailto protocols (case-insensitive)
  // This regex checks for http://, https://, or mailto: protocols at the start of the string
  return /^(https?:\/\/|mailto:)/i.test(normalizedHref);
};

/**
 * Validates an image source URL to ensure it uses a safe protocol (http or https only).
 * Decodes the URL iteratively to prevent protocol bypassing via multiple layers of URL encoding.
 *
 * This is more restrictive than isSafeHref since images should not use mailto: protocol.
 * It prevents javascript: protocol attacks and other dangerous URLs in image sources.
 *
 * @param {string} src - The image source URL to validate.
 * @returns {boolean} True if the URL is safe for images, false otherwise.
 *
 * @example
 * isSafeImageSrc("https://example.com/image.png"); // true
 * isSafeImageSrc("http://example.com/image.png"); // true
 * isSafeImageSrc("javascript:alert(1)"); // false
 * isSafeImageSrc("mailto:hello@example.com"); // false (not valid for images)
 * isSafeImageSrc("javascript%253A"); // false (catches double-encoded attacks)
 */
export const isSafeImageSrc = src => {
  if (!src || typeof src !== 'string') {
    return false;
  }

  // Iteratively decode URL to catch multiple layers of encoding
  // Limit iterations to prevent infinite loops on malformed input
  let normalizedSrc = src.trim();
  let previousSrc;
  let iterations = 0;
  const maxIterations = 10;

  while (iterations < maxIterations && normalizedSrc !== previousSrc) {
    previousSrc = normalizedSrc;
    try {
      normalizedSrc = decodeURIComponent(normalizedSrc);
    } catch {
      // If decoding fails, stop and use the current value
      break;
    }
    iterations++;
  }

  normalizedSrc = normalizedSrc.trim();

  // Block protocol-relative URLs (//) which could be used to load resources from arbitrary domains
  if (normalizedSrc.startsWith('//')) {
    return false;
  }

  // Validate that the URL is well-formed using the URL constructor
  let url;
  try {
    // Use a dummy base to allow relative URLs (e.g., /images/photo.png) to be parsed successfully
    // Absolute URLs will ignore the base
    url = new URL(normalizedSrc, 'http://example.com');
  } catch {
    // URL constructor throws if the URL is malformed
    return false;
  }

  // Use the browser's URL parser to determine the protocol
  // This prevents regex bypass techniques and ensures accurate protocol detection
  return url.protocol === 'http:' || url.protocol === 'https:';
};

/**
 * Sanitizes user input to prevent injection attacks and ensure data integrity.
 * Removes control characters and normalizes Unicode.
 *
 * This function is useful for processing input before sending it to APIs or LLMs.
 * It performs:
 * 1. Unicode Normalization (NFKC) to handle compatibility characters
 * 2. Control character removal (keeping newline, tab, return)
 * 3. Trimming of whitespace
 *
 * @param {string} input - The raw input string.
 * @returns {string} The sanitized string.
 *
 * @example
 * sanitizeInput("  Hello\u0000World  "); // "HelloWorld"
 */
export const sanitizeInput = input => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Normalize Unicode using compatibility form (NFKC)
  let sanitized = input.normalize('NFKC');

  // Remove control characters (ASCII 0-31 and 127) except:
  // \x09 (TAB), \x0A (LF), \x0D (CR)
  // \x00-\x08 matches NULL through BACKSPACE
  // \x0B-\x0C matches VERTICAL TAB through FORM FEED
  // \x0E-\x1F matches SHIFT OUT through UNIT SEPARATOR
  // \x7F matches DELETE
  // Also remove certain Unicode control/formatting characters (zero-width and bidi controls)
  // \u200B-\u200F covers zero-width space/joiners and directional marks
  // \u202A-\u202E covers bidirectional formatting characters
  // eslint-disable-next-line no-control-regex
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F\u200B-\u200F\u202A-\u202E]/g, '');

  return sanitized.trim();
};

/**
 * Validates a chat message object structure and content.
 * Ensures a valid role, text type, and reasonable text length to guard against malformed or
 * extremely large messages (e.g., from localStorage tampering) that could impact performance.
 * This function does not sanitize content and does not, by itself, prevent XSS.
 *
 * @param {object} message - The message object to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidChatMessage = message => {
  if (!message || typeof message !== 'object') return false;

  // Validate role
  if (message.role !== 'user' && message.role !== 'model') return false;

  // Validate text content
  if (typeof message.text !== 'string') return false;

  // Check for unreasonable length (DoS prevention)
  // 30,000 chars is roughly 10-15 pages of text, generous for AI response but prevents massive payloads
  if (message.text.length > 30000) return false;

  return true;
};

/**
 * Redacts Personally Identifiable Information (PII) from the resume data.
 * This prevents sensitive information like email and phone numbers from being sent to external AI APIs.
 *
 * @param {object} data - The resume data object.
 * @returns {object} A copy of the data with PII redacted.
 *
 * @example
 * const data = { basics: { email: 'test@example.com' } };
 * const safe = redactPII(data);
 * // Returns: { basics: { email: '[REDACTED]' } }
 */
export const redactPII = data => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  // Shallow clone to avoid mutating original data
  const safeData = { ...data };

  // Clone basics separately if present so we can redact without mutating the original.
  // Note: Shallow clone is sufficient here because we only modify top-level properties
  // (email and phone) within basics, not nested objects.
  if (data.basics && typeof data.basics === 'object' && !Array.isArray(data.basics)) {
    safeData.basics = { ...data.basics };

    if (safeData.basics.email) {
      safeData.basics.email = '[REDACTED]';
    }
    if (safeData.basics.phone) {
      safeData.basics.phone = '[REDACTED]';
    }
  }

  return safeData;
};
