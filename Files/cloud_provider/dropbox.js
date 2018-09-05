const express = require("express");
const dropboxV2Api = require("dropbox-v2-api");
const Dropbox = require("dropbox").Dropbox;

const CLIENT_ID = "gcne4yp34yo4tcr";
const CLIENT_SECRET = "v26c0f5n88q3r8y";
const REDIRECT_URL = "http://localhost:3000/dropbox/oauthcallback";

const dropboxOauth2Client = dropboxV2Api.authenticate({
  client_id: CLIENT_ID,
  client_secret: CLIENT_SECRET,
  redirect_uri: REDIRECT_URL
});

var dropbox = null;

const router = express.Router();

router.route("/dropbox").get(function(req, res) {
  const authUrl = dropboxOauth2Client.generateAuthUrl();
  res.redirect(authUrl);
});

router.route("/dropbox/oauthcallback").get(async function(req, res) {
  const code = req.query.code;
  dropboxOauth2Client.getToken(code, function(err, response) {
    if (err) {
      console.log(code);
    } else {
      dropbox = new Dropbox({ accessToken: response.access_token });
      res.redirect("/dropbox/home");
    }
  });
});

router.route("/dropbox/home").get(async function(req, res) {
  console.log("We did it");
});

router.route("/dropbox/folder/:folderId").get(async function(req, res) {});

module.exports = router;
