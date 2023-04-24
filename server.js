const express = require("express");
const cors = require("cors");
const sqlserver = require("./connection/mysql");
const router = require("./router/router");
const bodyParser = require("body-parser");
const app = express();
require("dotenv").config();

const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};
console.log("dskn")
app.use(express.json());
app.use(bodyParser.json());
app.use(cors(corsOptions));
app.use(router);

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});