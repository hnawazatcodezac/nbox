const Product = require("../../models/product");

const getProductDetails = async (req, res) => {
  const { productId } = req.params;

  try {
    const product = await Product.findOne(
      { _id: productId, status: { $ne: "in-active" } },
      {
        enName: 1,
        frName: 1,
        enDescription: 1,
        frDescription: 1,
        images: 1,
        price: 1,
        compareAtPrice: 1,
        "variants._id": 1,
        "variants.enVariantName": 1,
        "variants.frVariantName": 1,
        "variants.price": 1,
      }
    ).populate("categories", "enName frName");

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
        response: null,
        error: "Product not found",
      });
    }

    const data = {
      data: product,
    };
    return res.status(200).json({
      message: "Product details returned successfully",
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

module.exports = {
  getProductDetails,
};
