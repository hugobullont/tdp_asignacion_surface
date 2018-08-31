'use strict';

const {google} = require('googleapis');

const youtube = google.youtube({
  version: 'v3',
  auth: 'AIzaSyDaEauwiAKCmy7nLJ6J7BOcE6CDMPZGo3I'
});

async function runQuery () {
  const res = await youtube.search.list({
    part: 'id,snippet',
    q: 'FIFA18'
  });
  console.log(res.data);
}

runQuery().catch(console.error);
