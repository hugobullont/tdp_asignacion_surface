'use strict';

const {google} = require('googleapis');

const youtube = google.youtube({
  version: 'v3',
  auth: 'YourAPIKey'
});

async function runQuery () {
  const res = await youtube.search.list({
    part: 'id,snippet',
    q: 'FIFA19',
    maxResults: 5
  });

  var videos = res.data.items;

  for(var i = 0; i < videos.length; i++){
    console.log(videos[i].snippet.title);
    console.log(videos[i].snippet.thumbnails.high.url)
  }


}

runQuery().catch(console.error);
