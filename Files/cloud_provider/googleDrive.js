const express = require("express");
const { google } = require("googleapis");

const SCOPES = ["https://www.googleapis.com/auth/drive.metadata.readonly"];
const CLIENT_ID =
  "821489341441-jjdo96m1j05mgqnbupom3b6jdlamg0n3.apps.googleusercontent.com";
const CLIENT_SECRET = "5YVJWH3QHZjxVEXrR8TFJnfx";
const REDIRECT_URL = "http://localhost:3000/drive/oauthcallback";

const googleOauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL
);
const drive = google.drive({ version: "v3" });

google.options({
  auth: googleOauth2Client
});

const router = express.Router();

router.route("/drive").get(function(req, res) {
  const authUrl = googleOauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES
  });
  res.redirect(authUrl);
});

router.route("/drive/oauthcallback").get(async function(req, res) {
  try {
    const code = res.req.query.code;
    const { tokens } = await googleOauth2Client.getToken(code);
    googleOauth2Client.setCredentials(tokens);
    res.redirect("/drive/home");
  } catch (error) {
    console.log(error);
  }
});

router.route("/drive/home").get(async function(req, res) {
  try {
    const result = await drive.files.list({
      includeRemoved: false,
      fields: "files(id, name, mimeType)",
      spaces: "drive"
    });

    const files = result.data.files.map(file => {
      const id = file.id;
      const name = file.name;
      const isFolder = file.mimeType === "application/vnd.google-apps.folder";
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
      title: "Drive Home"
    });
  } catch (error) {
    console.log(error);
  }
});

router.route("/drive/folder/:folderId").get(async function(req, res) {
  try {
    const result = await drive.files.list({
      includeRemoved: false,
      fields: "files(id, name, mimeType)",
      spaces: "drive",
      q: `'${req.params.folderId}' in parents`
    });

    const files = result.data.files.map(file => {
      const id = file.id;
      const name = file.name;
      const isFolder = file.mimeType === "application/vnd.google-apps.folder";
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

    res.render("folder", {
      files: files,
      title: "Drive Folder"
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
