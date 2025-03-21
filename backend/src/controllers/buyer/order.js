const Stripe = require("stripe");
const Cart = require("../../models/cart.js");
const User = require("../../models/user.js");
const Order = require("../../models/order.js");
const Address = require("../../models/address.js");
const Product = require("../../models/product.js");
const MerchantConfig = require("../../models/merchantConfig");
const { configurations } = require("../../config/config.js");
const { configs } = require("../../config/email-config.js");
const { sendMail } = require("../../utils/sendMail.js");

const stripe = Stripe(configurations.stripeSecretKey);

const createCheckout = async (req, res) => {
  const { cartId } = req.params;
  const { addressId, scheduleTime } = req.body;

  try {
    const cart = await Cart.findById(cartId).populate({
      path: "cartItems.productId",
      select:
        "enName frName price variants availability status inventory maxQuantity minQuantity",
    });
    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
        response: null,
        error: "Cart not found",
      });
    }

    for (const item of cart.cartItems) {
      if (!item.productId) {
        return res.status(404).json({
          message:
            "Some products in the cart have been removed or are unavailable",
          response: null,
          error:
            "Some products in the cart have been removed or are unavailable",
        });
      }
      const inventory = item.productId.inventory;
      const maxQuantity = item.productId.maxQuantity;
      const minQuantity = item.productId.minQuantity;
      const availability = item.productId.availability;
      const status = item.productId.status;

      if (status !== "active") {
        return res.status(400).json({
          message: `Product ${item.productId.enName} is not active`,
          response: null,
          error: `Product ${item.productId.enName} is not active`,
        });
      }
      if (availability !== "in-stock") {
        return res.status(400).json({
          message: `Product ${item.productId.enName} is not available`,
          response: null,
          error: `Product ${item.productId.enName} is not available`,
        });
      }
      if (inventory < item?.quantity) {
        return res.status(400).json({
          message: `Oops! We don't have enough stock for your order. You can buy up to ${inventory} units`,
          response: null,
          error: `Oops! We don't have enough stock for your order. You can buy up to ${inventory} units`,
        });
      }
      if (maxQuantity && item.quantity > maxQuantity) {
        return res.status(400).json({
          message: `Quantity exceeds maximum limit for product ${item.productId.enName}`,
          response: null,
          error: `Quantity exceeds maximum limit for product ${item.productId.enName}`,
        });
      }
      if (minQuantity && item.quantity < minQuantity) {
        return res.status(400).json({
          message: `Quantity is less than minimum limit for product ${item.productId.enName}`,
          response: null,
          error: `Quantity is less than minimum limit for product ${item.productId.enName}`,
        });
      }
    }

    const userAddress = await Address.findById(addressId).select("_id").lean();
    if (!userAddress) {
      return res.status(404).json({
        message: "Address not found",
        response: null,
        error: "Address not found",
      });
    }

    const subtotal = cart.cartItems.reduce((sum, item) => {
      let price = item.productId.price;

      if (item.variantId) {
        const variant = item.productId.variants.find((v) =>
          v._id.equals(item.variantId)
        );
        if (variant) {
          price = variant.price;
        }
      }

      return sum + (price * item.quantity).toFixed(2);
    }, 0);

    const storeDetails = await MerchantConfig.findOne({
      merchantId: cart.merchantId,
    })
      .select("deliverySettings businessHours")
      .lean();

    if (!storeDetails) {
      return res.status(404).json({
        message: "Store details not found",
        response: null,
        error: "Store details not found",
      });
    }

    if (scheduleTime) {
      const { enabled, timings } = storeDetails.businessHours;
      if (!enabled) {
        return res.status(400).json({
          message: "Scheduling is not available for this store",
          response: null,
          error: "Scheduling is not available for this store",
        });
      } else {
        const today = new Date();
        const timeOffset = today.getTimezoneOffset() * 60000;
        const currentTime = today.getTime() - timeOffset;

        const startOfWeek = new Date(currentTime);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setUTCHours(23, 59, 59, 0);
        endOfWeek.setDate(endOfWeek.getDate() + 6);

        const scheduleTimeDate = scheduleTime.getTime() - timeOffset;
        const scheduleDate = new Date(scheduleTimeDate);
        if (scheduleDate < startOfWeek) {
          return res.status(400).json({
            message: "Scheduling is not allowed in the past",
            response: null,
            error: "Invalid schedule date",
          });
        }
        if (scheduleDate > endOfWeek) {
          return res.status(400).json({
            message: "Scheduling is only allowed within the current week",
            response: null,
            error: "Invalid schedule date",
          });
        }

        const dayName = scheduleDate.toLocaleDateString("en-US", {
          weekday: "long",
          timeZone: "UTC",
        });

        const businessDay = timings.find((t) => t.day === dayName);
        if (!businessDay) {
          return res.status(400).json({
            message: "Store will be closed on the selected day",
            response: null,
            error: "Store will be closed on the selected day",
          });
        }

        const convertTo24HourFormat = (timeStr) => {
          const [time, period] = timeStr.split(" ");
          let [hours, minutes] = time.split(":").map(Number);

          if (period === "PM" && hours !== 12) {
            hours += 12;
          } else if (period === "AM" && hours === 12) {
            hours = 0;
          }

          return { hours, minutes };
        };

        let isValidTime = false;
        businessDay.shifts.forEach((shift) => {
          const { hours: openHours, minutes: openMinutes } =
            convertTo24HourFormat(shift.open);
          const { hours: closeHours, minutes: closeMinutes } =
            convertTo24HourFormat(shift.close);

          const year = scheduleDate.getFullYear();
          const month = scheduleDate.getMonth();
          const day = scheduleDate.getDate();

          const shiftStart = new Date(
            Date.UTC(year, month, day, openHours, openMinutes, 0)
          );
          const shiftEnd = new Date(
            Date.UTC(year, month, day, closeHours, closeMinutes, 0)
          );

          if (scheduleDate >= shiftStart && scheduleDate <= shiftEnd) {
            isValidTime = true;
          }
        });

        if (!isValidTime) {
          return res.status(400).json({
            message: "Selected time is outside of business hours",
            response: null,
            error: "Selected time is outside of business hours",
          });
        }
      }
    }

    const deliveryFee = storeDetails.deliverySettings?.fixedCharges || 0;
    const grandTotal = (parseFloat(subtotal) + deliveryFee).toFixed(2);

    const cartItems = cart.cartItems.map((item) => {
      let selectedVariant = null;
      if (item?.variantId && item?.productId?.variants) {
        selectedVariant = item.productId.variants.find(
          (variant) => variant._id.toString() === item.variantId.toString()
        );
      }

      return {
        productId: item.productId._id,
        productFrName: item.productId.frName,
        productEnName: item.productId.enName,
        variantId: selectedVariant ? selectedVariant._id : undefined,
        variantFrName: selectedVariant
          ? selectedVariant.frVariantName
          : undefined,
        variantEnName: selectedVariant
          ? selectedVariant.enVariantName
          : undefined,
        price: selectedVariant ? selectedVariant.price : item.productId.price,
        quantity: item.quantity,
      };
    });

    const order = await Order.create({
      buyerId: cart.buyerId,
      merchantId: cart.merchantId,
      addressId,
      cartItems,
      orderStatus: "payment-pending",
      paymentStatus: "pending",
      subtotal,
      deliveryFee,
      grandTotal,
      transactionId: "",
      paymentDate: null,
      scheduledDate: scheduleTime || undefined,
    });
    await Cart.findByIdAndDelete(cartId);

    const lineItems = cart.cartItems.map((item) => {
      let price = item.productId.price;
      let name = `Product: ${item.productId.enName}`;

      if (item.variantId) {
        const variant = item.productId.variants.find((v) =>
          v._id.equals(item.variantId)
        );
        if (variant) {
          price = variant.price;
          name += ` - Variant: ${variant.enVariantName}`;
        }
      }

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: name,
          },
          unit_amount: Math.round(price * 100),
        },
        quantity: item.quantity,
      };
    });

    if (deliveryFee > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Delivery Fee" },
          unit_amount: Math.round(deliveryFee * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      metadata: {
        orderId: order._id.toString(),
      },
      success_url: `${configurations.frontendBaseUrl}/fetch-cart`,
      cancel_url: `${configurations.frontendBaseUrl}/fetch-cart`,
    });

    const data = {
      data: {
        sessionId: session.id,
      },
    };

    return res.status(201).json({
      message: "Checkout session created successfully",
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

const checkoutComplete = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const body = req.body;

  if (!sig) {
    return res.status(400).json({
      message: "No stripe-signature header value was provided",
      response: null,
      error: "No stripe-signature header value was provided",
    });
  }
  try {
    if (body.type === "checkout.session.completed") {
      const transactionId = body.data.object.id;
      const dateCreated = new Date(body.data.object.created * 1000);

      const existingTransaction = await Order.findOne({ transactionId });
      if (existingTransaction) {
        return res.status(409).json({
          message: "Transaction already processed",
          response: null,
          error: "Transaction already processed",
        });
      }

      const session = await stripe.checkout.sessions.retrieve(transactionId, {
        expand: ["line_items"],
      });

      const { orderId } = session.metadata;
      const status = session.payment_status;

      let scheduledDate = null;
      if (session.metadata?.scheduledDate) {
        scheduledDate = new Date(
          Number(session.metadata?.scheduledDate) * 1000
        );
        scheduledDate.setMinutes(
          scheduledDate.getMinutes() - scheduledDate.getTimezoneOffset()
        );
      }

      const order = await Order.findById(orderId)
        .populate("buyerId", "firstName lastName email")
        .populate("merchantId", "firstName lastName email");
      if (!order) {
        return res.status(404).json({
          message: "Order not found",
          response: null,
          error: "Order not found",
        });
      }

      const buyer = order.buyerId;
      const merchant = order.merchantId;
      const merchantConfig = await MerchantConfig.findOne({
        merchantId: merchant._id,
      })
        .select("storeName autoAcceptOrder minQuantityThreshold")
        .lean();

      let orderStatus = "pending";
      if (merchantConfig && merchantConfig.autoAcceptOrder) {
        orderStatus = "accepted";
      }

      order.transactionId = transactionId;
      order.orderStatus = orderStatus;
      order.paymentStatus = status === "paid" ? "paid" : "pending";
      order.paymentDate = status === "paid" ? dateCreated : null;
      order.scheduledDate = scheduledDate || undefined;
      await order.save();

      const isPending = orderStatus === "pending";
      const buyerCustomMessage =
        "Your order is now awaiting acceptance by the merchant";

      const merchantCustomMessage =
        "You have received a new order. Please review and take action on this order as soon as possible.";

      const buyerFullName = `${buyer.firstName} ${buyer.lastName}`;
      const merchantFullName = `${merchant.firstName} ${merchant.lastName}`;
      const formattedDate = dateCreated.toISOString().split("T")[0];

      const dynamicData = {
        userName: buyerFullName,
        status: isPending ? "placed" : "accepted",
        orderDate: formattedDate,
        storeName: merchantConfig.storeName,
        orderTotal: order.grandTotal,
        customMessage: isPending ? buyerCustomMessage : "",
        to_email: buyer.email,
      };
      await sendMail(configs.templates.buyerOrderNotification, dynamicData);

      const dynamicMerchantData = {
        merchantName: merchantFullName,
        userName: buyerFullName,
        status: isPending ? "placed" : "accepted",
        orderStatus: isPending ? "in pending" : "has been accepted",
        orderDate: formattedDate,
        orderTotal: order.grandTotal,
        customMessage: isPending
          ? merchantCustomMessage
          : "You have received a new order.",
        to_email: merchant.email,
      };
      await sendMail(
        configs.templates.merchantOrderNotification,
        dynamicMerchantData
      );

      let lowStockProducts = [];
      for (const item of order.cartItems) {
        const product = await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { inventory: -item.quantity } },
          { new: true }
        );

        if (product?.inventory !== undefined) {
          if (
            product.inventory > 0 &&
            product.inventory <= product.minQuantityThreshold
          ) {
            lowStockProducts.push(
              `${product.enName} (Left: ${product.inventory})`
            );
          }

          if (product.inventory === 0) {
            await Product.findByIdAndUpdate(product._id, {
              availability: "out-of-stock",
            });
          }
        }
      }

      if (lowStockProducts.length > 0) {
        const lowStockData = {
          merchantName: merchantFullName,
          productList: lowStockProducts.join(", "),
          to_email: merchant.email,
        };
        await sendMail(
          configs.templates.merchantLowStockNotification,
          lowStockData
        );
      }

      return res.status(201).json({
        message: "Order has been placed successfully",
        response: null,
        error: null,
      });
    }

    return res.status(400).json({
      message: "No body type has been matched",
      response: null,
      error: "No body type has been matched",
    });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({
      message: "Internal Server Error",
      response: null,
      error: error.message,
    });
  }
};

