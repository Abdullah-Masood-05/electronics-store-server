/**
 * Convert a string to a URL-safe slug.
 * e.g. "Gaming Laptops" → "gaming-laptops"
 */
const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");

export default slugify;
