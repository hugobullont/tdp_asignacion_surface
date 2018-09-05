const express = require("express");
const request = require("request");
const oneDriveAPI = require("onedrive-api");

const SCOPES = "files.readwrite.all";
const CLIENT_ID = "090a17a6-48e3-4936-89aa-13cf239f1d73";
const CLIENT_SECRET = "vxcdXNBR03?)osxIIK990|(";
const REDIRECT_URL = "http://localhost:3000/oneDrive/oauthcallback";

var ACCESS_TOKEN = "";
const router = express.Router();

router.route("/oneDrive").get(function(req, res) {
  if (req.session.user) {
    res.redirect(req.session.user.path);
  } else {
    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${CLIENT_ID}&scope=${SCOPES}
    &response_type=code&redirect_uri=${REDIRECT_URL}`;
    res.redirect(authUrl);
  }
});

router.route("/oneDrive/oauthcallback").get(function(req, res) {
  const code = req.query.code;
  request.post(
    {
      url: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
      form: {
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URL,
        client_secret: CLIENT_SECRET,
        code: code,
        grant_type: "authorization_code"
      }
    },
    function(err, response, body) {
      if (!err) {
        ACCESS_TOKEN = JSON.parse(body).access_token;
        req.session.user = { path: "/oneDrive/home" };
        res.redirect("/oneDrive/home");
      } else {
        console.log(error);
      }
    }
  );
});

router.route("/oneDrive/home").get(function(req, res) {
  oneDriveAPI.items
    .listChildren({
      accessToken: ACCESS_TOKEN
    })
    .then(childrens => {
      const files = childrens.value.map(file => {
        const id = file.id;
        const name = file.name;
        const isFolder = file.folder !== undefined;
        const url = isFolder ? `/oneDrive/folder/${id}` : file.webUrl;
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
        title: "OneDrive Home"
      });
    })
    .catch(function(error) {
      console.log(error);
    });
});

router.route("/oneDrive/folder/:folderId").get(async function(req, res) {
  oneDriveAPI.items
    .listChildren({
      accessToken: ACCESS_TOKEN,
      itemId: req.params.folderId
    })
    .then(childrens => {
      const files = childrens.value.map(file => {
        const id = file.id;
        const name = file.name;
        const isFolder = file.folder !== undefined;
        const url = isFolder ? `/oneDrive/folder/${id}` : file.webUrl;
        const newFile = {
          id: id,
          name: name,
          url: url,
          isFolder: isFolder
        };
        return newFile;
      });

      res.render("folder", {
        files: files,
        title: "OneDrive Folder"
      });
    })
    .catch(function(error) {
      console.log(error);
    });
});

module.exports = router;
