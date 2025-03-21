const express = require("express");
const router = express.Router();

const cartRoutes = require("./cart");
const orderRoutes = require("./order");
const storeRoutes = require("./store");
const searchRoutes = require("./search");
const reviewRoutes = require("./review");
const productRoutes = require("./product");

router.use("/cart", cartRoutes);
router.use("/order", orderRoutes);
router.use("/store", storeRoutes);
router.use("/search", searchRoutes);
router.use("/review", reviewRoutes);
router.use("/product", productRoutes);

module.exports = router;
