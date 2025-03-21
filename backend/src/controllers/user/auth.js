const axios = require("axios");
const uuid = require("uuid");
const crypto = require("crypto");
const { configurations } = require("../../config/config");
const User = require("../../models/user");
const UserSetting = require("../../models/userSetting");
const MerchantConfig = require("../../models/merchantConfig");
const { uploadFilesS3 } = require("../../utils/upload-file");

const registerBuyer = async (req, res) => {
  const { firstName, lastName, email, phoneNumber, password } = req.body;
  const role = "buyer";
  const userId = uuid.v4();

  try {
    const data = JSON.stringify({
      userId,
      username: `${email}`,
      organization: {
        orgId: configurations.organizationId,
      },
      profile: {
        givenName: firstName,
        familyName: lastName,
        nickName: "",
        displayName: `${firstName} ${lastName}`,
        preferredLanguage: "en",
        gender: "GENDER_UNSPECIFIED",
      },
      email: {
        email: email,
        sendCode: {
          urlTemplate: `${configurations.frontendBaseUrl}/verify?userID={{.UserID}}&code={{.Code}}&role=${role}`,
        },
      },
      phone: {
        phone: phoneNumber,
        isVerified: true,
      },
      password: {
        password: password,
        changeRequired: false,
      },
    });

    const config = {
      method: "post",
      url: `${configurations.zitadelInstanceUrl}/v2/users/human`,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${configurations.serviceUserPersonalAccessToken}`,
      },
      data: data,
    };
    await axios(config);

    const roleAssignmentData = JSON.stringify({
      projectId: `${configurations.projectId}`,
      roleKeys: [role],
    });
    const roleConfig = {
      method: "post",
      url: `${configurations.zitadelInstanceUrl}/management/v1/users/${userId}/grants`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${configurations.serviceUserPersonalAccessToken}`,
      },
      data: roleAssignmentData,
    };
    await axios(roleConfig);

    return res.status(201).json({
      message:
        "Signup successful! Please check your email to verify your account",
      response: null,
      error: null,
    });
  } catch (error) {
    if (
      error?.response?.data?.message?.includes("Errors.User.AlreadyExisting") ||
      error?.response?.data?.message?.includes("User already exists")
    ) {
      return res.status(409).json({
        message: "User already exists",
        response: null,
        error: "User already exists",
      });
    }

    return res.status(500).json({
      message: "Internal Server Error",
      response: null,
      error: error?.response?.data || error.message,
    });
  }
};

const registerMerchant = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    password,
    storeName,
    companyWebsite,
    orderPerMonth,
    businessType,
  } = req.body;

  const role = "merchant";
  const userId = uuid.v4();
  const uploadedImageUrls = await uploadFilesS3([req.file], "store");

  const metadata = [
    {
      key: "storeName",
      value: Buffer.from(storeName).toString("base64"),
    },
    {
      key: "companyWebsite",
      value: companyWebsite
        ? Buffer.from(companyWebsite).toString("base64")
        : null,
    },
    {
      key: "orderPerMonth",
      value: orderPerMonth
        ? Buffer.from(orderPerMonth.toString()).toString("base64")
        : null,
    },
    {
      key: "businessType",
      value: Buffer.from(businessType).toString("base64"),
    },
    {
      key: "storeImage",
      value: Buffer.from(uploadedImageUrls[0]).toString("base64"),
    },
  ].filter((item) => item.value !== null);

  try {
    const data = JSON.stringify({
      userId,
      username: `${email}`,
      organization: {
        orgId: configurations.organizationId,
      },
      profile: {
        givenName: firstName,
        familyName: lastName,
        nickName: "",
        displayName: `${firstName} ${lastName}`,
        preferredLanguage: "en",
        gender: "GENDER_UNSPECIFIED",
      },
      email: {
        email: email,
        sendCode: {
          urlTemplate: `${configurations.frontendBaseUrl}/verify?userID={{.UserID}}&code={{.Code}}&role=${role}`,
        },
      },
      phone: {
        phone: phoneNumber,
        isVerified: true,
      },
      password: {
        password: password,
        changeRequired: false,
      },
      metadata: metadata,
    });

    const config = {
      method: "post",
      url: `${configurations.zitadelInstanceUrl}/v2/users/human`,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${configurations.serviceUserPersonalAccessToken}`,
      },
      data: data,
    };
    await axios(config);

    const roleAssignmentData = JSON.stringify({
      projectId: `${configurations.projectId}`,
      roleKeys: [role],
    });
    const roleConfig = {
      method: "post",
      url: `${configurations.zitadelInstanceUrl}/management/v1/users/${userId}/grants`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${configurations.serviceUserPersonalAccessToken}`,
      },
      data: roleAssignmentData,
    };
    await axios(roleConfig);

    return res.status(201).json({
      message:
        "Signup successful! Please check your email to verify your account",
      response: null,
      error: null,
    });
  } catch (error) {
    if (
      error?.response?.data?.message?.includes("Errors.User.AlreadyExisting") ||
      error?.response?.data?.message?.includes("User already exists")
    ) {
      return res.status(409).json({
        message: "User already exists",
        response: null,
        error: "User already exists",
      });
    }

    return res.status(500).json({
      message: "Internal Server Error",
      response: null,
      error: error?.response?.data || error.message,
    });
  }
};

