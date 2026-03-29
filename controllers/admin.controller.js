import User from "../models/User.js";
import Category from "../models/Category.js";
import SubCategory from "../models/SubCategory.js";
import Product from "../models/Product.js";

/**
 * GET /api/admin/stats
 * Returns counts for dashboard stats.
 */
export const getStats = async (req, res, next) => {
  try {
    const [users, categories, subcategories, products] = await Promise.all([
      User.countDocuments({}),
      Category.countDocuments({}),
      SubCategory.countDocuments({}),
      Product.countDocuments({}),
    ]);

    res.status(200).json({
      success: true,
      stats: { users, categories, subcategories, products },
    });
  } catch (error) {
    next(error);
  }
};
