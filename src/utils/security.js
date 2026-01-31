/**
 * Safely stringifies a value to JSON for use in HTML contexts (like script tags).
 * Escapes characters that could break out of the script tag or be misinterpreted.
 *
 * @param {any} value - The value to stringify.
 * @param {function|array} [replacer] - A function that alters the behavior of the stringification process, or an array of String and Number objects that serve as a whitelist for selecting/filtering the properties of the value object to be included in the JSON string.
 * @param {string|number} [space] - A String or Number object that's used to insert white space into the output JSON string for readability purposes.
 * @returns {string} The escaped JSON string.
 */
export const safeJSONStringify = (value, replacer, space) => {
  return JSON.stringify(value, replacer, space).replace(
    /[<>&'\u2028\u2029]/g,
    (char) => {
      switch (char) {
        case '<': return '\\u003c';
        case '>': return '\\u003e';
        case '&': return '\\u0026';
        case "'": return '\\u0027';
        case '\u2028': return '\\u2028';
        case '\u2029': return '\\u2029';
        default: return char;
      }
    }
  );
};

/**
 * Validates a URL to ensure it uses a safe protocol (http, https, mailto).
 * Handles URL-encoded characters to prevent protocol bypasses (e.g., javascript:).
 *
 * @param {string} href - The URL to validate.
 * @returns {boolean} True if the URL is considered safe, false otherwise.
 */
export const isSafeHref = (href) => {
  if (!href || typeof href !== 'string') {
    return false;
  }

  let normalizedHref;
  try {
    // Decode percent-encoded characters once to catch encoded protocols like javascript:
    normalizedHref = decodeURIComponent(href);
  } catch {
    // If decoding fails, fall back to the original value
    normalizedHref = href;
  }

  // Only allow http, https, and mailto protocols
  return /^(https?:\/\/|mailto:)/i.test(normalizedHref);
};
