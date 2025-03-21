const mongoose = require("mongoose");

const MerchantConfigSchema = new mongoose.Schema(
  {
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    storeName: {
      type: String,
      default: null,
    },
    storeImage: {
      type: String,
      default: null,
    },
    storeCustomText: {
      type: String,
      default: null,
    },
    companyWebsite: {
      type: String,
      default: null,
    },
    orderPerMonth: {
      type: String,
      default: null,
    },
    businessType: {
      type: String,
      enum: ["manufactures", "distribution"],
      default: null,
    },
    deliverySettings: {
      displayDeliveryTime: {
        type: Boolean,
        default: false,
      },
      deliveryType: {
        type: String,
        enum: ["none", "fixed"],
        default: "none",
      },
      deliveryTime: {
        type: Number,
        default: null,
      },
      fixedCharges: {
        type: Number,
        default: null,
      },
      autoAcceptOrder: {
        type: Boolean,
        default: false,
      },
    },
    businessHours: {
      enabled: { type: Boolean, default: false },
      timings: [
        {
          day: {
            type: String,
            enum: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ],
          },
          shifts: [
            {
              open: { type: String },
              close: { type: String },
            },
          ],
        },
      ],
    },
  },
  { timestamps: true }
);

const merchantConfig = mongoose.model("merchant_config", MerchantConfigSchema);

module.exports = merchantConfig;
