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
  return JSON.stringify(value, replacer, space).replace(
    /[<>&'\u2028\u2029]/g,
    (char) => {
      // Map each dangerous character to its Unicode escape sequence
      switch (char) {
        case '<': return '\\u003c';
        case '>': return '\\u003e';
        case '&': return '\\u0026';
        case "'": return '\\u0027';
        case '\u2028': return '\\u2028'; // Line separator
        case '\u2029': return '\\u2029'; // Paragraph separator
        default: return char;
      }
    }
  );
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
export const isSafeHref = (href) => {
  if (!href || typeof href !== 'string') {
    return false;
  }

  let normalizedHref;
  try {
    // Decode percent-encoded characters once to catch encoded protocols like javascript:
    normalizedHref = decodeURIComponent(href);
  } catch (e) {
    // If decoding fails (malformed URI), fall back to the original value
    normalizedHref = href;
  }

  // Only allow http, https, and mailto protocols (case-insensitive)
  // This regex checks for: optional whitespace, then http:// or https:// or mailto:
  return /^(https?:\/\/|mailto:)/i.test(normalizedHref);
};