const loginUser = async (req, res) => {
  const role = req.query.role;
  const codeChallenge = crypto
    .createHash("sha256")
    .update(configurations.zitadelCodeVerifier)
    .digest("base64url");

  const state = Buffer.from(
    JSON.stringify({ role: role || "default" })
  ).toString("base64");

  const authUrl = `${
    configurations.zitadelInstanceUrl
  }/oauth/v2/authorize?response_type=code&client_id=${
    configurations.applicationClientId
  }&redirect_uri=${encodeURIComponent(
    configurations.redirectUri
  )}&scope=${encodeURIComponent(
    `openid profile email phone urn:zitadel:iam:user:metadata urn:zitadel:iam:org:project:id:${configurations.projectId}:aud`
  )}&code_challenge=${codeChallenge}&code_challenge_method=S256&state=${state}&prompt=login`;

  return res.status(200).json({
    message: "User authenticated successfully",
    data: authUrl,
    error: null,
  });
};

const callback = async (req, res) => {
  const { code, state } = req.body;

  try {
    const decodedState = JSON.parse(
      Buffer.from(state, "base64").toString("utf8")
    );

    const tokenResponse = await axios.post(
      `${configurations.zitadelInstanceUrl}/oauth/v2/token`,
      new URLSearchParams({
        client_id: configurations.applicationClientId,
        grant_type: "authorization_code",
        code,
        redirect_uri: configurations.redirectUri,
        code_verifier: encodeURIComponent(configurations.zitadelCodeVerifier),
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    const accessToken = tokenResponse.data.access_token;
    const idToken = tokenResponse.data.id_token;

    const userInfoResponse = await axios.get(
      `${configurations.zitadelInstanceUrl}/oidc/v1/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const userInfo = userInfoResponse.data;
    const rolesKey = `urn:zitadel:iam:org:project:${configurations.projectId}:roles`;
    const rolesData = userInfo[rolesKey];
    const roles = rolesData ? Object.keys(rolesData) : [];

    let user;
    if (decodedState.role === "buyer") {
      user = await User.findOne(
        { email: userInfo.email, role: "buyer" },
        "accessToken"
      );
    } else if (decodedState.role === "merchant") {
      user = await User.findOne(
        { email: userInfo.email, role: "merchant" },
        "accessToken"
      );
    }
    if (!user) {
      await axios.post(
        `${configurations.zitadelInstanceUrl}/oauth/v2/revoke`,
        new URLSearchParams({
          token: accessToken,
          client_id: configurations.applicationClientId,
          client_secret: configurations.serviceUserClientSecret,
        }).toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      return res.status(404).json({
        message: "User could not found",
        reponse: null,
        error: "User could not found",
      });
    }

    if (user?.accessToken) {
      await axios.post(
        `${configurations.zitadelInstanceUrl}/oauth/v2/revoke`,
        new URLSearchParams({
          token: user?.accessToken,
          client_id: configurations.applicationClientId,
          client_secret: configurations.serviceUserClientSecret,
        }).toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
    }
    await User.updateOne(
      { email: userInfo.email },
      { $set: { accessToken: accessToken } }
    );

    const userSettings = await UserSetting.findOne(
      { userId: user._id },
      "language"
    );

    const data = {
      firstName: userInfo.given_name,
      lastName: userInfo.family_name,
      email: userInfo.email,
      phoneNumber: userInfo?.phone_number || "",
      language: userSettings?.language,
      role: roles[0],
    };

    return res.status(200).json({
      message: "User logged in successfully",
      response: {
        token: idToken,
        data,
      },
      error: null,
    });
  } catch (error) {
    if (error?.response?.data?.error === "invalid_request") {
      return res.status(400).json({
        message: "Login failed! Invalid request",
        response: null,
        error: "Login failed! Invalid request",
      });
    }
    return res.status(500).json({
      message: "Internal Server Error",
      response: null,
      error: error?.response?.data || error.message,
    });
  }
};

const googleCallback = async (req, res) => {
  try {
    const { userId, state } = req.body;
    const decodedState = JSON.parse(
      Buffer.from(state, "base64").toString("utf8")
    );

    const roleAssignmentData = JSON.stringify({
      projectId: `${configurations.projectId}`,
      roleKeys: [decodedState.role],
    });
    const roleConfig = {
      method: "post",
      url: `${configurations.zitadelInstanceUrl}/management/v1/users/${userId}/grants`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${configurations.serviceUserPersonalAccessToken}`,
      },
      data: roleAssignmentData,
    };
    await axios(roleConfig);

    const userConfig = {
      method: "get",
      url: `${configurations.zitadelInstanceUrl}/management/v1/users/${userId}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${configurations.serviceUserPersonalAccessToken}`,
      },
    };
    const userResponse = await axios(userConfig);
    const user = userResponse?.data?.user?.human;

    const newUser = new User({
      zitadelId: userId,
      firstName: user?.profile?.firstName,
      lastName: user?.profile?.lastName,
      email: user?.email?.email,
      phoneNumber: user?.phone?.phone,
      role: decodedState.role,
    });
    await newUser.save();

    const userConfiguration = new UserSetting({
      userId: newUser._id,
      language: "en",
    });
    await userConfiguration.save();

    return res.status(200).json({
      message: "User authenticated successfully",
      response: null,
      error: null,
    });
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({
        message: "User not found",
        response: null,
        error: "User not found",
      });
    }

    return res.status(500).json({
      message: "Internal Server Error",
      response: null,
      error: err?.response?.data || err.message,
    });
  }
};

