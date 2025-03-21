const { Schema, model } = require("mongoose");

const categorySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    enName: {
      type: String,
      required: true,
    },
    frName: {
      type: String,
      required: true,
    },
    sort: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

module.exports = model("Category", categorySchema);
