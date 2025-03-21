const { labelSchema, labelParamsSchema } = require("./joi/merchant/label");
const {
  categorySchema,
  categoryParamsSchema,
} = require("./joi/merchant/category");

const {
  userAddressSchema,
  addressParamsSchema,
} = require("./joi/user/address");
const { languageUpdateSchema } = require("./joi/user/setting");

const {
  productQuerySchema,
  productParamsSchema,
  createProductSchema,
  updateProductSchema,
  updateAvailabilitySchema,
} = require("./joi/merchant/product");

const {
  orderQuerySchema,
  orderParamsSchema,
  prepareOrderBodySchema,
} = require("./joi/merchant/order");

const {
  buyerRegisterSchema,
  merchantRegisterSchema,
  verifyEmailSchema,
  profileUpdateSchema,
  passwordUpdateSchema,
} = require("./joi/user/auth");

const { searchQuerySchema, searchParamsSchema } = require("./joi/buyer/search");

const { storeQuerySchema, storeParamsSchema } = require("./joi/buyer/store");

const { settingSchema } = require("./joi/merchant/setting");

const {
  cartParamsSchema,
  createCartItemSchema,
  updateCartItemSchema,
  deleteCartParamsSchema,
} = require("./joi/buyer/cart");

const {
  createOrderParamsSchema,
  getOrderParamsSchema,
  orderBodySchema,
} = require("./joi/buyer/order");

const { reviewBodySchema, reviewParamsSchema } = require("./joi/buyer/review");

const {
  couponBodySchema,
  couponParamsSchema,
  couponStatusBodySchema,
} = require("./joi/admin/coupon");

module.exports = {
  buyerRegisterSchema,
  merchantRegisterSchema,
  verifyEmailSchema,
  profileUpdateSchema,
  passwordUpdateSchema,
  productQuerySchema,
  productParamsSchema,
  createProductSchema,
  updateProductSchema,
  categorySchema,
  categoryParamsSchema,
  labelSchema,
  labelParamsSchema,
  updateAvailabilitySchema,
  orderQuerySchema,
  orderParamsSchema,
  prepareOrderBodySchema,
  userAddressSchema,
  addressParamsSchema,
  languageUpdateSchema,
  searchQuerySchema,
  searchParamsSchema,
  storeQuerySchema,
  storeParamsSchema,
  settingSchema,
  cartParamsSchema,
  createCartItemSchema,
  updateCartItemSchema,
  deleteCartParamsSchema,
  createOrderParamsSchema,
  getOrderParamsSchema,
  orderBodySchema,
  reviewBodySchema,
  reviewParamsSchema,
  couponBodySchema,
  couponParamsSchema,
  couponStatusBodySchema,
};
