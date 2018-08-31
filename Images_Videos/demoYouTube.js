'use strict';

const {
  google
} = require('googleapis');
const bodyParser = require('body-parser');
const express = require('express');

const app = express();
const youtube = google.youtube({
  version: 'v3',
  auth: 'YourAPIKey'
});

var videos;

app.set('view engine', 'ejs')
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
  extended: true
}));

app.listen(3000, function() {
  console.log('Example app listening on port 3000!');
})

app.get('/', function(req, res) {
  res.render('index', {
    videos: null
  });
})

app.post('/', function(req, resp) {
  console.log(req.body.topic);
  var topic = req.body.topic;
  youtube.search.list({
    part: 'id,snippet',
    q: topic,
    maxResults: 5,
    type: 'video'
  }, (err, res) => {
    if (err) {
      console.error(err);
      throw err;
    }
    videos = res.data.items;
    console.log(videos[0].snippet.thumbnails.high)
    resp.render('index', {
      videos: videos
    });
  });
})
