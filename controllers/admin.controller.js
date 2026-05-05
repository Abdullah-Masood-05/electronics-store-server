import User from "../models/User.js";
import Category from "../models/Category.js";
import SubCategory from "../models/SubCategory.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

/**
 * GET /api/admin/stats
 * Returns counts for dashboard stats.
 */
export const getStats = async (req, res, next) => {
  try {
    const [users, categories, subcategories, products, totalOrders, pendingOrders, processingOrders, revenueResult] = await Promise.all([
      User.countDocuments({}),
      Category.countDocuments({}),
      SubCategory.countDocuments({}),
      Product.countDocuments({}),
      Order.countDocuments({}),
      Order.countDocuments({ orderStatus: "Not Processed" }),
      Order.countDocuments({ orderStatus: "Processing" }),
      Order.aggregate([
        { $match: { orderStatus: { $ne: "Cancelled" } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    res.status(200).json({
      success: true,
      stats: { users, categories, subcategories, products, totalOrders, pendingOrders, processingOrders, totalRevenue },
    });
  } catch (error) {
    next(error);
  }
};
