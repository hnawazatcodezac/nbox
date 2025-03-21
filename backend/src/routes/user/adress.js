const { Router } = require("express");
const router = Router();
const {
  getAddresses,
  createAddress,
  updateAddress,
  updateAddressDefault,
  deleteAddress,
} = require("../../controllers/user/adress.js");
const { bodyValidator, paramsValidator } = require("../../middlewares/joi.js");
const { verifyToken } = require("../../middlewares/authMiddleware.js");

router.get("/address", verifyToken, getAddresses);
router.post(
  "/address",
  verifyToken,
  bodyValidator("userAddressSchema"),
  createAddress
);
router.put(
  "/address/:addressId",
  verifyToken,
  paramsValidator("addressParamsSchema"),
  bodyValidator("userAddressSchema"),
  updateAddress
);
router.put(
  "/address/:addressId/default",
  verifyToken,
  paramsValidator("addressParamsSchema"),
  updateAddressDefault
);
router.delete(
  "/address/:addressId",
  verifyToken,
  paramsValidator("addressParamsSchema"),
  deleteAddress
);

module.exports = router;
