'use strict';

const {google} = require('googleapis');
const bodyParser = require('body-parser');
const express = require('express');

const app = express();
const youtube = google.youtube({
  version: 'v3',
  auth: 'YourAPIKey'
});

async function runQuery (topic) {
  const res = await youtube.search.list({
    part: 'id,snippet',
    q: topic,
    maxResults: 10
  });

  var videos = res.data.items;

  for(var i = 0; i < videos.length; i++){
    console.log(videos[i].snippet.title);
    console.log(videos[i].snippet.thumbnails.high.url)
  }


}



app.set('view engine', 'ejs')
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
})

app.get('/', function (req, res) {
  res.render('index');
})

app.post('/', function (req, res) {
  res.render('index');
  console.log(req.body.topic);
  runQuery(req.body.topic).catch(console.error);
})
