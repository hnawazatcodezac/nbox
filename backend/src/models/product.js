const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sku: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    enName: {
      type: String,
      required: true,
      trim: true,
    },
    frName: {
      type: String,
      required: true,
      trim: true,
    },
    enDescription: {
      type: String,
      trim: true,
    },
    frDescription: {
      type: String,
      trim: true,
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        require: true,
      },
    ],
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    costPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    compareAtPrice: {
      type: Number,
      min: 0,
    },
    chargeTax: {
      type: Number,
      min: 0,
    },
    availability: {
      type: String,
      enum: ["out-of-stock", "in-stock"],
      default: "in-stock",
    },
    status: {
      type: String,
      enum: ["active", "in-active"],
      default: "active",
    },
    minQuantity: {
      type: Number,
      min: 0,
    },
    maxQuantity: {
      type: Number,
      min: 0,
    },
    inventory: {
      type: Number,
      min: 0,
    },
    minQuantityThreshold: {
      type: Number,
      required: false,
    },
    tags: {
      type: [String],
      default: [],
    },
    labels: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Label",
        require: true,
      },
    ],
    images: {
      type: [String],
      required: true,
    },
    enOptionName: {
      type: String,
      trim: true,
    },
    frOptionName: {
      type: String,
      trim: true,
    },
    optionType: {
      type: String,
      enum: ["single", "multiple"],
    },
    optionRequired: {
      type: Boolean,
      default: false,
    },
    variants: [
      {
        enVariantName: {
          type: String,
          trim: true,
        },
        frVariantName: {
          type: String,
          trim: true,
        },
        price: {
          type: Number,
          min: 0,
        },
        costPrice: {
          type: Number,
          min: 0,
        },
      },
    ],
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
