require("dotenv").config();
const express = require("express");
const app = express();

const createTables = require("./config/schema");

app.use(express.json());

app.use("/api", require("./routes"));

createTables();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});