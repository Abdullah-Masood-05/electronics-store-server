import User from "../models/User.js";
import Product from "../models/Product.js";
import AppError from "../utils/AppError.js";

/**
 * POST /api/wishlist/:productId
 * Adds product to user's wishlist (idempotent via $addToSet)
 */
export const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) return next(new AppError("Product not found", 404));

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { wishlist: productId },
    });

    res.status(200).json({ success: true, message: "Added to wishlist" });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/wishlist/:productId
 * Removes product from user's wishlist
 */
export const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { wishlist: productId },
    });

    res.status(200).json({ success: true, message: "Removed from wishlist" });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/wishlist
 * Returns current user's wishlist with populated product data
 */
export const getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "wishlist",
      "title slug price images brand category quantity"
    );

    res.status(200).json({
      success: true,
      wishlist: user.wishlist || [],
    });
  } catch (error) {
    next(error);
  }
};
