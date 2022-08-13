const express = require("express");

const app = express();

app.get("/", function (req, res) {
  res.send("backend");
});

app.listen(4444, () => {
  console.log("running");
});
