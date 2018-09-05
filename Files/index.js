const express = require("express");

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));

const googleDrive = require("./provider/googleDrive");
app.use("/", googleDrive);

app.listen(3000, function() {
  console.log("Listening on port 3000!");
});
