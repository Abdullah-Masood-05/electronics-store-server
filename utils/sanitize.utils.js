/**
 * Escapes special regex characters to prevent ReDoS (Regular Expression Denial of Service).
 * Includes a length limit to prevent excessively long queries.
 */
export const escapeRegex = (str) => {
  if (typeof str !== "string") return "";
  if (str.length > 100) return str.substring(0, 100).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * Safely maps a frontend sort string to a secure MongoDB sort object.
 * Prevents __proto__ pollution and unexpected sorting behavior.
 */
const ALLOWED_SORT_CONFIGS = {
  "newest": { createdAt: -1 },
  "price-asc": { price: 1 },
  "price-desc": { price: -1 },
  "best-selling": { sold: -1 },
  "popular": { clickCount: -1 },
};

export const safeSortConfig = (sortParam) => {
  if (typeof sortParam !== "string") return ALLOWED_SORT_CONFIGS["newest"];
  // Use Object.prototype.hasOwnProperty to safely check without invoking prototype chain
  if (Object.prototype.hasOwnProperty.call(ALLOWED_SORT_CONFIGS, sortParam)) {
    return ALLOWED_SORT_CONFIGS[sortParam];
  }
  return ALLOWED_SORT_CONFIGS["newest"];
};

/**
 * Coerces and bounds integer inputs (e.g., pagination).
 */
export const safePositiveInt = (val, fallback = 1, max = 100) => {
  const n = parseInt(val, 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
};

/**
 * Coerces and bounds float inputs (e.g., price filters).
 */
export const safeFloat = (val, min = 0, max = 1000000, fallback = max) => {
  const n = parseFloat(val);
  return Number.isFinite(n) ? Math.min(Math.max(n, min), max) : fallback;
};
