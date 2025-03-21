const { Schema, model } = require("mongoose");

const labelSchema = new Schema(
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
  },
  { timestamps: true }
);

module.exports = model("Label", labelSchema);
