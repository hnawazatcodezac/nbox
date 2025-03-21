const mongoose = require("mongoose");
const Address = require("../../models/address");

const getAddresses = async (req, res) => {
  const { userId } = req.decoded;

  try {
    const addresses = await Address.find(
      { userId },
      {
        city: 1,
        state: 1,
        postalCode: 1,
        country: 1,
        address: 1,
        landmark: 1,
        addressType: 1,
        isDefault: 1,
        "addressLongLat.coordinates": 1,
        "landmarkLongLat.coordinates": 1,
      }
    ).sort({ createdAt: -1 });

    if (addresses.length < 1) {
      return res.status(404).json({
        message: "No data found",
        response: null,
        error: "No data found",
      });
    }

    return res.status(200).json({
      message: "Addresses retrieved successfully",
      response: { data: addresses },
      error: null,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      response: null,
      error: error?.response?.data || error.message,
    });
  }
};

const createAddress = async (req, res) => {
  const { userId } = req.decoded;
  const {
    city,
    state,
    postalCode,
    country,
    address,
    addressLatitude,
    addressLongitude,
    landmark,
    landmarkLatitude,
    landmarkLongitude,
    addressType,
    isDefault,
  } = req.body;

  try {
    if (isDefault) {
      await Address.updateMany(
        { userId, isDefault: true },
        { $set: { isDefault: false } }
      );
    }

    const newAddress = new Address({
      userId,
      address,
      city,
      state,
      postalCode,
      country,
      addressLongLat: {
        type: "Point",
        coordinates: [addressLongitude, addressLatitude],
      },
      landmark,
      landmarkLongLat: {
        type: "Point",
        coordinates: [landmarkLongitude, landmarkLatitude],
      },
      addressType,
      isDefault,
    });
    await newAddress.save();

    return res.status(201).json({
      message: "Address created successfully",
      response: null,
      error: null,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      response: null,
      error: error?.response?.data || error.message,
    });
  }
};

const updateAddress = async (req, res) => {
  const { userId } = req.decoded;
  const { addressId } = req.params;
  const {
    city,
    state,
    postalCode,
    country,
    address,
    addressLatitude,
    addressLongitude,
    landmark,
    landmarkLatitude,
    landmarkLongitude,
    addressType,
    isDefault,
  } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(400).json({
        message: "Invalid address ID",
        response: null,
        error: "Invalid address ID",
      });
    }

    const addressExist = await Address.findOne({ _id: addressId, userId });
    if (!addressExist) {
      return res.status(404).json({
        message: "Address not found",
        response: null,
        error: "Address not found",
      });
    }

    if (isDefault) {
      await Address.updateMany(
        { userId, isDefault: true },
        { $set: { isDefault: false } }
      );
    }

    await Address.updateOne(
      { _id: addressId },
      {
        $set: {
          address,
          city,
          state,
          postalCode,
          country,
          addressLongLat: {
            type: "Point",
            coordinates: [addressLongitude, addressLatitude],
          },
          landmark,
          landmarkLongLat: {
            type: "Point",
            coordinates: [landmarkLongitude, landmarkLatitude],
          },
          addressType,
          isDefault,
        },
      },
      { runValidators: true }
    );

    return res.status(200).json({
      message: "Address updated successfully",
      response: null,
      error: null,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      response: null,
      error: error?.response?.data || error.message,
    });
  }
};

const updateAddressDefault = async (req, res) => {
  const { userId } = req.decoded;
  const { addressId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(400).json({
        message: "Invalid address ID",
        response: null,
        error: "Invalid address ID",
      });
    }

    const addressExist = await Address.findOne(
      { _id: addressId, userId },
      "isDefault"
    );
    if (!addressExist) {
      return res.status(404).json({
        message: "Address not found",
        response: null,
        error: "Address not found",
      });
    }
    if (addressExist.isDefault) {
      return res.status(200).json({
        message: "Address is already set as the default",
        response: null,
        error: null,
      });
    }

    await Address.updateMany(
      { userId, isDefault: true },
      { $set: { isDefault: false } }
    );

    await Address.updateOne({ _id: addressId }, { $set: { isDefault: true } });

    return res.status(200).json({
      message: "Default address updated successfully",
      response: null,
      error: null,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      response: null,
      error: error?.response?.data || error.message,
    });
  }
};

const deleteAddress = async (req, res) => {
  const { userId } = req.decoded;
  const { addressId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(400).json({
        message: "Invalid address ID",
        response: null,
        error: "Invalid address ID",
      });
    }

    const deletedAddress = await Address.findOneAndDelete({
      _id: addressId,
      userId,
    });

    if (!deletedAddress) {
      return res.status(404).json({
        message: "Address not found",
        response: null,
        error: "Address not found",
      });
    }

    return res.status(200).json({
      message: "Address deleted successfully",
      response: null,
      error: null,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      response: null,
      error: error?.response?.data || error.message,
    });
  }
};

module.exports = {
  getAddresses,
  createAddress,
  updateAddress,
  updateAddressDefault,
  deleteAddress,
};
