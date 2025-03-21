const AWS = require("aws-sdk");
const { S3Client } = require("@aws-sdk/client-s3");
const { configurations } = require("./config");

AWS.config.update({
  accessKeyId: configurations.awsAccessKey,
  secretAccessKey: configurations.awsSecretAccessKey,
  region: configurations.awsRegion,
});
const s3 = new AWS.S3();

const s3Client = new S3Client({
  region: configurations.awsRegion,
  credentials: {
    accessKeyId: configurations.awsAccessKey,
    secretAccessKey: configurations.awsSecretAccessKey,
  },
});

module.exports = {
  s3,
  s3Client,
};
