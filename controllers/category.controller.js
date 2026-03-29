import Category from "../models/Category.js";
import AppError from "../utils/AppError.js";
import slugify from "../utils/slugify.js";

/**
 * POST /api/categories
 */
export const create = async (req, res, next) => {
  try {
    const { name } = req.body;
    const slug = slugify(name);
    const category = await Category.create({ name, slug });
    res.status(201).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/categories
 */
export const list = async (req, res, next) => {
  try {
    const categories = await Category.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/categories/:slug
 */
export const read = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) return next(new AppError("Category not found", 404));
    res.status(200).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/categories/:slug
 */
export const update = async (req, res, next) => {
  try {
    const { name } = req.body;
    const updated = await Category.findOneAndUpdate(
      { slug: req.params.slug },
      { name, slug: slugify(name) },
      { new: true, runValidators: true }
    );
    if (!updated) return next(new AppError("Category not found", 404));
    res.status(200).json({ success: true, category: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/categories/:slug
 */
export const remove = async (req, res, next) => {
  try {
    const deleted = await Category.findOneAndDelete({ slug: req.params.slug });
    if (!deleted) return next(new AppError("Category not found", 404));
    res.status(200).json({ success: true, category: deleted });
  } catch (error) {
    next(error);
  }
};
