const mongoose = require("mongoose");
const User = require("../../models/user");
const Address = require("../../models/address");
const Product = require("../../models/product");

const getAllStores = async (req, res) => {
  const maxRadius = 500;
  const { userId } = req.decoded;
  const { lat, long } = req.query;

  try {
    let userCoords;

    if (lat && long) {
      userCoords = [parseFloat(long), parseFloat(lat)];
    } else {
      const userCoordinates = await Address.findOne({
        userId,
      }).sort({ isDefault: -1, updatedAt: -1 });

      if (!userCoordinates || !userCoordinates.addressLongLat) {
        return res.status(404).json({
          message: "User address not found",
          response: null,
          error: "User address not found",
        });
      }
      userCoords = userCoordinates.addressLongLat.coordinates;
    }

    const merchantData = await Address.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: userCoords },
          distanceField: "distance",
          spherical: true,
          key: "addressLongLat",
          maxDistance: maxRadius * 1000,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "merchant",
        },
      },
      { $unwind: "$merchant" },
      { $match: { "merchant.role": "merchant" } },
      {
        $sort: {
          "merchant.role": 1,
          isDefault: -1,
          updatedAt: -1,
        },
      },
      {
        $group: {
          _id: "$userId",
          merchantId: { $first: "$userId" },
          distance: { $first: "$distance" },
        },
      },
      {
        $lookup: {
          from: "merchant_configs",
          localField: "merchantId",
          foreignField: "merchantId",
          as: "merchantConfig",
        },
      },
      {
        $unwind: { path: "$merchantConfig" },
      },
      {
        $lookup: {
          from: "categories",
          localField: "merchantId",
          foreignField: "userId",
          as: "categories",
        },
      },
      {
        $lookup: {
          from: "reviews",
          localField: "merchantId",
          foreignField: "merchantId",
          as: "reviews",
        },
      },
      {
        $addFields: {
          averageRating: {
            $cond: {
              if: { $gt: [{ $size: "$reviews" }, 0] },
              then: { $avg: "$reviews.rating" },
              else: 0,
            },
          },
        },
      },
      {
        $project: {
          merchantId: 1,
          storeName: "$merchantConfig.storeName",
          storeImage: "$merchantConfig.storeImage",
          storeCustomText: "$merchantConfig.storeCustomText",
          distance: { $round: [{ $divide: ["$distance", 1000] }, 2] },
          averageRating: { $round: ["$averageRating", 1] },
          categories: {
            $map: {
              input: "$categories",
              as: "category",
              in: {
                enName: "$$category.enName",
                frName: "$$category.frName",
              },
            },
          },
          deliveryTime: {
            $cond: {
              if: "$merchantConfig.deliverySettings.displayDeliveryTime",
              then: "$merchantConfig.deliverySettings.deliveryTime",
              else: "$$REMOVE",
            },
          },
          deliveryCharges: {
            $cond: {
              if: {
                $eq: ["$merchantConfig.deliverySettings.deliveryType", "fixed"],
              },
              then: "$merchantConfig.deliverySettings.fixedCharges",
              else: "$$REMOVE",
            },
          },
        },
      },
      {
        $sort: {
          distance: 1,
        },
      },
    ]);

    if (merchantData.length < 1) {
      return res.status(404).json({
        message: "Stores not found",
        response: null,
        error: "Stores not found",
      });
    }

    const data = {
      data: merchantData,
    };

    return res.status(200).json({
      message: "Stores fetched successfully",
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

const getAllProducts = async (req, res) => {
  const { userId } = req.decoded;
  const { lat, long } = req.query;
  const { merchantId } = req.params;

  try {
    let userCoords;
    let merchantIdObj;

    if (!mongoose.Types.ObjectId.isValid(merchantId)) {
      return res.status(400).json({
        message: "Store is invalid",
        response: null,
        error: "Store is invalid",
      });
    } else {
      merchantIdObj = new mongoose.Types.ObjectId(merchantId);
    }

    const merchant = await User.findOne({
      _id: merchantId,
      role: "merchant",
    });
    if (!merchant) {
      return res.status(404).json({
        message: "Store not found",
        response: null,
        error: "Store not found",
      });
    }

    if (lat && long) {
      userCoords = [parseFloat(long), parseFloat(lat)];
    } else {
      const userCoordinates = await Address.findOne({
        userId,
      }).sort({ isDefault: -1, updatedAt: -1 });

      if (!userCoordinates || !userCoordinates.addressLongLat) {
        return res.status(404).json({
          message: "User address not found",
          response: null,
          error: "User address not found",
        });
      }
      userCoords = userCoordinates.addressLongLat.coordinates;
    }

    const storeData = await Address.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: userCoords },
          distanceField: "distance",
          spherical: true,
          key: "addressLongLat",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "merchant",
        },
      },
      { $unwind: "$merchant" },
      {
        $match: {
          "merchant.role": "merchant",
          "merchant._id": merchantIdObj,
        },
      },
      {
        $group: {
          _id: "$userId",
          merchantId: { $first: "$userId" },
          distance: { $first: "$distance" },
        },
      },
      {
        $lookup: {
          from: "merchant_configs",
          localField: "merchantId",
          foreignField: "merchantId",
          as: "merchantConfig",
        },
      },
      {
        $unwind: { path: "$merchantConfig" },
      },
      {
        $lookup: {
          from: "categories",
          localField: "merchantId",
          foreignField: "userId",
          as: "categories",
        },
      },
      {
        $lookup: {
          from: "reviews",
          localField: "merchantId",
          foreignField: "merchantId",
          as: "reviews",
        },
      },
      {
        $addFields: {
          averageRating: {
            $cond: {
              if: { $gt: [{ $size: "$reviews" }, 0] },
              then: { $avg: "$reviews.rating" },
              else: 0,
            },
          },
        },
      },
      {
        $project: {
          storeName: "$merchantConfig.storeName",
          storeImage: "$merchantConfig.storeImage",
          storeCustomText: "$merchantConfig.storeCustomText",
          distance: { $round: [{ $divide: ["$distance", 1000] }, 2] },
          averageRating: { $round: ["$averageRating", 1] },
          categories: {
            $map: {
              input: "$categories",
              as: "category",
              in: {
                enName: "$$category.enName",
                frName: "$$category.frName",
              },
            },
          },
          deliveryTime: {
            $cond: {
              if: "$merchantConfig.deliverySettings.displayDeliveryTime",
              then: "$merchantConfig.deliverySettings.deliveryTime",
              else: "$$REMOVE",
            },
          },
          deliveryCharges: {
            $cond: {
              if: {
                $eq: ["$merchantConfig.deliverySettings.deliveryType", "fixed"],
              },
              then: "$merchantConfig.deliverySettings.fixedCharges",
              else: "$$REMOVE",
            },
          },
        },
      },
    ]);

    const products = await Product.aggregate([
      {
        $match: {
          merchantId: merchantIdObj,
          status: { $ne: "in-active" },
        },
      },
      { $unwind: "$categories" },
      {
        $lookup: {
          from: "categories",
          localField: "categories",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      { $unwind: "$categoryDetails" },
      {
        $group: {
          _id: "$categoryDetails._id",
          categoryEnName: { $first: "$categoryDetails.enName" },
          categoryFrName: { $first: "$categoryDetails.frName" },
          products: {
            $push: {
              _id: "$_id",
              enName: "$enName",
              frName: "$frName",
              enDescription: "$enDescription",
              frDescription: "$frDescription",
              price: "$price",
              compareAtPrice: "$compareAtPrice",
              availability: "$availability",
              images: "$images",
            },
          },
        },
      },
      {
        $project: {
          categoryEnName: 1,
          categoryFrName: 1,
          products: {
            $sortArray: {
              input: "$products",
              sortBy: { price: 1 },
            },
          },
        },
      },
    ]);

    if (!products.length) {
      return res.status(404).json({
        message: "Products not found",
        response: null,
        error: "Products not found",
      });
    }

    const productData = {
      store: storeData,
      products: products,
    };

    const data = {
      data: productData,
    };
    return res.status(200).json({
      message: "Store products returned successfully",
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
  getAllStores,
  getAllProducts,
};
