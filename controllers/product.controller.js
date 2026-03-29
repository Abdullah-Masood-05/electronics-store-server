import Product from "../models/Product.js";
import AppError from "../utils/AppError.js";
import slugify from "../utils/slugify.js";

/**
 * POST /api/products
 */
export const create = async (req, res, next) => {
  try {
    req.body.slug = slugify(req.body.title);
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/products?page=1&limit=10
 */
export const list = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find({})
        .populate("category", "name slug")
        .populate("subcategories", "name slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments({}),
    ]);

    res.status(200).json({
      success: true,
      products,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/products/:slug
 */
export const read = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate("category", "name slug")
      .populate("subcategories", "name slug");
    if (!product) return next(new AppError("Product not found", 404));
    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/products/:slug
 */
export const update = async (req, res, next) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const updated = await Product.findOneAndUpdate(
      { slug: req.params.slug },
      req.body,
      { new: true, runValidators: true }
    )
      .populate("category", "name slug")
      .populate("subcategories", "name slug");

    if (!updated) return next(new AppError("Product not found", 404));
    res.status(200).json({ success: true, product: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/products/:slug
 */
export const remove = async (req, res, next) => {
  try {
    const deleted = await Product.findOneAndDelete({ slug: req.params.slug });
    if (!deleted) return next(new AppError("Product not found", 404));
    res.status(200).json({ success: true, product: deleted });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/products/count
 */
export const totalCount = async (req, res, next) => {
  try {
    const count = await Product.countDocuments({});
    res.status(200).json({ success: true, count });
  } catch (error) {
    next(error);
  }
};
