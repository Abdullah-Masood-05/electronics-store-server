/**
 * 404 Not Found Middleware
 * Catches all unmatched routes and returns a JSON response.
 */
export const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
};
