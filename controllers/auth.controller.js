import User from "../models/User.js";
import AppError from "../utils/AppError.js";

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile from MongoDB.
 */
export const getCurrentUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select("-__v");

        if (!user) {
            return next(new AppError("User not found", 404));
        }

        res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                cart: user.cart,
                wishlist: user.wishlist,
                address: user.address,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/auth/create-or-update
 * Creates a new user or updates an existing one based on Firebase UID.
 * Called by the client after Firebase registration.
 */
export const createOrUpdateUser = async (req, res, next) => {
    try {
        const { name, role } = req.body;

        // req.user is set by authCheck middleware (auto-created if new)
        const user = req.user;

        // Update name if provided
        if (name && name.trim()) {
            user.name = name.trim();
        }

        // Update role if provided and valid
        const allowedRoles = ["user", "admin"];
        if (role && allowedRoles.includes(role)) {
            user.role = role;
        }

        await user.save();

        res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                cart: user.cart,
                wishlist: user.wishlist,
                address: user.address,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        });
    } catch (error) {
        next(error);
    }
};
