const jwt = require("jsonwebtoken");
const axios = require("axios");
const getPublicKey = require("../utils/getPublicKey");
const { configurations } = require("../config/config");
const User = require("../models/user");

const verifyToken = async (req, res, next) => {
  let token = req.headers["authorization"];
  if (token) {
    try {
      token = token.replace("Bearer ", "");
      const decodedHeader = jwt.decode(token, { complete: true });
      const kid = decodedHeader.header.kid;
      const publicKey = await getPublicKey(kid);
      const decodedToken = jwt.verify(token, publicKey, {
        algorithms: ["RS256"],
      });
      const currentTime = Math.floor(Date.now() / 1000);
      if (decodedToken.exp < currentTime) {
        return res.status(401).json({
          message: "Invalid token or expired",
          response: null,
          error: "jwt expired",
        });
      }

      const rolesFromProject =
        decodedToken[
          `urn:zitadel:iam:org:project:${configurations.projectId}:roles`
        ];
      const roles = rolesFromProject ? Object.keys(rolesFromProject) : [];

      const user = await User.findOne(
        { email: decodedToken.email },
        "accessToken zitadelId email"
      );
      if (!user) {
        return res.status(404).json({
          message: "User not found",
          response: null,
          error: "User not found",
        });
      }
      const introspectionResponse = await axios.post(
        `${configurations.zitadelInstanceUrl}/oauth/v2/introspect`,
        new URLSearchParams({
          token: user.accessToken,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization:
              "Basic " +
              Buffer.from(
                configurations.apiClientId +
                  ":" +
                  configurations.apiClientSecret
              ).toString("base64"),
          },
        }
      );
      const accessTokenData = introspectionResponse?.data;

      if (!accessTokenData?.active) {
        return res.status(401).json({
          message: "Invalid token or expired",
          response: null,
          error: "jwt expired",
        });
      }

      if (accessTokenData?.exp < currentTime) {
        return res.status(401).json({
          message: "Invalid token or expired",
          response: null,
          error: "jwt expired",
        });
      }

      req.decoded = {
        userId: user._id,
        zitadelId: user.zitadelId,
        role: roles[0],
        email: user.email,
      };

      next();
    } catch (err) {
      console.error("Token verification error:", err.message);
      return res.status(400).json({
        message: "Invalid or expired token",
        response: null,
        error: "jwt expired",
      });
    }
  } else {
    return res.status(401).json({
      message: "Access denied",
      response: null,
      error: "Access denied, authentication token missing",
    });
  }
};

const verifyBuyerToken = async (req, res, next) => {
  let token = req.headers["authorization"];
  if (token) {
    try {
      token = token.replace("Bearer ", "");
      const decodedHeader = jwt.decode(token, { complete: true });
      const kid = decodedHeader.header.kid;
      const publicKey = await getPublicKey(kid);
      const decodedToken = jwt.verify(token, publicKey, {
        algorithms: ["RS256"],
      });
      const currentTime = Math.floor(Date.now() / 1000);
      if (decodedToken.exp < currentTime) {
        return res.status(401).json({
          message: "Invalid token or expired",
          response: null,
          error: "jwt expired",
        });
      }

      const rolesFromProject =
        decodedToken[
          `urn:zitadel:iam:org:project:${configurations.projectId}:roles`
        ];
      const roles = rolesFromProject ? Object.keys(rolesFromProject) : [];

      if (!roles.includes("buyer")) {
        return res.status(403).json({
          message: "User does not have the required role",
          response: null,
          error: "Access denied",
        });
      }

      const user = await User.findOne(
        { email: decodedToken.email },
        "accessToken zitadelId email"
      );
      if (!user) {
        return res.status(404).json({
          message: "User not found",
          response: null,
          error: "User not found",
        });
      }
      const introspectionResponse = await axios.post(
        `${configurations.zitadelInstanceUrl}/oauth/v2/introspect`,
        new URLSearchParams({
          token: user.accessToken,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization:
              "Basic " +
              Buffer.from(
                configurations.apiClientId +
                  ":" +
                  configurations.apiClientSecret
              ).toString("base64"),
          },
        }
      );
      const accessTokenData = introspectionResponse?.data;

      if (!accessTokenData?.active) {
        return res.status(401).json({
          message: "Invalid token or expired",
          response: null,
          error: "jwt expired",
        });
      }

      if (accessTokenData?.exp < currentTime) {
        return res.status(401).json({
          message: "Invalid token or expired",
          response: null,
          error: "jwt expired",
        });
      }

      req.decoded = {
        userId: user._id,
        zitadelId: user.zitadelId,
        role: roles[0],
        email: user.email,
      };

      next();
    } catch (err) {
      console.error("Token verification error:", err.message);
      return res.status(400).json({
        message: "Invalid or expired token",
        response: null,
        error: "jwt expired",
      });
    }
  } else {
    return res.status(401).json({
      message: "Access denied",
      response: null,
      error: "Access denied, authentication token missing",
    });
  }
};

const verifyMerchantToken = async (req, res, next) => {
  let token = req.headers["authorization"];
  if (token) {
    try {
      token = token.replace("Bearer ", "");
      const decodedHeader = jwt.decode(token, { complete: true });
      const kid = decodedHeader.header.kid;
      const publicKey = await getPublicKey(kid);
      const decodedToken = jwt.verify(token, publicKey, {
        algorithms: ["RS256"],
      });
      const currentTime = Math.floor(Date.now() / 1000);
      if (decodedToken.exp < currentTime) {
        return res.status(401).json({
          message: "Invalid token or expired",
          response: null,
          error: "jwt expired",
        });
      }

      const rolesFromProject =
        decodedToken[
          `urn:zitadel:iam:org:project:${configurations.projectId}:roles`
        ];
      const roles = rolesFromProject ? Object.keys(rolesFromProject) : [];

      if (!roles.includes("merchant")) {
        return res.status(403).json({
          message: "User does not have the required role",
          response: null,
          error: "Access denied",
        });
      }

      const user = await User.findOne(
        { email: decodedToken.email },
        "accessToken zitadelId email"
      );
      if (!user) {
        return res.status(404).json({
          message: "User not found",
          response: null,
          error: "User not found",
        });
      }
      const introspectionResponse = await axios.post(
        `${configurations.zitadelInstanceUrl}/oauth/v2/introspect`,
        new URLSearchParams({
          token: user.accessToken,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization:
              "Basic " +
              Buffer.from(
                configurations.apiClientId +
                  ":" +
                  configurations.apiClientSecret
              ).toString("base64"),
          },
        }
      );
      const accessTokenData = introspectionResponse?.data;

      if (!accessTokenData?.active) {
        return res.status(401).json({
          message: "Invalid token or expired",
          response: null,
          error: "jwt expired",
        });
      }

      if (accessTokenData?.exp < currentTime) {
        return res.status(401).json({
          message: "Invalid token or expired",
          response: null,
          error: "jwt expired",
        });
      }

      req.decoded = {
        userId: user._id,
        zitadelId: user.zitadelId,
        role: roles[0],
        email: user.email,
      };

      next();
    } catch (err) {
      console.error("Token verification error:", err.message);
      return res.status(400).json({
        message: "Invalid or expired token",
        response: null,
        error: "jwt expired",
      });
    }
  } else {
    return res.status(401).json({
      message: "Access denied",
      response: null,
      error: "Access denied, authentication token missing",
    });
  }
};

module.exports = {
  verifyToken,
  verifyBuyerToken,
  verifyMerchantToken,
};
