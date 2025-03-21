const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    addressLongLat: {
      type: {
        type: String,
        enum: ["Point"], // This will ensure that the type is 'Point'
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    landmark: {
      type: String,
      required: true,
    },
    landmarkLongLat: {
      type: {
        type: String,
        enum: ["Point"], // This will ensure that the type is 'Point'
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    addressType: {
      type: String,
      enum: ["home", "office", "other"],
      default: "other",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Creating a geospatial index to support location-based queries
addressSchema.index({ addressLongLat: "2dsphere" });
addressSchema.index({ landmarkLongLat: "2dsphere" });

const address = mongoose.model("Address", addressSchema);

module.exports = address;
