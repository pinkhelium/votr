var express = require('express');
var passport = require('passport');
var Strategy = require('passport-facebook').Strategy;
var graph = require('fbgraph');
var CONFIG = require('./config.js');
var bodyParser = require('body-parser');
var Firebase = require("firebase");
var myFirebaseRef = new Firebase("https://votr-dev.firebaseio.com/");
var nomineesRef = new Firebase("https://votr-dev.firebaseio.com/nominees");
var votesRef = new Firebase("https://votr-dev.firebaseio.com/votesRef");

var nominee_list = [];

nomineesRef.on('value', function(data){
  console.log(data.val());
  nominee_list = data.val();
});

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: CONFIG.graphAppSecret, resave: true, saveUninitialized: true }));
app.use(express.static(__dirname + '/public'));

// Define routes.
app.get('/hey', function(req, res) {
    nomineesRef.on('value', function(data){
      console.log(data.val());
      res.send(data.val());
    });
    // res.send('success bitch');
  });

app.listen(3000, function(){
  console.log("Server Running on port 3000");
});

