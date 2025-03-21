const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: Number,
      unique: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    addressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    cartItems: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        productFrName: {
          type: String,
          required: true,
        },
        productEnName: {
          type: String,
          required: true,
        },
        variantId: {
          type: mongoose.Schema.Types.ObjectId,
          required: false,
        },
        variantFrName: {
          type: String,
          required: false,
        },
        variantEnName: {
          type: String,
          required: false,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
      },
    ],
    orderStatus: {
      type: String,
      enum: [
        "payment-pending",
        "pending",
        "accepted",
        "preparing",
        "out-for-delivery",
        "delivered",
        "completed",
        "canceled",
      ],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    subtotal: {
      type: Number,
      required: true,
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
    },
    transactionId: {
      type: String,
      required: false,
    },
    paymentDate: {
      type: Date,
      default: null,
    },
    scheduledDate: {
      type: Date,
      required: false,
    },
    preparationTime: {
      type: Number,
      default: null,
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: [
            "payment-pending",
            "pending",
            "accepted",
            "preparing",
            "out-for-delivery",
            "delivered",
            "completed",
            "canceled",
          ],
          required: true,
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

OrderSchema.pre("save", async function (next) {
  if (this.isNew) {
    const lastOrder = await mongoose
      .model("Order")
      .findOne({}, "orderNumber")
      .sort({ orderNumber: -1 });
    this.orderNumber = lastOrder ? lastOrder.orderNumber + 1 : 1;
  }

  if (this.isModified("orderStatus")) {
    this.statusHistory?.push({
      status: this.orderStatus,
      changedAt: new Date(),
    });
  }
  next();
});

module.exports = mongoose.model("Order", OrderSchema);
