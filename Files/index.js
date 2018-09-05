const express = require("express");
const googleDrive = require("./cloud_provider/googleDrive");
const dropbox = require("./cloud_provider/dropbox");
const oneDrive = require("./cloud_provider/oneDrive");

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));

app.use("/", googleDrive);
app.use("/", dropbox);
app.use("/", oneDrive);

app.listen(3000, function() {
  console.log("Listening on port 3000!");
});
