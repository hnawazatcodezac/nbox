const mongoose = require("mongoose");
const {configurations} = require("./config");
const mongodbURL = configurations.mongoDbUrl;

mongoose
  .connect(mongodbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Mongodb connected successfully");
  })
  .catch((error) => {
    console.log("Mongodb connection error:", error);
  });

module.exports = mongoose;
