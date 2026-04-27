import User from "../models/User.js";
import Product from "../models/Product.js";
import AppError from "../utils/AppError.js";

/**
 * POST /api/cart — save cart to user
 * Body: { cart: [{ product: productId, count: number }] }
 */
export const saveCart = async (req, res, next) => {
  try {
    const { cart } = req.body;
    if (!Array.isArray(cart)) {
      return next(new AppError("Cart must be an array", 400));
    }

    // Validate products exist and have enough stock
    const cartItems = [];
    for (const item of cart) {
      const product = await Product.findById(item.product);
      if (!product) {
        return next(new AppError(`Product ${item.product} not found`, 404));
      }
      if (item.count > product.quantity) {
        return next(
          new AppError(`Not enough stock for ${product.title}`, 400)
        );
      }
      cartItems.push({
        product: product._id,
        count: item.count,
        price: product.price,
        title: product.title,
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { cart: cartItems },
      { new: true }
    );

    res.status(200).json({ success: true, cart: user.cart });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/cart — get user's cart with populated product data
 */
export const getCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    // Populate product details for each cart item
    const populatedCart = [];
    for (const item of user.cart) {
      const product = await Product.findById(item.product)
        .select("title slug price images quantity")
        .lean();
      if (product) {
        populatedCart.push({
          product,
          count: item.count,
          price: item.price || product.price,
        });
      }
    }

    res.status(200).json({ success: true, cart: populatedCart });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/cart — empty user's cart
 */
export const emptyCart = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { cart: [] });
    res.status(200).json({ success: true, cart: [] });
  } catch (error) {
    next(error);
  }
};
