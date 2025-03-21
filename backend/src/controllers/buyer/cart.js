const Cart = require("../../models/cart");
const User = require("../../models/user");
const Product = require("../../models/product");
const MerchantConfig = require("../../models/merchantConfig");

const getAllStoresCarts = async (req, res) => {
  const { userId } = req.decoded;

  try {
    const carts = await Cart.find({ buyerId: userId }).populate({
      path: "cartItems.productId",
      select: "price enName frName images variants",
    });

    if (!carts.length) {
      return res.status(404).json({
        message: "No cart items found",
        response: null,
        error: "No cart items found",
      });
    }

    let data = {};
    if (carts.length > 1) {
      const allCarts = await Promise.all(
        carts.map(async (cart) => {
          const items = cart.cartItems.map((cartItem) => {
            const { quantity, productId, variantId } = cartItem;
            let price = productId.price;
            let variantDetails = null;

            if (variantId) {
              variantDetails = productId?.variants?.find((v) =>
                v._id.equals(variantId)
              );
              if (variantDetails) {
                price = variantDetails.price;
              }
            }

            return { subTotal: price * quantity };
          });

          const totalPrice = parseFloat(
            items
              .reduce((sum, item) => sum + item.price * item.quantity, 0)
              .toFixed(2)
          );

          const totalCartItems = cart.cartItems.length;

          const storeDetails = await MerchantConfig.findOne({
            merchantId: cart.merchantId,
          })
            .select("storeName storeImage")
            .lean();

          if (!storeDetails) {
            return null;
          }

          return {
            cartId: cart._id,
            merchantId: cart.merchantId,
            storeName: storeDetails?.storeName,
            storeImage: storeDetails?.storeImage,
            totalPrice,
            totalCartItems,
          };
        })
      );

      const totalItems = allCarts.reduce(
        (sum, cart) => sum + cart.totalCartItems,
        0
      );

      data = {
        data: {
          carts: allCarts,
          totalItems,
        },
      };
    } else {
      const cartItems = carts[0].cartItems.map((item) => {
        let price = item.productId.price;
        let enVariantName = null;
        let frVariantName = null;

        if (item.variantId) {
          const variant = item.productId?.variants?.find((v) =>
            v._id.equals(item.variantId)
          );

          if (variant) {
            price = variant.price;
            enVariantName = variant.enVariantName;
            frVariantName = variant.frVariantName;
          }
        }

        return {
          merchantId: carts[0].merchantId,
          productId: item.productId._id,
          variantId: item.variantId,
          enName: item.productId.enName,
          frName: item.productId.frName,
          enVariantName: enVariantName || undefined,
          frVariantName: frVariantName || undefined,
          price,
          images: item.productId.images,
          quantity: item.quantity,
        };
      });

      const totalPrice = parseFloat(
        cartItems
          .reduce((sum, item) => sum + item.price * item.quantity, 0)
          .toFixed(2)
      );
      const totalCartItems = cartItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      data = {
        data: {
          cartItems,
          totalPrice,
          totalCartItems,
        },
      };
    }

    return res.status(200).json({
      message: "Items retrieved successfully",
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

const getStoreCartItems = async (req, res) => {
  const { userId } = req.decoded;
  const { merchantId } = req.params;

  try {
    const merchant = await User.findById(merchantId).select("role");
    if (!merchant || merchant.role !== "merchant") {
      return res.status(404).json({
        message: "Merchant not found",
        response: null,
        error: "Merchant not found",
      });
    }

    const cart = await Cart.findOne({ buyerId: userId, merchantId }).populate({
      path: "cartItems.productId",
      select: "enName frName price images variants",
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart items not found",
        response: null,
        error: "Cart items not found",
      });
    }

    const cartItems = cart.cartItems.map((item) => {
      let price = item.productId.price;
      let enVariantName = null;
      let frVariantName = null;

      if (item.variantId) {
        const variant = item.productId.variants.find((v) =>
          v._id.equals(item.variantId)
        );

        if (variant) {
          price = variant.price;
          enVariantName = variant.enVariantName;
          frVariantName = variant.frVariantName;
        }
      }

      return {
        merchantId: cart.merchantId,
        productId: item.productId._id,
        variantId: item.variantId,
        enName: item.productId.enName,
        frName: item.productId.frName,
        enVariantName: enVariantName || undefined,
        frVariantName: frVariantName || undefined,
        price,
        images: item.productId.images,
        quantity: item.quantity,
      };
    });

    const totalPrice = parseFloat(
      cartItems
        .reduce((sum, item) => sum + item.price * item.quantity, 0)
        .toFixed(2)
    );
    const totalCartItems = cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    const data = {
      data: {
        cartItems,
        totalPrice,
        totalCartItems,
      },
    };

    return res.status(200).json({
      message: "Items retrieved successfully",
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

const createCartItem = async (req, res) => {
  const { userId } = req.decoded;
  const { merchantId } = req.params;
  const { productId, variantId, quantity } = req.body;

  try {
    const merchant = await User.findById(merchantId).select("role");
    if (!merchant || merchant.role !== "merchant") {
      return res.status(404).json({
        message: "Merchant not found",
        response: null,
        error: "Merchant not found",
      });
    }

    const product = await Product.findOne({
      _id: productId,
      merchantId,
      status: { $ne: "in-active" },
    }).lean();
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
        response: null,
        error: "Product not found",
      });
    }

    if (variantId) {
      const variant = product?.variants?.find((v) => v?._id?.equals(variantId));
      if (!variant) {
        return res.status(400).json({
          message: "Invalid variant selected",
          response: null,
          error: "Invalid variant selected",
        });
      }
    }

    let cart = await Cart.findOne({ buyerId: userId, merchantId });
    if (!cart) {
      await Cart.create({
        buyerId: userId,
        merchantId,
        cartItems: [{ productId, variantId, quantity }],
      });
    } else {
      const productIndex = cart.cartItems?.findIndex((item) =>
        item.productId.equals(productId)
      );

      if (productIndex > -1) {
        cart.cartItems[productIndex].variantId = variantId;
        cart.cartItems[productIndex].quantity = quantity;
      } else {
        cart.cartItems.push({ productId, variantId, quantity });
      }

      await cart.save();
    }

    return res.status(201).json({
      message: "Item added to cart successfully",
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

const updateCartItem = async (req, res) => {
  const { userId } = req.decoded;
  const { merchantId } = req.params;
  const { productId, variantId, quantity } = req.body;

  try {
    const cart = await Cart.findOne({ buyerId: userId, merchantId });
    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
        response: null,
        error: "Cart not found",
      });
    }

    const product = await Product.findOne({
      _id: productId,
      merchantId,
    }).lean();

    if (variantId) {
      const variant = product?.variants?.find((v) => v?._id?.equals(variantId));
      if (!variant) {
        return res.status(400).json({
          message: "Invalid variant selected",
          response: null,
          error: "Invalid variant selected",
        });
      }
    }

    const productIndex = cart.cartItems?.findIndex((item) =>
      item.productId.equals(productId)
    );
    if (productIndex === -1) {
      return res.status(404).json({
        message: "Product not found in cart",
        response: null,
        error: "Product not found in cart",
      });
    }

    if (quantity === 0) {
      cart.cartItems.splice(productIndex, 1);
    } else {
      cart.cartItems[productIndex].quantity = quantity;
      cart.cartItems[productIndex].variantId = variantId;
    }

    if (cart.cartItems.length === 0) {
      await Cart.findByIdAndDelete(cart._id);
    } else {
      await cart.save();
    }

    return res.status(200).json({
      message: "Cart updated successfully",
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

const deleteCartItem = async (req, res) => {
  const { userId } = req.decoded;
  const { cartId } = req.params;

  try {
    const cart = await Cart.findOneAndDelete({ _id: cartId, buyerId: userId });
    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
        response: null,
        error: "Cart not found",
      });
    }

    return res.status(200).json({
      message: "Cart deleted successfully",
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

const validateCheckoutItems = async (req, res) => {
  const { userId } = req.decoded;
  const { merchantId } = req.params;

  try {
    const merchant = await User.findById(merchantId).select("role");
    if (!merchant || merchant.role !== "merchant") {
      return res.status(404).json({
        message: "Merchant not found",
        response: null,
        error: "Merchant not found",
      });
    }

    const cart = await Cart.findOne({ buyerId: userId, merchantId }).populate({
      path: "cartItems.productId",
      select:
        "enName price availability status inventory maxQuantity minQuantity",
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart items not found",
        response: null,
        error: "Cart items not found",
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

    return res.status(200).json({
      message: "Cart validation successful",
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

const getCartDetails = async (req, res) => {
  const { userId } = req.decoded;
  const { merchantId } = req.params;

  try {
    const merchant = await User.findById(merchantId).select("role");
    if (!merchant || merchant.role !== "merchant") {
      return res.status(404).json({
        message: "Merchant not found",
        response: null,
        error: "Merchant not found",
      });
    }

    const cart = await Cart.findOne({ buyerId: userId, merchantId }).populate({
      path: "cartItems.productId",
      select: "enName frName price images variants",
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
        response: null,
        error: "Cart not found",
      });
    }

    const cartItems = cart.cartItems.map((item) => {
      let price = item.productId.price;
      let enVariantName = null;
      let frVariantName = null;

      if (item.variantId) {
        const variant = item.productId?.variants?.find((v) =>
          v._id?.equals(item.variantId)
        );

        if (variant) {
          price = variant.price;
          enVariantName = variant.enVariantName;
          frVariantName = variant.frVariantName;
        }
      }

      return {
        productId: item.productId._id,
        variantId: item.variantId,
        enName: item.productId.enName,
        frName: item.productId.frName,
        enVariantName: enVariantName || undefined,
        frVariantName: frVariantName || undefined,
        price,
        images: item.productId.images,
        quantity: item.quantity,
      };
    });

    const totalPrice = cartItems
      .reduce((sum, item) => sum + item.price * item.quantity, 0)
      .toFixed(2);

    const storeDetails = await MerchantConfig.findOne({ merchantId })
      .select("storeName storeImage deliverySettings")
      .lean();

    if (!storeDetails) {
      return res.status(404).json({
        message: "Store details not found",
        response: null,
        error: "Store details not found",
      });
    }

    const deliveryFee = storeDetails.deliverySettings?.fixedCharges || 0;
    const grandTotal = (parseFloat(totalPrice) + deliveryFee).toFixed(2);

    const data = {
      data: {
        cartId: cart._id,
        storeName: storeDetails?.storeName,
        storeImage: storeDetails?.storeImage,
        cartItems,
        subtotal: totalPrice,
        deliveryFee,
        grandTotal,
      },
    };

    return res.status(200).json({
      message: "Items retrieved successfully",
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
  getAllStoresCarts,
  getStoreCartItems,
  createCartItem,
  updateCartItem,
  deleteCartItem,
  validateCheckoutItems,
  getCartDetails,
};
