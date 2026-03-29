import SubCategory from "../models/SubCategory.js";
import AppError from "../utils/AppError.js";
import slugify from "../utils/slugify.js";

/**
 * POST /api/subcategories
 */
export const create = async (req, res, next) => {
  try {
    const { name, parent } = req.body;
    const slug = slugify(name);
    const sub = await SubCategory.create({ name, slug, parent });
    res.status(201).json({ success: true, subcategory: sub });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/subcategories
 * Optional query: ?parent=categoryId to filter by parent
 */
export const list = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.parent) filter.parent = req.query.parent;

    const subcategories = await SubCategory.find(filter)
      .populate("parent", "name slug")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, subcategories });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/subcategories/:slug
 */
export const read = async (req, res, next) => {
  try {
    const sub = await SubCategory.findOne({ slug: req.params.slug }).populate(
      "parent",
      "name slug"
    );
    if (!sub) return next(new AppError("Sub-category not found", 404));
    res.status(200).json({ success: true, subcategory: sub });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/subcategories/:slug
 */
export const update = async (req, res, next) => {
  try {
    const { name, parent } = req.body;
    const updateData = {};
    if (name) {
      updateData.name = name;
      updateData.slug = slugify(name);
    }
    if (parent) updateData.parent = parent;

    const updated = await SubCategory.findOneAndUpdate(
      { slug: req.params.slug },
      updateData,
      { new: true, runValidators: true }
    ).populate("parent", "name slug");

    if (!updated) return next(new AppError("Sub-category not found", 404));
    res.status(200).json({ success: true, subcategory: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/subcategories/:slug
 */
export const remove = async (req, res, next) => {
  try {
    const deleted = await SubCategory.findOneAndDelete({
      slug: req.params.slug,
    });
    if (!deleted) return next(new AppError("Sub-category not found", 404));
    res.status(200).json({ success: true, subcategory: deleted });
  } catch (error) {
    next(error);
  }
};
