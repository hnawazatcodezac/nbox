require("dotenv").config();

const mongoDbUrl = process.env.MONGODB_URL;
const zitadelCodeVerifier = process.env.ZITADEL_CODE_VERIFIER;

const backendBaseUrl = process.env.BACKEND_BASE_URL;
const frontendBaseUrl = process.env.FRONTEND_BASE_URL;
const zitadelInstanceUrl = process.env.ZITADEL_INSTANCE_URL;
const organizationId = process.env.ORGANIZATION_RESOURCE_ID;
const projectId = process.env.PROJECT_RESOURCE_ID;
const applicationClientId = process.env.WEB_APPLICATION_CLIENT_ID;
const redirectUri = process.env.REDIRECT_URI;

const serviceUserClientSecret = process.env.SERVICE_USER_CLIENT_SECRET;
const serviceUserPersonalAccessToken =
  process.env.SERVICE_PERSONAL_ACCESS_TOKEN;

const apiClientId = process.env.API_APPLICATION_CLIENT_ID;
const apiClientSecret = process.env.API_APPLICATION_CLIENT_SECRET;

const bucketName = process.env.AWS_BUCKET_NAME;
const awsAccessKey = process.env.AWS_ACCESS_KEY_ID;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const awsRegion = process.env.AWS_REGION;

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

const roles = {
  buyer: "buyer",
  manager: "manager",
  merchant: "merchant",
};

const configurations = {
  mongoDbUrl,
  zitadelCodeVerifier,
  roles,
  frontendBaseUrl,
  backendBaseUrl,
  zitadelInstanceUrl,
  organizationId,
  projectId,
  applicationClientId,
  redirectUri,
  serviceUserClientSecret,
  serviceUserPersonalAccessToken,
  apiClientId,
  apiClientSecret,
  awsRegion,
  bucketName,
  awsAccessKey,
  awsSecretAccessKey,
  stripeSecretKey,
};

module.exports = {
  configurations,
};
