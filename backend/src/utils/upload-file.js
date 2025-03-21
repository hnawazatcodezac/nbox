const { configurations } = require("../config/config.js");
const { s3 } = require("../config/s3.js");

const bucketName = configurations.bucketName;

const uploadFilesS3 = async (documentFiles, folderName) => {
  const uploadedFileUrls = [];

  for (let i = 0; i < documentFiles.length; i++) {
    const documentFile = documentFiles[i];
    const originalFileName = documentFile?.originalname;
    const file_extension = originalFileName?.split(".").pop();
    const fileNameWithoutExtension = originalFileName?.replace(
      `.${file_extension}`,
      ""
    );
    const currentDate = new Date()
      .toISOString()
      .slice(0, 19)
      ?.replace(/-/g, "");
    const fileName = `${folderName}-images/${fileNameWithoutExtension}_${currentDate}_${i}.${file_extension}`;

    const params = {
      Bucket: bucketName,
      Key: fileName,
      Body: documentFile.buffer,
      ContentType: documentFile?.mimetype,
    };

    await s3.putObject(params).promise();
    const fileUrl = `https://${bucketName}.s3.amazonaws.com/${fileName}`;
    uploadedFileUrls.push(fileUrl);
  }

  return uploadedFileUrls;
};

const deleteFilesS3 = async (deleteFileUrls) => {
  for (let i = 0; i < deleteFileUrls?.length; i++) {
    const deletedFile = deleteFileUrls[i];

    const key = deletedFile.replace(
      `https://${bucketName}.s3.amazonaws.com/`,
      ""
    );
    const deleteParams = {
      Bucket: bucketName,
      Key: key,
    };
    await s3.deleteObject(deleteParams).promise();
  }
  return true;
};

module.exports = {
  uploadFilesS3,
  deleteFilesS3,
};
