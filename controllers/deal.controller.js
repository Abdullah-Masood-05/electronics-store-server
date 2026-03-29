import Deal from "../models/Deal.js";
import AppError from "../utils/AppError.js";

/**
 * POST /api/deals — admin creates a deal
 */
export const create = async (req, res, next) => {
  try {
    const deal = await Deal.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, deal });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/deals — public, returns all active deals
 */
export const listActive = async (req, res, next) => {
  try {
    const deals = await Deal.find({ active: true })
      .populate("product", "title slug images price")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, deals });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/deals/all — admin sees all deals (active + inactive)
 */
export const listAll = async (req, res, next) => {
  try {
    const deals = await Deal.find({})
      .populate("product", "title slug images price")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, deals });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/deals/:id
 */
export const update = async (req, res, next) => {
  try {
    const deal = await Deal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("product", "title slug images price")
      .populate("createdBy", "name");
    if (!deal) return next(new AppError("Deal not found", 404));
    res.status(200).json({ success: true, deal });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/deals/:id
 */
export const remove = async (req, res, next) => {
  try {
    const deal = await Deal.findByIdAndDelete(req.params.id);
    if (!deal) return next(new AppError("Deal not found", 404));
    res.status(200).json({ success: true, deal });
  } catch (error) {
    next(error);
  }
};
