var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var flash = require('connect-flash');
var bodyParser = require('body-parser');
var cors = require('cors');
var graph = require('fbgraph');

var passport = require('passport');
var Strategy = require('passport-facebook').Strategy;

var CONFIG = require('./config.js');


var C = {};

var Firebase = require("firebase");
var nomineesRef = new Firebase("https://votr-dev.firebaseio.com/nominees");
var nominee_list = [];

nomineesRef.on('value', function(data){
  console.log("Nominees On Change:\n\n:");
  console.log(data.val());
  nominee_list = data.val();
});


var app = express();
var port = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(__dirname + "/public"));
app.use(cookieParser());
app.use(session({
	secret: "YOLOVOTR",
	cookie: { maxAge: null },
	saveUninitialized: false
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
  
    profile.accessToken = accessToken;
    //console.log(profile);

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


/*
	Passport Stuff
	-> /login : Starts the Auth process
	-> /login/facebook/return : Callback for the auth
*/
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
	response.send("success");
});

app.get('/loginfailure', function(request, response){
	response.send("LOGINFAIL");
});

app.get('/randomshit', function(request, response){
	console.log('HI');
	console.log(request.user);
	response.send('lets see' + request.user);
});


/*
	Nominees Endpoint:
		-> GET : Returns all nominees.
		-> POST : Adds a new nominee. 
		-> DELETE : Removes a nominee.
*/
app.get('/nominees', function(request,response){
	response.send(nominee_list);
})

app.post('/nominees', function(request,response){
	var uid = "/" + request.body.uid + "?fields=name";
	//console.log(request);
	graph.get(uid, {access_token : request.user.accessToken} ,function(err, res) {
		//console.log("\n\n\nResponse: " + res + "\n\n\n");
		var nomineeParam = {};
		nomineeParam[res.name] = {
			CScore : 0,
			VScore: 0,
			TScore: 0,
			SScore: 0,
			Total: 0
		};
		nomineesRef.update(nomineeParam);
		response.send("Added Candidate"); // { id: '4', name: 'Mark Zuckerberg'... }
	});
})

app.delete('/nominees', function(request,response){
	var nominee = request.query.nominee;
	var delRef = new Firebase("https://votr-dev.firebaseio.com/nominees/" + nominee );
	var onComplete = function(error){
		if(error){
			response.send(error);
		}
		else{
			response.send("success");
		}
	}

	delRef.remove(onComplete);
})

app.get('/sess', function(request, response){
	var s = request.session;
	var st = "Session contains:\n<br />\n<br />" + s;
	console.log(s);
	response.send(s	);
});

app.listen(port, function(){
	console.log("Server running on port: " + port);
});

