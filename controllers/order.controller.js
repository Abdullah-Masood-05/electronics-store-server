import Stripe from "stripe";
import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import AppError from "../utils/AppError.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Helper: build order products from user cart, decrement stock
 */
const processCart = async (userId) => {
  const user = await User.findById(userId);
  if (!user.cart || user.cart.length === 0) {
    throw new AppError("Cart is empty", 400);
  }

  const orderProducts = [];
  let totalAmount = 0;

  for (const item of user.cart) {
    const product = await Product.findById(item.product);
    if (!product) throw new AppError(`Product not found`, 404);
    if (product.quantity < item.count) {
      throw new AppError(`Not enough stock for ${product.title}`, 400);
    }

    orderProducts.push({
      product: product._id,
      count: item.count,
      price: product.price,
    });

    totalAmount += product.price * item.count;

    // Decrement stock, increment sold
    product.quantity -= item.count;
    product.sold += item.count;
    await product.save();
  }

  return { orderProducts, totalAmount };
};

/**
 * POST /api/orders/cod — Cash on Delivery order
 * Body: { address: { street, city, state, zip }, couponId? }
 */
export const createCodOrder = async (req, res, next) => {
  try {
    const { address, couponId } = req.body;
    if (!address?.street || !address?.city || !address?.state || !address?.zip) {
      return next(new AppError("Complete address is required", 400));
    }

    const { orderProducts, totalAmount } = await processCart(req.user._id);

    // Apply coupon discount
    let finalAmount = totalAmount;
    if (couponId) {
      const Coupon = (await import("../models/Coupon.js")).default;
      const coupon = await Coupon.findById(couponId);
      if (coupon && coupon.expiry > Date.now()) {
        finalAmount = totalAmount * (1 - coupon.discount / 100);
      }
    }

    const order = await Order.create({
      products: orderProducts,
      paymentMethod: "cod",
      paymentIntent: { amount: Math.round(finalAmount * 100), currency: "usd" },
      orderStatus: "Not Processed",
      coupon: couponId || undefined,
      orderedBy: req.user._id,
      address,
      totalAmount: finalAmount,
    });

    // Save address to user & clear cart
    await User.findByIdAndUpdate(req.user._id, {
      cart: [],
      address,
    });

    res.status(201).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/orders/stripe/intent — create Stripe PaymentIntent
 * Body: { couponId? }
 */
export const createStripeIntent = async (req, res, next) => {
  try {
    const { couponId } = req.body;
    const user = await User.findById(req.user._id);
    if (!user.cart || user.cart.length === 0) {
      return next(new AppError("Cart is empty", 400));
    }

    // Calculate total
    let totalAmount = 0;
    for (const item of user.cart) {
      const product = await Product.findById(item.product);
      if (product) totalAmount += product.price * item.count;
    }

    // Apply coupon
    if (couponId) {
      const Coupon = (await import("../models/Coupon.js")).default;
      const coupon = await Coupon.findById(couponId);
      if (coupon && coupon.expiry > Date.now()) {
        totalAmount = totalAmount * (1 - coupon.discount / 100);
      }
    }

    const amountInCents = Math.round(totalAmount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      metadata: { userId: req.user._id.toString() },
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      amount: totalAmount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/orders/stripe/confirm — confirm Stripe payment & create order
 * Body: { paymentIntentId, address, couponId? }
 */
export const confirmStripeOrder = async (req, res, next) => {
  try {
    const { paymentIntentId, address, couponId } = req.body;
    if (!paymentIntentId) {
      return next(new AppError("Payment intent ID is required", 400));
    }
    if (!address?.street || !address?.city || !address?.state || !address?.zip) {
      return next(new AppError("Complete address is required", 400));
    }

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== "succeeded") {
      return next(new AppError("Payment not completed", 400));
    }

    const { orderProducts, totalAmount } = await processCart(req.user._id);

    let finalAmount = totalAmount;
    if (couponId) {
      const Coupon = (await import("../models/Coupon.js")).default;
      const coupon = await Coupon.findById(couponId);
      if (coupon && coupon.expiry > Date.now()) {
        finalAmount = totalAmount * (1 - coupon.discount / 100);
      }
    }

    const order = await Order.create({
      products: orderProducts,
      paymentMethod: "stripe",
      paymentIntent: {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      },
      orderStatus: "Processing",
      coupon: couponId || undefined,
      orderedBy: req.user._id,
      address,
      totalAmount: finalAmount,
    });

    // Save address & clear cart
    await User.findByIdAndUpdate(req.user._id, {
      cart: [],
      address,
    });

    res.status(201).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/mine — user's orders
 */
export const getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ orderedBy: req.user._id })
      .populate("products.product", "title slug images price")
      .populate("coupon", "code discount")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/all — admin: all orders
 */
export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({})
      .populate("products.product", "title slug images price")
      .populate("orderedBy", "name email")
      .populate("coupon", "code discount")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/orders/:id/status — admin: update order status
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: status },
      { new: true, runValidators: true }
    )
      .populate("products.product", "title slug images price")
      .populate("orderedBy", "name email");
    if (!order) return next(new AppError("Order not found", 404));
    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};
