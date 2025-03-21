const Stripe = require("stripe");
const Order = require("../../models/order.js");
const Address = require("../../models/address.js");
const Review = require("../../models/review.js");
const MerchantConfig = require("../../models/merchantConfig.js");
const { configurations } = require("../../config/config.js");
const { configs } = require("../../config/email-config.js");
const { sendMail } = require("../../utils/sendMail.js");

const stripe = Stripe(configurations.stripeSecretKey);

const getAllOrders = async (req, res) => {
  const { userId } = req.decoded;
  const { search, status } = req.query;
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 5;
  const offset = (page - 1) * pageSize;

  try {
    let query = {
      merchantId: userId,
      orderStatus: { $nin: ["payment-pending"] },
      $or: [
        { scheduledDate: { $exists: false } },
        { scheduledDate: { $lte: new Date() } },
        {
          scheduledDate: { $gt: new Date() },
          orderStatus: { $nin: ["pending", "accepted"] },
        },
      ],
    };

    if (status) {
      const statusMap = {
        pending: "pending",
        accepted: "accepted",
        preparing: "preparing",
        outForDelivery: "out-for-delivery",
        delivered: "delivered",
        canceled: "canceled",
      };
      query.orderStatus = statusMap[status] || status;
    }

    if (search) {
      query.$expr = {
        $regexMatch: {
          input: { $toString: "$orderNumber" },
          regex: String(search),
        },
      };
    }

    const totalCount = await Order.countDocuments(query);

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .select("cartItems.productId orderNumber orderStatus subtotal")
      .skip(offset)
      .limit(pageSize)
      .lean();

    if (orders.length < 1) {
      return res.status(404).json({
        message: "No order found",
        response: null,
        error: "No order found",
      });
    }

    const responseData = orders.map((order) => ({
      orderId: order._id,
      orderSubtotal: order.subtotal,
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      items: order.cartItems.length,
    }));

    const data = {
      data: {
        orders: responseData,
        page,
        pageSize,
        totalCount,
      },
    };

    return res.status(200).json({
      message: "Orders retrieved successfully",
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

const getScheduledOrders = async (req, res) => {
  const { userId } = req.decoded;
  const { search } = req.query;
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 5;
  const offset = (page - 1) * pageSize;

  try {
    let query = {
      merchantId: userId,
      scheduledDate: { $gt: new Date() },
      orderStatus: { $in: ["pending", "accepted"] },
    };

    if (search) {
      query.$expr = {
        $regexMatch: {
          input: { $toString: "$orderNumber" },
          regex: String(search),
        },
      };
    }

    const totalCount = await Order.countDocuments(query);

    const orders = await Order.find(query)
      .sort({ scheduledDate: 1 })
      .select(
        "cartItems.productId orderNumber orderStatus subtotal scheduledDate"
      )
      .skip(offset)
      .limit(pageSize)
      .lean();

    if (orders.length < 1) {
      return res.status(404).json({
        message: "No scheduled order found",
        response: null,
        error: "No scheduled order found",
      });
    }

    const responseData = orders.map((order) => ({
      orderId: order._id,
      orderSubtotal: order.subtotal,
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      scheduledDate: order.scheduledDate,
      items: order.cartItems.length,
    }));

    const data = {
      data: {
        orders: responseData,
        page,
        pageSize,
        totalCount,
      },
    };

    return res.status(200).json({
      message: "Scheduled orders retrieved successfully",
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

const getOrderDetails = async (req, res) => {
  const { userId } = req.decoded;
  const { orderId } = req.params;

  try {
    const order = await Order.findOne({
      _id: orderId,
      merchantId: userId,
      orderStatus: { $ne: "payment-pending" },
    })
      .select(
        "buyerId orderNumber createdAt cartItems subtotal deliveryFee orderStatus scheduledDate grandTotal statusHistory"
      )
      .populate("buyerId", "firstName lastName email phoneNumber")
      .lean();

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
        response: null,
        error: "Order not found",
      });
    }

    const reviews = await Review.findOne({ orderId })
      .select("review rating")
      .lean();

    const storeData = await MerchantConfig.findOne({
      merchantId: userId,
    })
      .select("storeName storeImage")
      .lean();

    const storeAddress = await Address.findOne({ userId })
      .sort({ isDefault: -1, updatedAt: -1 })
      .select("address")
      .lean();

    const userAddress = await Address.findOne({ userId: order.buyerId })
      .sort({ isDefault: -1, updatedAt: -1 })
      .select("address")
      .lean();

    const cartItems = order?.cartItems || [];
    const products = cartItems.map((item) => {
      return {
        enProductName: item.productEnName,
        frProductName: item.productFrName,
        variantEnName: item.variantEnName || undefined,
        variantFrName: item.variantFrName || undefined,
        quantity: item.quantity,
        price: item.price,
      };
    });

    const scheduled =
      (order.scheduledDate &&
        ["pending", "accepted"].includes(order.orderStatus)) ||
      undefined;

    const data = {
      data: {
        orderNumber: order.orderNumber,
        orderDate: order.createdAt,
        storeName: storeData.storeName,
        storeImage: storeData.storeImage,
        storeAddress: storeAddress.address,
        buyerFirstName: order?.buyerId?.firstName,
        buyerLastName: order?.buyerId?.lastName,
        buyerAddress: userAddress.address,
        buyerEmail: order?.buyerId?.email,
        buyerMobile: order?.buyerId?.phoneNumber,
        scheduled,
        scheduledDate: scheduled ? order.scheduledDate : undefined,
        reviews: reviews ? reviews.review : undefined,
        ratings: reviews ? reviews.rating : undefined,
        products,
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        grandTotal: order.grandTotal,
        timeline: order.statusHistory || [],
      },
    };

    return res.status(200).json({
      message: "Order details retrieved successfully",
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

const acceptOrder = async (req, res) => {
  const { userId } = req.decoded;
  const { orderId } = req.params;

  try {
    const order = await Order.findOne({ _id: orderId, merchantId: userId })
      .select(
        "buyerId merchantId paymentDate orderStatus grandTotal statusHistory"
      )
      .populate("buyerId", "firstName lastName email");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
        response: null,
        error: "Order not found",
      });
    }

    if (order.orderStatus !== "pending") {
      return res.status(400).json({
        message: "Order cannot be accepted as it is not in pending status",
        response: null,
        error: "Order cannot be accepted as it is not in pending status",
      });
    }

    order.orderStatus = "accepted";
    await order.save();

    const buyer = order.buyerId;
    const merchantConfig = await MerchantConfig.findOne({
      merchantId: order.merchantId,
    })
      .select("storeName")
      .lean();

    const dynamicData = {
      userName: buyer?.firstName + " " + buyer?.lastName,
      status: "accepted",
      orderDate: order?.paymentDate.toISOString().split("T")[0],
      storeName: merchantConfig?.storeName,
      orderTotal: order?.grandTotal,
      customMessage: "",
      to_email: buyer?.email,
    };
    await sendMail(configs.templates.buyerOrderNotification, dynamicData);

    return res.status(200).json({
      message: "Order accepted successfully",
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

const cancelOrder = async (req, res) => {
  const { userId } = req.decoded;
  const { orderId } = req.params;

  try {
    const order = await Order.findOne({ _id: orderId, merchantId: userId })
      .select(
        "buyerId merchantId paymentDate orderStatus grandTotal statusHistory transactionId"
      )
      .populate("buyerId", "firstName lastName email");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
        response: null,
        error: "Order not found",
      });
    }

    if (order.orderStatus !== "pending") {
      return res.status(400).json({
        message: `Order cannot be canceled as it is not in pending status`,
        response: null,
        error: `Order cannot be canceled as it is not in pending status`,
      });
    }

    order.orderStatus = "canceled";
    order.paymentStatus = "refunded";
    await order.save();

    const stripeSession = await stripe.checkout.sessions.retrieve(
      order.transactionId,
      {
        expand: ["line_items"],
      }
    );
    const charge = await stripe.charges.list({
      payment_intent: stripeSession.payment_intent,
    });
    const chargeId = charge?.data[0]?.id;
    await stripe.refunds.create({
      charge: chargeId,
    });

    const buyer = order.buyerId;
    const merchantConfig = await MerchantConfig.findOne({
      merchantId: order.merchantId,
    })
      .select("storeName")
      .lean();

    const customMessage = "Your payment will be refunded soon.";
    const dynamicData = {
      userName: buyer?.firstName + " " + buyer?.lastName,
      status: "canceled",
      orderDate: order?.paymentDate.toISOString().split("T")[0],
      storeName: merchantConfig?.storeName,
      orderTotal: order?.grandTotal,
      customMessage,
      to_email: buyer?.email,
    };
    await sendMail(configs.templates.buyerOrderNotification, dynamicData);

    return res.status(200).json({
      message: "Order canceled successfully",
      response: null,
      error: null,
    });
  } catch (error) {
    if (error.raw?.code === "charge_already_refunded") {
      return res.status(400).json({
        message: "Payment has already been refunded",
        response: null,
        error: "Payment has already been refunded",
      });
    }

    return res.status(500).json({
      message: "Internal Server Error",
      response: null,
      error: error.message,
    });
  }
};

const prepareOrder = async (req, res) => {
  const { userId } = req.decoded;
  const { orderId } = req.params;
  const { preparationTime } = req.body;

  try {
    const order = await Order.findOne({ _id: orderId, merchantId: userId })
      .select(
        "buyerId merchantId paymentDate scheduledDate grandTotal orderStatus statusHistory"
      )
      .populate("buyerId", "firstName lastName email");
    if (!order) {
      return res.status(404).json({
        message: "Order not found",
        response: null,
        error: "Order not found",
      });
    }
    if (order.orderStatus !== "accepted") {
      return res.status(400).json({
        message: "Order cannot be prepare as it is not in accepted status",
        response: null,
        error: "Order cannot be prepare as it is not in accepted status",
      });
    }

    const merchantConfig = await MerchantConfig.findOne({
      merchantId: order.merchantId,
    })
      .select("storeName deliverySettings.deliveryTime")
      .lean();

    if (order.scheduledDate) {
      const now = new Date();
      const timeOffset = now.getTimezoneOffset() * 60000;
      const currentTime = now.getTime() - timeOffset;
      const scheduledDate = new Date(order.scheduledDate).getTime();
      const deliveryTime = merchantConfig?.deliverySettings?.deliveryTime || 0;

      const expectedDeliveryTime =
        currentTime + preparationTime * 60000 + deliveryTime * 60000;
      const maximumDeliveryTime =
        scheduledDate + preparationTime * 60000 + deliveryTime * 60000;

      if (
        expectedDeliveryTime < scheduledDate ||
        expectedDeliveryTime > maximumDeliveryTime
      ) {
        return res.status(400).json({
          message: "Preparation time does not match the scheduled order time",
          response: null,
          error: "Preparation time does not match the scheduled order time",
        });
      }
    }

    order.orderStatus = "preparing";
    if (preparationTime) {
      order.preparationTime = preparationTime;
    }
    await order.save();

    const buyer = order.buyerId;
    const customMessage = `Your order will be prepare in ${preparationTime} minutes.`;
    const dynamicData = {
      userName: buyer?.firstName + " " + buyer?.lastName,
      status: "preparing",
      orderDate: order?.paymentDate.toISOString().split("T")[0],
      storeName: merchantConfig?.storeName,
      orderTotal: order?.grandTotal,
      customMessage,
      to_email: buyer?.email,
    };
    await sendMail(configs.templates.buyerOrderNotification, dynamicData);

    return res.status(200).json({
      message: "Order is set to preparing",
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

const readyOrder = async (req, res) => {
  const { userId } = req.decoded;
  const { orderId } = req.params;

  try {
    const order = await Order.findOne({ _id: orderId, merchantId: userId })
      .select(
        "buyerId merchantId addressId paymentDate grandTotal orderStatus statusHistory"
      )
      .populate("buyerId", "firstName lastName email")
      .populate("addressId", "address");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
        response: null,
        error: "Order not found",
      });
    }

    if (order.orderStatus !== "preparing") {
      return res.status(400).json({
        message: "Order cannot be ready as it is not in preparing status",
        response: null,
        error: "Order cannot be ready as it is not in preparing status",
      });
    }

    order.orderStatus = "out-for-delivery";
    await order.save();

    const buyer = order.buyerId;
    const merchantConfig = await MerchantConfig.findOne({
      merchantId: order.merchantId,
    })
      .select("storeName deliverySettings.deliveryTime")
      .lean();

    const deliveryTime = merchantConfig?.deliverySettings?.deliveryTime;
    const userAddress = order?.addressId?.address;

    const dynamicData = {
      userName: buyer?.firstName + " " + buyer?.lastName,
      orderID: order._id,
      orderDate: order?.paymentDate.toISOString().split("T")[0],
      storeName: merchantConfig?.storeName,
      orderTotal: order?.grandTotal,
      userAddress,
      deliveryTime,
      to_email: buyer?.email,
    };
    await sendMail(
      configs.templates.outForDeliveryNotificationBuyer,
      dynamicData
    );

    return res.status(200).json({
      message: "Order has been out for delivery successfully",
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

const completeOrder = async (req, res) => {
  const { userId } = req.decoded;
  const { orderId } = req.params;

  try {
    const order = await Order.findOne({ _id: orderId, merchantId: userId })
      .select("buyerId merchantId orderStatus statusHistory")
      .populate("buyerId", "firstName lastName email");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
        response: null,
        error: "Order not found",
      });
    }

    if (order.orderStatus !== "delivered") {
      return res.status(400).json({
        message: "Order cannot be completed as it is not delivered",
        response: null,
        error: "Order cannot be completed as it is not delivered",
      });
    }

    order.orderStatus = "completed";
    await order.save();

    const buyer = order.buyerId;
    const merchantConfig = await MerchantConfig.findOne({
      merchantId: order.merchantId,
    })
      .select("storeName")
      .lean();

    const dynamicData = {
      userName: buyer?.firstName + " " + buyer?.lastName,
      storeName: merchantConfig?.storeName,
      to_email: buyer?.email,
    };
    await sendMail(
      configs.templates.orderCompletedNotificationBuyer,
      dynamicData
    );

    return res.status(200).json({
      message: "Order completed successfully",
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
  getAllOrders,
  getScheduledOrders,
  getOrderDetails,
  acceptOrder,
  cancelOrder,
  prepareOrder,
  readyOrder,
  completeOrder,
};
