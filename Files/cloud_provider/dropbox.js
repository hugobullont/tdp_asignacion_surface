const express = require("express");
const dropboxV2Api = require("dropbox-v2-api");
const Dropbox = require("dropbox").Dropbox;
var fetch = require("isomorphic-fetch");

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
      dropbox = new Dropbox({
        accessToken: response.access_token,
        fetch: fetch
      });
      res.redirect("/dropbox/home");
    }
  });
});

router.route("/dropbox/home").get(async function(req, res) {
  //TODO: FIX URL ENCODING
  dropbox
    .filesListFolder({ path: "/aplicaciones web" })
    .then(function(response) {
      const files = response.entries.map(file => {
        const id = file.id;
        const name = file.name;
        const isFolder = file[".tag"] === "folder";
        const url = isFolder
          ? `/drive/folder/${id}`
          : `https://drive.google.com/open?id=${file.id}`;
        const newFile = {
          id: id,
          name: name,
          url: url,
          isFolder: isFolder
        };
        return newFile;
      });

      res.render("home", {
        files: files,
        title: "Dropbox Home"
      });

      console.log(response);
    })
    .catch(function(error) {
      console.log(error);
    });
});

router.route("/dropbox/:path*").get(async function(req, res) {});

module.exports = router;
