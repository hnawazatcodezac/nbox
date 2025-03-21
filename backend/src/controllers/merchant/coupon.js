const Coupon = require("../../models/coupon");

const createCoupon = async (req, res) => {
  try {
    const {
      name,
      description,
      active,
      couponType,
      minimumRequirement,
      discountValue,
      usageLimit,
      startDate,
      endDate,
    } = req.body;

    const existingCoupon = await Coupon.findOne({ name });
    if (existingCoupon) {
      return res.status(409).json({
        message: "Coupon with this name already exists",
        response: null,
        error: "Coupon with this name already exists",
      });
    }

    const formattedCouponType = couponType.replace(/ /g, "_");
    const newCoupon = new Coupon({
      name,
      description,
      active,
      couponType: formattedCouponType,
      minimumRequirement: minimumRequirement || null,
      discountValue: discountValue || null,
      usageLimit,
      startDate,
      endDate,
    });

    await newCoupon.save();

    return res.status(201).json({
      message: "Coupon created successfully",
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
  createCoupon,
};
