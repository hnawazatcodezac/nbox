const Label = require("../../models/label");

const createLabel = async (req, res) => {
  const { userId } = req.decoded;
  const { enName, frName } = req.body;

  try {
    const existingLabel = await Label.findOne({
      userId,
      $or: [{ enName }, { frName }],
    });
    if (existingLabel) {
      return res.status(409).json({
        message: "Label already exists",
        response: null,
        error: "Duplicate label",
      });
    }

    const newLabel = new Label({
      userId,
      enName,
      frName,
    });
    await newLabel.save();

    return res.status(201).json({
      message: "Label created successfully",
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

const getLabels = async (req, res) => {
  const { userId } = req.decoded;

  try {
    const labels = await Label.find({ userId }, "_id enName frName").sort({
      sort: 1,
    });

    if (labels.length < 1) {
      return res.status(404).json({
        message: "No data found",
        response: null,
        error: "No data found",
      });
    }

    const data = {
      data: labels,
    };
    return res.status(200).json({
      message: "Labels fetched successfully",
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

const updateLabel = async (req, res) => {
  const { userId } = req.decoded;
  const { labelId } = req.params;
  const { enName, frName, sort } = req.body;

  try {
    const existingLabel = await Label.findOne({
      _id: labelId,
      userId,
    });
    if (!existingLabel) {
      return res.status(404).json({
        message: "Label not found",
        response: null,
        error: "Label not found",
      });
    }

    const duplicateLabel = await Label.findOne({
      userId,
      _id: { $ne: labelId },
      $or: [{ enName }, { frName }],
    });
    if (duplicateLabel) {
      return res.status(409).json({
        message: "Label with this name already exists",
        response: null,
        error: "Label with this name already exists",
      });
    }

    await Label.findByIdAndUpdate(
      labelId,
      { enName, frName, sort },
      { new: true }
    );

    return res.status(200).json({
      message: "Label updated successfully",
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

const deleteLabel = async (req, res) => {
  const { userId } = req.decoded;
  const { labelId } = req.params;

  try {
    const label = await Label.findOneAndDelete({
      _id: labelId,
      userId,
    });

    if (!label) {
      return res.status(404).json({
        message: "No label found",
        response: null,
        error: "No label found",
      });
    }

    return res.status(200).json({
      message: "Label deleted successfully",
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
  createLabel,
  getLabels,
  updateLabel,
  deleteLabel,
};
