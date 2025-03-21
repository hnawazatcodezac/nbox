const { Schema, model } = require("mongoose");

const userSettingsSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    language: {
      type: String,
      default: "en",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = model("user_settings", userSettingsSchema);
