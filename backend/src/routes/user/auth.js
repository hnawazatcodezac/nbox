const { Router } = require("express");
const router = Router();
const {
  registerBuyer,
  registerMerchant,
  loginUser,
  callback,
  googleCallback,
  verifyEmail,
  updateProfile,
  updatePassword,
  logout,
} = require("../../controllers/user/auth.js");
const { bodyValidator } = require("../../middlewares/joi.js");
const { verifyToken } = require("../../middlewares/authMiddleware.js");
const { getAccessToken } = require("../../middlewares/accessToken.js");
const { upload, validateFile } = require("../../middlewares/fileValidation.js");

router.post(
  "/buyer-register",
  bodyValidator("buyerRegisterSchema"),
  registerBuyer
);
router.post(
  "/merchant-register",
  upload.single("storeImage"),
  validateFile("createStore"),
  bodyValidator("merchantRegisterSchema"),
  registerMerchant
);
router.get("/login", loginUser);
router.post("/callback", callback);
router.post("/google-callback", googleCallback);
router.post("/verify-email", bodyValidator("verifyEmailSchema"), verifyEmail);
router.put(
  "/profile",
  bodyValidator("profileUpdateSchema"),
  verifyToken,
  updateProfile
);
router.put(
  "/password",
  bodyValidator("passwordUpdateSchema"),
  verifyToken,
  updatePassword
);
router.post("/logout", verifyToken, getAccessToken, logout);

module.exports = router;
