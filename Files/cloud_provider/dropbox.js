const express = require("express");
const dropboxV2Api = require("dropbox-v2-api");
const Dropbox = require("dropbox").Dropbox;
const fetch = require("isomorphic-fetch");

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
  if (req.session.user) {
    res.redirect(req.session.user.path);
  } else {
    const authUrl = dropboxOauth2Client.generateAuthUrl();
    res.redirect(authUrl);
  }
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
      req.session.user = { path: "/dropbox/home" };
      res.redirect("/dropbox/home");
    }
  });
});

router.route("/dropbox/home").get(async function(req, res) {
  dropbox
    .filesListFolder({ path: "" })
    .then(function(response) {
      const files = response.entries.map(file => {
        const id = file.id;
        const name = file.name;
        const isFolder = file[".tag"] === "folder";

        //GET READY, FUCK YOU JAVASCRIPT AND DROPBOX :)
        var rawFileUrl = null;

        const firstIndexOfSlash = file.path_display.indexOf("/");
        const lastIndexOfSlash = file.path_display.lastIndexOf("/");

        const urlWithoutSlash = file.path_display.substring(
          firstIndexOfSlash + 1
        );
        if (firstIndexOfSlash === lastIndexOfSlash) {
          const finaUrl = urlWithoutSlash.split(" ").join("+");
          rawFileUrl = `https://www.dropbox.com/home?preview=${finaUrl}`;
        } else {
          var urlForFolder = urlWithoutSlash.substring(
            firstIndexOfSlash,
            lastIndexOfSlash - 1
          );
          var urlForFile = urlWithoutSlash.substring(lastIndexOfSlash);

          urlForFolder = encodeURI(urlForFolder);
          urlForFile = urlForFile.split(" ").join("+");

          rawFileUrl = `https://www.dropbox.com/home/${urlForFolder}?preview=${urlForFile}`;
        }

        var rawFolderUrl = null;
        if (isFolder) {
          rawFolderUrl = `${encodeURI(urlWithoutSlash)}`;
        }

        const url = isFolder ? rawFolderUrl : rawFileUrl;

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
    })
    .catch(function(error) {
      console.log(error);
    });
});

router.route("/dropbox/:path*").get(async function(req, res) {
  const path = decodeURI(req.path).replace("/dropbox", "");
  const pathWithSlashAtTheBeginning = `/${path}`;
  console.log(path);
  dropbox
    .filesListFolder({ path: pathWithSlashAtTheBeginning })
    .then(function(response) {
      console.log(response);
      const files = response.entries.map(file => {
        const id = file.id;
        const name = file.name;
        const isFolder = file[".tag"] === "folder";

        //GET READY, FUCK YOU JAVASCRIPT AND DROPBOX :)
        var rawFileUrl = null;

        const firstIndexOfSlash = file.path_display.indexOf("/");
        const lastIndexOfSlash = file.path_display.lastIndexOf("/");

        const urlWithoutSlash = file.path_display.substring(
          firstIndexOfSlash + 1
        );
        if (firstIndexOfSlash === lastIndexOfSlash) {
          const finaUrl = urlWithoutSlash.split(" ").join("+");
          rawFileUrl = `https://www.dropbox.com/home?preview=${finaUrl}`;
        } else {
          var urlForFolder = urlWithoutSlash.substring(
            firstIndexOfSlash,
            lastIndexOfSlash - 1
          );

          var urlForFile = urlWithoutSlash.substring(lastIndexOfSlash);

          urlForFolder = encodeURI(urlForFolder);
          urlForFile = urlForFile.split(" ").join("+");

          rawFileUrl = `https://www.dropbox.com/home/${urlForFolder}?preview=${urlForFile}`;
        }

        var rawFolderUrl = null;
        if (isFolder) {
          rawFolderUrl = `http://localhost:3000/dropbox/${encodeURI(
            urlWithoutSlash
          )}`;
        }

        const url = isFolder ? rawFolderUrl : rawFileUrl;

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
        title: "Dropbox Folder"
      });
    })
    .catch(function(error) {
      console.log(error);
    });
});

module.exports = router;
