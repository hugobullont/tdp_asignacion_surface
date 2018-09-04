"use strict";

const bodyParser = require("body-parser");
const express = require("express");
const request = require("request");

const app = express();

var dbx;

var accesstoken = "";

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.listen(3030, function() {
  console.log("Dropbox App listengin on port 3030!");
});

app.get("/", function(req, res) {
  res.render("permission");
});

app.post("/auth", function(req, res) {
  const authUrl =
    "https://www.dropbox.com/oauth2/authorize?response_type=code&client_id=s8ofpmn7nzknc7k&redirect_uri=http://localhost:3030/dropbox";
  res.redirect(authUrl);
});

app.get("/dropbox", function(req, res) {
  const code = req.query.code;
  console.log(code);
  getDropboxToken(code);
  dbx = new Dropbox({ accessToken: accesstoken });
});

function getDropboxToken(code) {
  request.post(
    "https://api.dropboxapi.com/oauth2/token",
    {
      json: true,
      form: {
        code: code,
        grant_type: "authorization_code",
        client_id: "s8ofpmn7nzknc7k",
        client_secret: "qm9ihdekecjzztv",
        redirect_uri: "http://localhost:3030/dropbox"
      }
    },
    function(error, response, body) {
      if (!error && response.statusCode == 200) {
        accesstoken = body.access_token;
        console.log(accesstoken);
      } else {
        console.log(error);
      }
    }
  );
}
