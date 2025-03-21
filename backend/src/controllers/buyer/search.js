const mongoose = require("mongoose");
const Address = require("../../models/address");
const Product = require("../../models/product");

const globalSearch = async (req, res) => {
  const maxRadius = 500;
  const { userId } = req.decoded;
  const { search, lat, long } = req.query;

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

    const searchedStores = await Address.aggregate([
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
      { $unwind: "$merchantConfig" },
      {
        $match: {
          "merchantConfig.storeName": { $regex: search, $options: "i" },
        },
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
          merchantId: "$merchantId",
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

    const searchedProducts = await Product.find({
      status: { $ne: "in-active" },
      $or: [
        { enName: { $regex: search, $options: "i" } },
        { frName: { $regex: search, $options: "i" } },
        { enDescription: { $regex: search, $options: "i" } },
        { frDescription: { $regex: search, $options: "i" } },
      ],
    })
      .sort({ price: 1 })
      .select(
        "merchantId enName frName enDescription frDescription price images availability"
      );

    if (searchedStores.length < 1 && searchedProducts.length < 1) {
      return res.status(404).json({
        message: "Stores and products not found",
        response: null,
        error: "Stores and products not found",
      });
    }

    const responseData = {
      products: searchedProducts.length > 0 ? searchedProducts : undefined,
      stores: searchedStores.length > 0 ? searchedStores : undefined,
    };

    const data = {
      data: responseData,
    };
    return res.status(200).json({
      message: "Searched stores and products returned successfully",
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

const getStoreSearchProducts = async (req, res) => {
  try {
    const { search } = req.query;
    const { merchantId } = req.params;
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

    const products = await Product.aggregate([
      {
        $match: {
          merchantId: merchantIdObj,
          status: { $ne: "in-active" },
          $or: [
            { enName: { $regex: search, $options: "i" } },
            { frName: { $regex: search, $options: "i" } },
            { enDescription: { $regex: search, $options: "i" } },
            { frDescription: { $regex: search, $options: "i" } },
          ],
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "categories",
          foreignField: "_id",
          as: "categories",
        },
      },
      { $unwind: "$categories" },
      {
        $group: {
          _id: "$categories._id",
          categoryEnName: { $first: "$categories.enName" },
          categoryFrName: { $first: "$categories.frName" },
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
    ]);

    if (products.length < 1) {
      return res.status(404).json({
        message: "Products not found",
        response: null,
        error: "Products not found",
      });
    }

    const data = {
      data: products,
    };
    return res.status(200).json({
      message: "Searched store products returned successfully",
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
  globalSearch,
  getStoreSearchProducts,
};