const verifyEmail = async (req, res) => {
  const { userId, code } = req.body;
  try {
    const data = JSON.stringify({
      verificationCode: code,
    });

    const config = {
      method: "post",
      url: `${configurations.zitadelInstanceUrl}/v2/users/${userId}/email/verify`,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${configurations.serviceUserPersonalAccessToken}`,
      },
      data: data,
    };
    await axios(config);

    const userConfig = {
      method: "get",
      url: `${configurations.zitadelInstanceUrl}/management/v1/users/${userId}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${configurations.serviceUserPersonalAccessToken}`,
      },
    };
    const userResponse = await axios(userConfig);
    const user = userResponse?.data?.user?.human;

    const userRoleConfig = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${configurations.zitadelInstanceUrl}/management/v1/users/grants/_search`,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${configurations.serviceUserPersonalAccessToken}`,
      },
      data: JSON.stringify({
        queries: [{ userIdQuery: { userId: userId } }],
      }),
    };
    const userRoleResponse = await axios(userRoleConfig);
    const userRole = userRoleResponse?.data?.result[0]?.roleKeys[0];

    const newUser = new User({
      zitadelId: userId,
      firstName: user?.profile?.firstName,
      lastName: user?.profile?.lastName,
      email: user?.email?.email,
      phoneNumber: user?.phone?.phone,
      role: userRole,
    });
    await newUser.save();

    const userConfiguration = new UserSetting({
      userId: newUser._id,
      language: "en",
    });
    await userConfiguration.save();

    if (userRole === "merchant") {
      const metadataConfig = {
        method: "POST",
        url: `${configurations.zitadelInstanceUrl}/management/v1/users/${userId}/metadata/_search`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${configurations.serviceUserPersonalAccessToken}`,
        },
      };
      const metadataResponse = await axios(metadataConfig);
      const metadataObject = {};
      metadataResponse?.data?.result?.forEach((item) => {
        metadataObject[item.key] = Buffer.from(item.value, "base64").toString(
          "utf-8"
        );
      });

      const newMerchantConfig = new MerchantConfig({
        merchantId: newUser._id,
        storeName: metadataObject?.storeName,
        storeImage: metadataObject?.storeImage,
        companyWebsite: metadataObject?.companyWebsite,
        orderPerMonth: metadataObject?.orderPerMonth,
        businessType: metadataObject?.businessType,
      });
      await newMerchantConfig.save();
    }

    return res.status(200).json({
      message: "Email verified successfully",
      response: null,
      error: null,
    });
  } catch (error) {
    if (error.response?.status === 400) {
      return res.status(400).json({
        message: "Invalid verification code",
        response: null,
        error: "Invalid verification code",
      });
    } else if (error.response?.status === 404) {
      return res.status(404).json({
        message: "User not found",
        response: null,
        error: "User not found",
      });
    }
    return res.status(500).json({
      message: "Internal Server Error",
      response: null,
      error: error?.response?.data || error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  const { userId, zitadelId } = req.decoded;

  const { firstName, lastName, phoneNumber } = req.body;

  try {
    const data = JSON.stringify({
      profile: {
        givenName: firstName,
        familyName: lastName,
        displayName: `${firstName} ${lastName}`,
        gender: "GENDER_UNSPECIFIED",
      },
      phone: {
        phone: phoneNumber ? `+${phoneNumber}` : undefined,
        isVerified: true,
      },
    });

    const config = {
      method: "put",
      url: `${configurations.zitadelInstanceUrl}/v2/users/human/${zitadelId}`,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${configurations.serviceUserPersonalAccessToken}`,
      },
      data: data,
    };
    const response = await axios(config);
    if (response.status !== 200) {
      return res.status(500).json({
        message: "Failed to update profile. Please try again",
        response: null,
        error: "Failed to update profile. Please try again",
      });
    }

    await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, phoneNumber },
      { new: true }
    );

    const profile = {
      firstName,
      lastName,
      phoneNumber,
    };

    return res.status(200).json({
      message: "Profile updated successfully",
      response: { data: profile },
      error: null,
    });
  } catch (error) {
    if (error.response?.status === 400) {
      return res.status(400).json({
        message: error.response?.data?.details[0]?.message,
        response: null,
        error: error.response?.data?.details[0]?.message,
      });
    }

    return res.status(500).json({
      message: "Internal Server Error",
      response: null,
      error: error?.response?.data || error.message,
    });
  }
};

const updatePassword = async (req, res) => {
  const { zitadelId } = req.decoded;
  const { currentPassword, newPassword } = req.body;

  try {
    const data = JSON.stringify({
      newPassword: {
        password: newPassword,
        changeRequired: false,
      },
      currentPassword: currentPassword,
    });
    const config = {
      method: "post",
      url: `${configurations.zitadelInstanceUrl}/v2/users/${zitadelId}/password`,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${configurations.serviceUserPersonalAccessToken}`,
      },
      data: data,
    };
    const response = await axios(config);

    if (response.status !== 200) {
      return res.status(401).json({
        message: "Failed to update password. Please try again",
        response: null,
        error: "Failed to update password. Please try again",
      });
    }

    return res.status(200).json({
      message: "Password updated successfully",
      response: null,
      error: null,
    });
  } catch (error) {
    if (error.response?.status === 400) {
      if (error.response?.data?.details[0]?.message === "Password is invalid") {
        return res.status(400).json({
          message: "Current password does not match",
          response: null,
          error: "Current password does not match",
        });
      } else {
        return res.status(400).json({
          message: error.response?.data?.details[0]?.message,
          response: null,
          error: error.response?.data?.details[0]?.message,
        });
      }
    }

    return res.status(500).json({
      message: "Internal Server Error",
      response: null,
      error: error?.response?.data || error.message,
    });
  }
};

const logout = async (req, res) => {
  const { email, accessToken } = req.decoded;

  try {
    await axios.post(
      `${configurations.zitadelInstanceUrl}/oauth/v2/revoke`,
      new URLSearchParams({
        token: accessToken,
        client_id: configurations.applicationClientId,
        client_secret: configurations.serviceUserClientSecret,
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    await User.updateOne({ email }, { $set: { accessToken: null } });

    return res.status(200).json({
      message: "User logged out successfully",
      reponse: null,
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
  registerBuyer,
  registerMerchant,
  loginUser,
  callback,
  googleCallback,
  verifyEmail,
  updateProfile,
  updatePassword,
  logout,
};
