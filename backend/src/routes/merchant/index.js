const express = require("express");
const router = express.Router();

const labelRoutes = require("./label");
const couponRoutes = require("./coupon");
const orderRoutes = require("./order");
const settingRoutes = require("./setting");
const categoryRoutes = require("./category");
const reviewRoutes = require("./review");
const productRoutes = require("./product");

router.use("/order", orderRoutes);
router.use("/coupon", couponRoutes);
router.use("/product", productRoutes);
router.use("/setting", settingRoutes);
router.use("/category", categoryRoutes);
router.use("/review", reviewRoutes);
router.use("/label", labelRoutes);

module.exports = router;
