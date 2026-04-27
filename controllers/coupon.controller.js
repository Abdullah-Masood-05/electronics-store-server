import Coupon from "../models/Coupon.js";
import AppError from "../utils/AppError.js";

/**
 * POST /api/coupons — admin create coupon
 */
export const create = async (req, res, next) => {
  try {
    const coupon = await Coupon.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, coupon });
  } catch (error) {
    if (error.code === 11000) {
      return next(new AppError("Coupon code already exists", 400));
    }
    next(error);
  }
};

/**
 * GET /api/coupons — admin list all coupons
 */
export const list = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({})
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, coupons });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/coupons/:id — admin delete coupon
 */
export const remove = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return next(new AppError("Coupon not found", 404));
    res.status(200).json({ success: true, coupon });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/coupons/apply — user applies coupon
 * Body: { code }
 */
export const apply = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) return next(new AppError("Coupon code is required", 400));

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
    });

    if (!coupon) return next(new AppError("Invalid coupon code", 404));

    if (coupon.expiry < Date.now()) {
      return next(new AppError("This coupon has expired", 400));
    }

    res.status(200).json({
      success: true,
      discount: coupon.discount,
      couponId: coupon._id,
      code: coupon.code,
    });
  } catch (error) {
    next(error);
  }
};
