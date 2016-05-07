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

var CONFIG = require('./config.js');

var FirebaseTokenGenerator = require("firebase-token-generator");

/* FIREBASE AUTHENTICATION TOKEN GENERATOR */
var tokenGenerator = new FirebaseTokenGenerator(CONFIG.firebaseAppSecret);
var nominee_list = [];

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
      // console.log(data.val());
      res.send(data.val());
    }, function(error){
    	console.log('error: '+error );
    	res.send(error);
    });
    // res.send('success bitch');
});

app.listen(3001, function(){
  // uid field is required, rest of the fields are arbitrary/as per requirement
    // the fields are available as part of the auth object under secuirty & rules in your firebase dashboard
	CONFIG.token = tokenGenerator.createToken({ uid: "@dm!n", from: "node-server", clientID: CONFIG.firebaseClientID });
	console.log("Created a client token: " + CONFIG.token );

    nomineesRef.authWithCustomToken(CONFIG.token, function(error, authData) {
	  if (error) {
	    console.log("Authentication Failed!", error);
	  } else {
	    console.log("Authenticated successfully with payload:", authData);
	  }
	});
	console.log("Ref Auth Request Sent");
  console.log("Server Running on port 3001");
});

