const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: function (req, file, cb) {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/svg+xml",
      "model/gltf-binary",
      "model/gltf+json",
      "model/vnd.gltf+json",
      "application/octet-stream",
      "model/3d+json",
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      req.fileValidationError =
        "Unsupported file type. Allowed types: JPEG, JPG, PNG, SVG, GLB, GLTF, and other 3D/AR file formats";
      cb(null, false);
    }
  },
});

const validateFile = (functionName) => {
  return (req, res, next) => {
    if (req.fileValidationError) {
      return res.status(400).json({ message: req.fileValidationError });
    }

    if (functionName === "createStore") {
      if (!req.file) {
        return res.status(400).json({ message: "Image is required" });
      }
    }

    if (functionName === "createProduct") {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "Image is required" });
      }
    }

    if (functionName === "updateProduct" && !req.body.oldImages) {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "Image is required" });
      }
    }

    next();
  };
};

module.exports = {
  upload,
  validateFile,
};
