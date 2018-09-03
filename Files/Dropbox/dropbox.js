'use strict';

const bodyParser = require('body-parser');
const express = require('express');

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));

app.listen(3030, function() {
    console.log('Dropbox App listengin on port 3030!');
});

app.get('/', function(req, res) {
    res.render('permission');
});

app.post('/auth', function(req, res) {
    const authUrl = "https://www.dropbox.com/oauth2/authorize?response_type=token&client_id=s8ofpmn7nzknc7k&redirect_uri=http://localhost:3030/dropbox";
    res.redirect(authUrl);
});

app.get('/dropbox', function(req, res) {
    
})