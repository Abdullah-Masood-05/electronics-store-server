/**
 * Centralized cookie configuration to ensure all cookies
 * set by the server strictly adhere to best-practice security constraints.
 */
export const cookieConfig = {
  httpOnly: true, // JS cannot read the cookie
  secure: process.env.NODE_ENV === "production", // HTTPS only in prod
  sameSite: "Strict", // Blocks cross-site sending entirely
  path: "/",
};
