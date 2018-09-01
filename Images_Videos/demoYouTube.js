'use strict';

const {
  google
} = require('googleapis');
const bodyParser = require('body-parser');
const express = require('express');

const app = express();
//YouTubeAPI
const youtube = google.youtube({
  version: 'v3',
  auth: 'YouTubeAPIKey'
});
//GoogleCustomSearchAPI
const customsearch = google.customsearch('v1');

var videos = null;
var images = null;

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
  //youtube search
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
  });
  //customsearch for Images
  const options = {
    q: topic,
    key: 'CustomSearchAPIKey',
    cx: 'CustomSearchEngineID',
    searchType: 'image',
    num: 5
  };

  customsearch.cse.list({
    q: options.q,
    key: options.key,
    cx: options.cx,
    searchType: options.searchType,
    num: options.num
  }, (err, res) => {
    if (err) {
      console.error(err);
      throw err;
    }
    images = res.data.items
    resp.render('index', {
      videos: videos,
      images: images
    })
  });
})
