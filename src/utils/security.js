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
