/**
 * Safely stringifies JSON for use within HTML script tags.
 * Escapes '<' to '\u003c' to prevent XSS via script tag injection.
 *
 * @param {any} value - The value to stringify.
 * @param {function|array} [replacer] - A function that alters the behavior of the stringification process.
 * @param {string|number} [space] - A String or Number object that's used to insert white space into the output JSON string.
 * @returns {string} The stringified JSON with safely escaped characters.
 */
export const safeJSONStringify = (value, replacer, space) => {
  return JSON.stringify(value, replacer, space).replace(/</g, '\\u003c');
};
