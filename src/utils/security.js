/**
 * Safely stringifies JSON for use within HTML script tags.
 * Escapes dangerous characters to prevent XSS and JavaScript parsing issues:
 * - '<' and '>' to prevent script tag injection
 * - '&' to prevent HTML entity issues
 * - U+2028 and U+2029 (line/paragraph separators) to prevent JavaScript parsing errors
 *
 * @param {any} value - The value to stringify.
 * @param {function|array} [replacer] - A function that alters the behavior of the stringification process.
 * @param {string|number} [space] - A String or Number object that's used to insert white space into the output JSON string.
 * @returns {string} The stringified JSON with safely escaped characters.
 */
export const safeJSONStringify = (value, replacer, space) => {
  return JSON.stringify(value, replacer, space)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
};
