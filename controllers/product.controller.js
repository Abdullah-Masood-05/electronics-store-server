import Product from "../models/Product.js";
import Category from "../models/Category.js";
import SubCategory from "../models/SubCategory.js";
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
 * GET /api/products?page=1&limit=10&sort=newest
 */
export const list = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Sort options
    const sortMap = {
      newest: { createdAt: -1 },
      "price-asc": { price: 1 },
      "price-desc": { price: -1 },
      "best-selling": { sold: -1 },
    };
    const sort = sortMap[req.query.sort] || sortMap.newest;

    const [products, total] = await Promise.all([
      Product.find({})
        .populate("category", "name slug")
        .populate("subcategories", "name slug")
        .sort(sort)
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
      .populate("subcategories", "name slug")
      .populate("ratings.postedBy", "name");
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

/**
 * GET /api/products/category/:slug?page=1&limit=12
 */
export const listByCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) return next(new AppError("Category not found", 404));

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find({ category: category._id })
        .populate("category", "name slug")
        .populate("subcategories", "name slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments({ category: category._id }),
    ]);

    res.status(200).json({
      success: true,
      products,
      total,
      page,
      pages: Math.ceil(total / limit),
      category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/products/subcategory/:slug?page=1&limit=12
 */
export const listBySubCategory = async (req, res, next) => {
  try {
    const sub = await SubCategory.findOne({ slug: req.params.slug }).populate(
      "parent",
      "name slug"
    );
    if (!sub) return next(new AppError("Sub-category not found", 404));

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find({ subcategories: sub._id })
        .populate("category", "name slug")
        .populate("subcategories", "name slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments({ subcategories: sub._id }),
    ]);

    res.status(200).json({
      success: true,
      products,
      total,
      page,
      pages: Math.ceil(total / limit),
      subcategory: sub,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/products/rating
 * Body: { productId, star }
 *
 * Explicit upsert logic:
 * 1. Check if the user already has a rating in the array
 * 2. If YES → use positional $ operator to update the existing entry
 * 3. If NO  → $push a new rating entry
 */
export const submitRating = async (req, res, next) => {
  try {
    const { productId, star } = req.body;
    const userId = req.user._id;

    if (!star || star < 1 || star > 5) {
      return next(new AppError("Star rating must be between 1 and 5", 400));
    }

    // Check if this user already rated this product
    const existingRating = await Product.findOne({
      _id: productId,
      "ratings.postedBy": userId,
    });

    let product;

    if (existingRating) {
      // UPDATE existing rating — positional $ operator
      product = await Product.findOneAndUpdate(
        { _id: productId, "ratings.postedBy": userId },
        { $set: { "ratings.$.star": star } },
        { new: true }
      )
        .populate("category", "name slug")
        .populate("subcategories", "name slug")
        .populate("ratings.postedBy", "name");
    } else {
      // PUSH new rating
      product = await Product.findByIdAndUpdate(
        productId,
        { $push: { ratings: { star, postedBy: userId } } },
        { new: true }
      )
        .populate("category", "name slug")
        .populate("subcategories", "name slug")
        .populate("ratings.postedBy", "name");
    }

    if (!product) return next(new AppError("Product not found", 404));

    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};
