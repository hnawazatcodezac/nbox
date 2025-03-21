function variantValidation(req, res, next) {
  if (req.body.variants && typeof req.body.variants === "string") {
    try {
      req.body.variants = JSON.parse(req.body.variants);

      if (!Array.isArray(req.body.variants)) {
        return res.status(403).json({
          message: "Invalid format",
          error: {
            variants: ["Variants must be an array"],
          },
        });
      }
    } catch (error) {
      return res.status(403).json({
        message: "Invalid format",
        error: {
          variants: ["Variants must be a valid JSON string"],
        },
      });
    }
  }

  const optionType = req.body.optionType;
  if (optionType === "single") {
    if (req.body.variants && req.body.variants.length > 1) {
      return res.status(403).json({
        message: "Invalid format",
        error: {
          variants: [
            "When option type is 'single', only one variant is allowed",
          ],
        },
      });
    } else if (
      req.body.optionRequired === "true" &&
      req.body?.variants?.length !== 1
    ) {
      return res.status(403).json({
        message: "Invalid format",
        error: {
          variants: [
            "When option required field is true then atleast one variant is required",
          ],
        },
      });
    }
  } else if (optionType === "multiple") {
    if (req.body.variants && req.body.variants.length < 2) {
      return res.status(403).json({
        message: "Invalid format",
        error: {
          variants: [
            "When option type is 'multiple', more than one variant is required",
          ],
        },
      });
    }
  }

  next();
}

module.exports = variantValidation;
