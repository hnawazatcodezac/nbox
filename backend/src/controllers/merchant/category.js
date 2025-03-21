const Category = require("../../models/category");

const createCategory = async (req, res) => {
  const { userId } = req.decoded;
  const { enName, frName, sort } = req.body;

  try {
    const existingCategory = await Category.findOne({
      userId,
      $or: [{ enName }, { frName }],
    });
    if (existingCategory) {
      return res.status(409).json({
        message: "Category already exists",
        response: null,
        error: "Duplicate category",
      });
    }

    const newCategory = new Category({
      userId,
      enName,
      frName,
      sort,
    });
    await newCategory.save();

    return res.status(201).json({
      message: "Category created successfully",
      response: null,
      error: null,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      response: null,
      error: error.message,
    });
  }
};

const getCategories = async (req, res) => {
  const { userId } = req.decoded;

  try {
    const categories = await Category.find(
      { userId },
      "_id enName frName"
    ).sort({ sort: 1 });

    if (categories.length < 1) {
      return res.status(404).json({
        message: "No data found",
        response: null,
        error: "No data found",
      });
    }

    const data = {
      data: categories,
    };
    return res.status(200).json({
      message: "Categories fetched successfully",
      response: data,
      error: null,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      response: null,
      error: error.message,
    });
  }
};

const updateCategory = async (req, res) => {
  const { userId } = req.decoded;
  const { categoryId } = req.params;
  const { enName, frName, sort } = req.body;

  try {
    const existingCategory = await Category.findOne({
      _id: categoryId,
      userId,
    });
    if (!existingCategory) {
      return res.status(404).json({
        message: "Category not found",
        response: null,
        error: "Category not found",
      });
    }

    const duplicateCategory = await Category.findOne({
      userId,
      _id: { $ne: categoryId },
      $or: [{ enName }, { frName }],
    });
    if (duplicateCategory) {
      return res.status(409).json({
        message: "Category with this name already exists",
        response: null,
        error: "Category with this name already exists",
      });
    }

    await Category.findByIdAndUpdate(
      categoryId,
      { enName, frName, sort },
      { new: true }
    );

    return res.status(200).json({
      message: "Category updated successfully",
      response: null,
      error: null,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      response: null,
      error: error.message,
    });
  }
};

const deleteCategory = async (req, res) => {
  const { userId } = req.decoded;
  const { categoryId } = req.params;

  try {
    const category = await Category.findOneAndDelete({
      _id: categoryId,
      userId,
    });

    if (!category) {
      return res.status(404).json({
        message: "No category found",
        response: null,
        error: "No category found",
      });
    }

    return res.status(200).json({
      message: "Category deleted successfully",
      response: null,
      error: null,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      response: null,
      error: error.message,
    });
  }
};

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
};
