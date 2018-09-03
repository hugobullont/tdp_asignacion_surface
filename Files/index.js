const {google} = require('googleapis');
const express = require('express')

const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
const TOKEN_PATH = 'token.json';
const CLIENT_ID = "821489341441-jjdo96m1j05mgqnbupom3b6jdlamg0n3.apps.googleusercontent.com"
const CLIENT_SECRET = "5YVJWH3QHZjxVEXrR8TFJnfx"
const REDIRECT_URL = "http://localhost:3000/drive/oauthcallback"
const googleOauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL)

google.options({
  auth: googleOauth2Client
});

const app = express()
app.set('view engine', 'ejs')
app.use(express.static('public'))

app.listen(3000, function(){
  console.log('Example app listening on port 3000!');
})

app.get('/drive', function(req,res){
  const authUrl = googleOauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  })
  res.redirect(authUrl)  
})

app.get('/drive/home/', async function(req,res){
  try{
    const drive = google.drive({version: 'v3'});
    const result = await drive.files.list({
      includeRemoved: false,
      fields: 'files(id, name, mimeType)',
      spaces: 'drive',
    })

    result.data.files.map((file) => {
      if (file.mimeType !== 'application/vnd.google-apps.folder') {
        console.log(`File: ${file.name} (${file.id})`);
      } else {
        console.log(`Directory: ${file.name} (${file.id})`);
      }
    })
  
    res.render('index', {
      images: null,
      videos: null
    })
  } catch (error){
    console.log(error)
  }
})

app.get('/drive/oauthcallback/', async function(req, res){
  try{
    const code = res.req.query.code
    const {tokens} = await googleOauth2Client.getToken(code)
    googleOauth2Client.setCredentials(tokens);
    res.redirect('/drive/home')
  } catch (error){
    console.log(error)
  }
})