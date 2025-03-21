const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const { Mongoose } = require("./src/config/database");
const buyerRoutes = require("./src/routes/buyer/index");
const merchantRoutes = require("./src/routes/merchant/index");
const userRoutes = require("./src/routes/user/index");
const port = process.env.PORT || 3001;
const version = process.env.API_VERSION;

const app = express();
app.use(
  cors({
    credentials: true,
    origin: "*",
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());

app.use(`/api/${version}/user`, userRoutes);
app.use(`/api/${version}/buyer`, buyerRoutes);
app.use(`/api/${version}/merchant`, merchantRoutes);

app.use(`/api/${version}/ping`, (req, res) => {
  return res.jsonp("It works");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
