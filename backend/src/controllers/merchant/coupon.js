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

const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({})
      .select(
        "_id name description active couponType minimumRequirement discountValue startDate endDate usageLimit usageCount"
      )
      .sort({ createdAt: -1 })
      .lean();
    if (coupons.length === 0) {
      return res.status(404).json({
        message: "No coupons found",
        response: null,
        error: "No coupons found",
      });
    }

    const updatedCoupons = coupons?.map((coupon) => ({
      ...coupon,
      couponType: coupon.couponType.replace(/_/g, " "),
    }));

    const data = {
      data: updatedCoupons,
    };
    return res.status(200).json({
      message: "Coupons retrieved successfully",
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

const getCouponDetails = async (req, res) => {
  const { couponId } = req.params;
  try {
    const coupon = await Coupon.findById(couponId).select(
      "_id name description active couponType minimumRequirement discountValue startDate endDate usageLimit usageCount"
    );
    if (!coupon) {
      return res.status(404).json({
        message: "Coupon not found",
        response: null,
        error: "Coupon not found",
      });
    }

    coupon.couponType = coupon?.couponType.replace(/_/g, " ");
    const data = {
      data: coupon,
    };
    return res.status(200).json({
      message: "Coupon retrieved successfully",
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
  createCoupon,
  getCoupons,
  getCouponDetails,
};