const getAllOrders = async (req, res) => {
  const { userId } = req.decoded;

  try {
    const orders = await Order.find({ buyerId: userId })
      .sort({ createdAt: -1 })
      .select(
        "merchantId cartItems orderStatus grandTotal orderNumber scheduledDate createdAt"
      )
      .lean();

    const responseData = orders.map(async (order) => {
      const storeData = await MerchantConfig.findOne({
        merchantId: order.merchantId,
      })
        .select("storeName")
        .lean();

      const cartItems = order.cartItems || [];

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

      return {
        orderId: order._id,
        orderStatus: order.orderStatus,
        orderNumber: order.orderNumber,
        storeName: storeData.storeName,
        orderDate: order.createdAt,
        grandTotal: order.grandTotal,
        scheduled,
        scheduledDate: scheduled ? order.scheduledDate : undefined,
        products,
      };
    });

    const orderData = await Promise.all(responseData);
    if (orderData.length < 1) {
      return res.status(404).json({
        message: "Order not found",
        response: null,
        error: "Order not found",
      });
    }

    const data = {
      data: orderData,
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

const getSingleOrder = async (req, res) => {
  const { userId } = req.decoded;
  const { orderId } = req.params;

  try {
    const order = await Order.findOne({ _id: orderId, buyerId: userId })
      .select(
        "orderNumber createdAt merchantId cartItems subtotal deliveryFee orderStatus scheduledDate grandTotal statusHistory"
      )
      .lean();

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
        response: null,
        error: "Order not found",
      });
    }

    const storeData = await MerchantConfig.findOne({
      merchantId: order.merchantId,
    })
      .select("storeName")
      .lean();

    const storeAddress = await Address.findOne({ userId: order.merchantId })
      .sort({ isDefault: -1, updatedAt: -1 })
      .select("address")
      .lean();

    const userAddress = await Address.findOne({ userId })
      .sort({ isDefault: -1, updatedAt: -1 })
      .select("address")
      .lean();

    const cartItems = order.cartItems || [];
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
        storeAddress: storeAddress.address,
        scheduled,
        scheduledDate: scheduled ? order.scheduledDate : undefined,
        statusHistory: order.statusHistory || [],
        userAddress: userAddress.address,
        products,
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        grandTotal: order.grandTotal,
      },
    };

    return res.status(200).json({
      message: "Order retrieved successfully",
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

const orderDelivered = async (req, res) => {
  const { userId } = req.decoded;
  const { orderId } = req.params;

  try {
    const order = await Order.findOne({ _id: orderId, buyerId: userId })
      .select(
        "buyerId merchantId orderStatus paymentDate grandTotal statusHistory"
      )
      .populate("buyerId", "firstName lastName")
      .populate("merchantId", "firstName lastName email");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
        response: null,
        error: "Order not found",
      });
    }

    if (order.orderStatus !== "out-for-delivery") {
      return res.status(400).json({
        message: "Order cannot be delivered as it is not out for delivery",
        response: null,
        error: "Order cannot be delivered as it is not out for delivery",
      });
    }

    order.orderStatus = "delivered";
    await order.save();

    const latestHistory = order?.statusHistory.length - 1;
    const latestStatus = order?.statusHistory[latestHistory];

    const buyer = order.buyerId;
    const merchant = order.merchantId;

    const dynamicData = {
      buyerName: buyer?.firstName + " " + buyer?.lastName,
      merchantName: merchant?.firstName + " " + merchant?.lastName,
      deliveryDate: latestStatus?.changedAt?.toISOString().split("T")[0],
      orderTotal: order?.grandTotal,
      orderId: order?._id,
      to_email: merchant?.email,
    };
    await sendMail(
      configs.templates.orderDeliveredNotificationMerchant,
      dynamicData
    );

    return res.status(200).json({
      message: "Order delivered successfully",
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

const reorder = async (req, res) => {
  const { userId } = req.decoded;
  const { orderId } = req.params;

  try {
    const order = await Order.findOne({ _id: orderId, buyerId: userId });
    if (!order) {
      return res.status(404).json({
        message: "Order not found",
        response: null,
        error: "Order not found",
      });
    }

    if (!["delivered", "completed"].includes(order.orderStatus)) {
      return res.status(400).json({
        message: "Order must be delivered for reorder",
        response: null,
        error: "Order must be delivered for reorder",
      });
    }

    const merchant = await User.findById(order.merchantId);
    if (!merchant) {
      return res.status(404).json({
        message: "Merchant not found",
        response: null,
        error: "Merchant not found",
      });
    }

    let newCartItems = [];

    for (const item of order.cartItems) {
      const product = await Product.findOne({
        _id: item.productId,
        merchantId: order.merchantId,
        status: { $ne: "in-active" },
        availability: { $ne: "out-of-stock" },
      }).lean();

      if (!product) {
        continue;
      }

      const availableQuantity = product.inventory;
      if (availableQuantity < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for product ${product.enName}`,
          response: null,
          error: `Not enough stock for product ${product.enName}`,
        });
      }

      newCartItems.push({
        productId: product._id,
        variantId: item.variantId || null,
        quantity: item.quantity,
      });
    }

    if (newCartItems.length === 0) {
      return res.status(400).json({
        message: "None of the items in this order are available for reorder",
        response: null,
        error: "None of the items in this order are available for reorder",
      });
    }

    let cart = await Cart.findOne({
      buyerId: userId,
      merchantId: order.merchantId,
    });

    if (cart) {
      cart.cartItems = newCartItems;
      await cart.save();
    } else {
      await Cart.create({
        buyerId: userId,
        merchantId: order.merchantId,
        cartItems: newCartItems,
      });
    }

    return res.status(200).json({
      message: "Cart has been created for reordered items only",
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
  createCheckout,
  checkoutComplete,
  getAllOrders,
  getSingleOrder,
  orderDelivered,
  reorder,
};
