import AppError from "../utils/AppError.js";

/**
 * Role-based authorization middleware.
 * Usage: authorizeRoles("admin") or authorizeRoles("admin", "user")
 * Must be used AFTER authCheck middleware.
 */
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new AppError("Authentication required", 401));
        }

        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(
                    `Role '${req.user.role}' is not authorized to access this resource`,
                    403
                )
            );
        }

        next();
    };
};
