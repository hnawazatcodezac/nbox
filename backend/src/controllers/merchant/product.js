const mongoose = require("mongoose");
const Product = require("../../models/product");
const Category = require("../../models/category");
const Label = require("../../models/label");
const { uploadFilesS3, deleteFilesS3 } = require("../../utils/upload-file");

const parseStringToArray = (str) => (str ? str.split(",") : []);

const validateLabels = async (labelsArray, userId) => {
  const existingLabels = await Label.find({
    _id: { $in: labelsArray },
    userId,
  });
  return existingLabels.length === labelsArray.length;
};

const validateCategories = async (categoriesArray, userId) => {
  const existingCategories = await Category.find({
    _id: { $in: categoriesArray },
    userId,
  });
  return existingCategories.length === categoriesArray.length;
};

const createProduct = async (req, res) => {
  const { userId } = req.decoded;
  const { categories, labels, sku, ...productData } = req.body;

  try {
    const existingProduct = await Product.exists({ sku });
    if (existingProduct) {
      return res.status(409).json({
        message: "Product with this SKU already exists",
        response: null,
        error: "Product with this SKU already exists",
      });
    }

    const labelsArray = parseStringToArray(labels);
    const isValidLabels = await validateLabels(labelsArray, userId);
    if (!isValidLabels) {
      return res.status(400).json({
        message: "One or more labels are invalid",
        response: null,
        error: "One or more labels are invalid",
      });
    }

    const categoriesArray = parseStringToArray(categories);
    const isValidCategories = await validateCategories(categoriesArray, userId);
    if (!isValidCategories) {
      return res.status(400).json({
        message: "One or more categories are invalid",
        response: null,
        error: "One or more categories are invalid",
      });
    }

    const uploadedImageUrls = req.files
      ? await uploadFilesS3(req.files, "product")
      : undefined;
    const newProduct = new Product({
      merchantId: userId,
      sku,
      enName: productData.enName,
      frName: productData.frName,
      enDescription: productData.enDescription,
      frDescription: productData.frDescription,
      categories: categoriesArray,
      price: parseFloat(productData.price),
      costPrice: parseFloat(productData.costPrice),
      compareAtPrice: productData.compareAtPrice
        ? parseFloat(productData.compareAtPrice)
        : undefined,
      chargeTax: productData.chargeTax
        ? parseInt(productData.chargeTaxValue)
        : undefined,
      availability: productData.availability,
      status: productData.status,
      minQuantity: productData.minQuantity
        ? parseInt(productData.minQuantity)
        : undefined,
      maxQuantity: productData.maxQuantity
        ? parseInt(productData.maxQuantity)
        : undefined,
      inventory: productData.inventory ?? undefined,
      minQuantityThreshold: parseFloat(productData.minQuantityThreshold),
      labels: labelsArray,
      tags: productData.tags ? productData.tags.split(",") : [],
      images: uploadedImageUrls,
      enOptionName: productData?.enOptionName,
      frOptionName: productData?.frOptionName,
      optionType: productData?.optionType,
      optionRequired: productData?.optionRequired,
      variants: productData?.variants?.map((variant) => ({
        enVariantName: variant?.enVariantName,
        frVariantName: variant?.frVariantName,
        price: parseFloat(variant?.price),
        costPrice: parseFloat(variant?.costPrice),
      })),
    });
    await newProduct.save();

    return res.status(201).json({
      message: "Product created successfully",
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

const getProducts = async (req, res) => {
  const { userId } = req.decoded;
  const { search } = req.query;
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 5;
  const offset = (page - 1) * pageSize;

  try {
    const searchFilter = search
      ? {
          $or: [
            { enName: { $regex: search, $options: "i" } },
            { frName: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const totalCount = await Product.countDocuments({
      merchantId: userId,
      ...searchFilter,
    });

    const products = await Product.find(
      { merchantId: userId, ...searchFilter },
      "_id enName frName images price availability categories"
    )
      .populate("categories", "frName enName")
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(pageSize);

    if (products.length < 1) {
      return res.status(404).json({
        message: "No data found",
        response: null,
        error: "No data found",
      });
    }

    const data = {
      data: products,
      page,
      pageSize,
      totalCount,
    };
    return res.status(200).json({
      message: "Products fetched successfully",
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

const getProductsDetails = async (req, res) => {
  const { userId } = req.decoded;
  const { productId } = req.params;

  try {
    const product = await Product.findOne({
      _id: productId,
      merchantId: userId,
    })
      .select("-createdAt -updatedAt -__v")
      .populate("categories", "frName enName")
      .populate("labels", "frName enName");

    if (!product || product?.length < 1) {
      return res.status(404).json({
        message: "No data found",
        response: null,
        error: "No data found",
      });
    }

    const data = {
      data: product,
    };
    return res.status(200).json({
      message: "Product details fetched successfully",
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

const updateAvailability = async (req, res) => {
  const { userId } = req.decoded;
  const { productId } = req.params;
  const { availability } = req.body;

  try {
    const product = await Product.findOne(
      {
        _id: productId,
        merchantId: userId,
      },
      "availability inventory"
    );

    if (!product) {
      return res.status(404).json({
        message: "No product found",
        response: null,
        error: "No data found",
      });
    }

    if (product.availability === availability) {
      return res.status(200).json({
        message: `Product is already ${
          availability === "in-stock" ? "in stock" : "out of stock"
        }`,
        response: null,
        error: null,
      });
    }

    if (availability === "out-of-stock") {
      product.inventory = 0;
    } else {
      product.inventory = product.inventory === 0 ? null : product.inventory;
    }
    product.availability = availability;
    await product.save();

    return res.status(200).json({
      message: "Product availability updated successfully",
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

const updateProduct = async (req, res) => {
  const { userId } = req.decoded;
  const { productId } = req.params;
  const { categories, labels, sku, oldImages, ...productData } = req.body;

  try {
    const existingProduct = await Product.findOne({
      _id: productId,
      merchantId: userId,
    });
    if (!existingProduct) {
      return res.status(404).json({
        message: "Product not found",
        response: null,
        error: "Product not found",
      });
    }

    const duplicateSKU = await Product.exists({ sku, _id: { $ne: productId } });
    if (duplicateSKU) {
      return res.status(409).json({
        message: "Product with this SKU already exists",
        response: null,
        error: "Product with this SKU already exists",
      });
    }

    const labelsArray = parseStringToArray(labels);
    const isValidLabels = await validateLabels(labelsArray, userId);
    if (!isValidLabels) {
      return res.status(400).json({
        message: "One or more labels are invalid",
        response: null,
        error: "One or more labels are invalid",
      });
    }

    const categoriesArray = parseStringToArray(categories);
    const isValidCategories = await validateCategories(categoriesArray, userId);
    if (!isValidCategories) {
      return res.status(400).json({
        message: "One or more categories are invalid",
        response: null,
        error: "One or more categories are invalid",
      });
    }

    if (productData?.variants?.length > 0) {
      const variantIds = productData.variants
        .map((v) => v.variantId)
        .filter((id) => id);

      const existingVariantIds = new Set(
        existingProduct.variants.map((v) => v._id.toString())
      );

      if (!variantIds.every((id) => existingVariantIds.has(id))) {
        return res.status(400).json({
          message: "One or more variant IDs do not exist in this product",
          response: null,
          error: "One or more variant IDs do not exist in this product",
        });
      }
    }

    const existingImages = existingProduct?.images || [];
    const areImagesValid = (imagesArray, existingImages) =>
      imagesArray?.every((img) => existingImages?.includes(img));

    const oldImagesArray = parseStringToArray(oldImages).map(decodeURI);
    if (!areImagesValid(oldImagesArray, existingImages)) {
      return res.status(400).json({
        message: "One or more old images are invalid",
        response: null,
        error: "Invalid old images",
      });
    }

    const deleteImagesArray = existingImages.filter(
      (img) => !oldImagesArray.includes(img)
    );

    let updatedImages = [...oldImagesArray];
    if (req.files?.length > 0) {
      const uploadedImageUrls = await uploadFilesS3(req.files, "product");
      updatedImages = [...updatedImages, ...uploadedImageUrls];
    }

    if (deleteImagesArray?.length > 0) {
      await deleteFilesS3(deleteImagesArray);
    }

    await Product.findByIdAndUpdate(
      productId,
      {
        sku,
        enName: productData.enName,
        frName: productData.frName,
        enDescription: productData.enDescription,
        frDescription: productData.frDescription,
        categories: categoriesArray,
        price: parseFloat(productData.price),
        costPrice: parseFloat(productData.costPrice),
        compareAtPrice: productData.compareAtPrice
          ? parseFloat(productData.compareAtPrice)
          : null,
        chargeTax: productData.chargeTaxValue
          ? parseInt(productData.chargeTaxValue)
          : null,
        availability: productData.availability,
        status: productData.status,
        minQuantity: productData.minQuantity
          ? parseInt(productData.minQuantity)
          : null,
        maxQuantity: productData.maxQuantity
          ? parseInt(productData.maxQuantity)
          : null,
        inventory: productData.inventory ?? null,
        minQuantityThreshold: parseFloat(productData.minQuantityThreshold),
        labels: labelsArray,
        tags: productData.tags ? productData.tags.split(",") : [],
        images: updatedImages,
        enOptionName: productData?.enOptionName,
        frOptionName: productData?.frOptionName,
        optionType: productData?.optionType,
        optionRequired: productData?.optionRequired,
        variants: productData?.variants
          ? productData?.variants?.map((variant) => ({
              _id: variant?.variantId || new mongoose.Types.ObjectId(),
              enVariantName: variant?.enVariantName,
              frVariantName: variant?.frVariantName,
              price: parseFloat(variant?.price),
              costPrice: parseFloat(variant?.costPrice),
            }))
          : [],
      },
      { new: true }
    );

    return res.status(200).json({
      message: "Product updated successfully",
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

const deleteProduct = async (req, res) => {
  const { userId } = req.decoded;
  const { productId } = req.params;

  try {
    const product = await Product.findOneAndDelete({
      _id: productId,
      merchantId: userId,
    });

    if (!product) {
      return res.status(404).json({
        message: "No product found",
        response: null,
        error: "No product found",
      });
    } else if (product?.images && product?.images?.length > 0) {
      await deleteFilesS3(product?.images);
    }

    return res.status(200).json({
      message: "Product deleted successfully",
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
  createProduct,
  getProducts,
  getProductsDetails,
  updateAvailability,
  updateProduct,
  deleteProduct,
};
