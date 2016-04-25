var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var flash = require('connect-flash');
var bodyParser = require('body-parser');

var passport = require('passport');
var Strategy = require('passport-facebook').Strategy;

var CONFIG = require('./config.js');


var C = {};

var Firebase = require("firebase");
var nomineesRef = new Firebase("https://votr-dev.firebaseio.com/nominees");
var nominee_list = [];

nomineesRef.on('value', function(data){
  console.log(data.val());
  nominee_list = data.val();
});


var app = express();
var port = process.env.PORT || 3000;

app.use(express.static(__dirname + "/public"));
app.use(cookieParser());
app.use(session({
	secret: "YOLOVOTR",
	cookie: { maxAge: 60000 }
}));
app.use(flash());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())



// PASSPORT RELATED CONFIGS
passport.use(new Strategy({
    clientID: CONFIG.clientID,
    clientSecret: CONFIG.clientSecret,
    callbackURL: CONFIG.callbackUrl
  },
  // the VERIFY callback
  function(accessToken, refreshToken, profile, done) {
    console.log("\n\n\nVERIFY CALLBACK:\nAccessToken:" + accessToken);

    // graph.setAccessToken(accessToken);
    C.ACCESS_TOKEN = accessToken;
    // graph.setAppSecret(CONFIG.graphAppSecret);
    return done(null, profile);
  }));
// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});



app.get('/login', passport.authenticate('facebook'));

app.get(
	'/login/facebook/return',
	passport.authenticate('facebook', {
		successRedirect: '/loginsuccess',
		failureRedirect: '/loginfailure',
		failureFlash: 'Failed to login',
		successFlash: 'Login Success! Welcome'
	})
);

app.get('/loginsuccess', function(request, response){
	console.log("IN LOGIN SUCCESS CALL");
	console.log(request.user);
	response.send("SUCCESS");
});

app.get('/loginfailure', function(request, response){
	response.send("LOGINFAIL");
});

app.get('/randomshit', function(request, response){
	console.log('HI');
	console.log(request.user);
	response.send('lets see' + request.user);
});

app.get('/nominees', function(request,response){

	response.send(nominee_list);
})


app.listen(port, function(){
	console.log("Server running on port: " + port);
});

