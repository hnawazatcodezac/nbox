const express = require("express");
const router = express.Router();

const authRoutes = require("./auth");
const adressRoutes = require("./adress");
const settingRoutes = require("./setting");

router.use("/", authRoutes);
router.use("/", adressRoutes);
router.use("/", settingRoutes);

module.exports = router;
