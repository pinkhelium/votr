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

var waterfall = require('async-waterfall');
var fb_msg_post = require('./facebook_message_poster');


var C = {};

var Firebase = require("firebase");
var nomineesRef = new Firebase("https://votr-dev.firebaseio.com/nominees");
var myFirebaseRef = new Firebase("https://votr-dev.firebaseio.com/");
var candidateRef = new Firebase("https://votr-dev.firebaseio.com/candidates");
var candidateVoteRef = new Firebase("https://votr-dev.firebaseio.com/candidatevotes")
var nominee_list = [];
var candidateList = [];

candidateRef.on("value", function(data){
	candidateList = data.val();
	console.log("CANDIDATES_LIST_STRUCTURE_WITH_COUNT");
	console.log(JSON.stringify(candidateList));
})

nomineesRef.on('value', function(data){
  console.log("Nominees On Change:\n\n:");
  console.log(data.val());
  nominee_list = data.val();
  for(nominee in nominee_list){
  	//console.log("\n\n\nNOMINEE: " + nominee_list[nominee].CScore);
  	var userPictureUrl = "/" + nominee_list[nominee].uid + "/picture";
  	graph.get(userPictureUrl,function(err,response){
  		//console.log(response);
  		nominee_list[nominee].picUrl = response.location;
  	})
  }
});


var app = express();
var port = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(__dirname + "/public"));
app.use(cookieParser());
app.use(session({
	secret: "YOLOVOTR",
	cookie: { maxAge: null },
	saveUninitialized: false,
	resave: false
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
    callbackURL: CONFIG.callbackUrl,
    scope: CONFIG.scope
  },
  // the VERIFY callback
  function(accessToken, refreshToken, profile, done) {
    console.log("\n\n\nVERIFY CALLBACK:\nAccessToken:" + accessToken);
  
    profile.accessToken = accessToken;
    //console.log(profile);

    graph.setAccessToken(accessToken);
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
		successRedirect: '/#/',
		failureRedirect: '/loginfailure',
		failureFlash: 'Failed to login',
		successFlash: 'Login Success! Welcome'
	})
);

app.get('/loginfailure', function(request, response){
	response.send("Failed to log you in via Facebook. Please check your credentials.");
});

app.get('/logout', function(request, response){
  request.logout();
 //  var wallPost = {
	//   person: "http://samples.ogp.me/1017909491627613"
	// };

	// graph.post("me/votr-actions:vote_for", wallPost, function(err, res) {
	//   // returns the post id
	//   console.log(res); // { id: xxxxx}
	// });
  response.redirect('/#/');
});

app.get("/tabledata", function(request,response){
	response.send(nominee_list);
})


/*
	
	Pre-voting Stuff:
		Candidates Endpoints:
			-> GET /candidates : Returns all candidates
			-> POST /candidates : Adds a new candidate
			-> POST /nominate : Cast a nomination vote

*/

app.get('/candidates', function(request,response){

	response.send(candidateList);

});



app.post('/candidates', function(request,response){

	//To add a new candidate
	var candidateParam = {};
	//To get the previous vote
	var candidateName = request.body.candidateName;
	//console.log(request.body);
	candidateParam[candidateName] = {
		count: 1
	};

	candidateRef.update(candidateParam);

	var prev_candidate_vote_snapshot = {};
	
	waterfall([
		function(callback){
			candidateVoteRef.child(request.user.id).once("value", function(data){
				prev_candidate_vote_snapshot = data.val();
				console.log(JSON.stringify(data.val()));
				console.log("prev snapshot is: " + JSON.stringify(prev_candidate_vote_snapshot));

				callback(null, prev_candidate_vote_snapshot);
			});
		},
		function(prev_candidate_vote_snapshot, callback){
			console.log("prev snapshot OUTSIDE scope is: " + JSON.stringify(prev_candidate_vote_snapshot));
			if(prev_candidate_vote_snapshot != null){
			// 	console.log('PRE: ' + JSON.stringify(prev_candidate_vote_obj));
				console.log("COMMITTING SUICIDE NOW! old value is:" + JSON.stringify(candidateList[prev_candidate_vote_snapshot.name]));
				candidateRef.child(prev_candidate_vote_snapshot.name).child("count").set(candidateList[prev_candidate_vote_snapshot.name].count - 1);
			}

			var newEntry = {};
			newEntry[request.user.id] = {
				name: candidateName,
				voter_name: request.user.displayName
			};

			console.log("GONNA DIE HERE ALL ALONE");
			candidateVoteRef.update(newEntry);
		}
	]);
	response.send("Success");

});

app.post('/nominate', function(request,response){

	var candidateName = request.body.candidateName;

	// var prev_candidate_vote_obj = {};

	var prev_candidate_vote_snapshot = {};
	
	waterfall([
		function(callback){
			candidateVoteRef.child(request.user.id).once("value", function(data){
				prev_candidate_vote_snapshot = data.val();
				console.log(JSON.stringify(data.val()));
				console.log("prev snapshot is: " + JSON.stringify(prev_candidate_vote_snapshot));

				callback(null, prev_candidate_vote_snapshot);
			});
		},
		function(prev_candidate_vote_snapshot, callback){
			console.log("prev snapshot OUTSIDE scope is: " + JSON.stringify(prev_candidate_vote_snapshot));
			if(prev_candidate_vote_snapshot != null){
			// 	console.log('PRE: ' + JSON.stringify(prev_candidate_vote_obj));
				console.log("COMMITTING SUICIDE NOW! old value is:" + JSON.stringify(candidateList[prev_candidate_vote_snapshot.name]));
				candidateRef.child(prev_candidate_vote_snapshot.name).child("count").set(candidateList[prev_candidate_vote_snapshot.name].count - 1);
			}

			var newEntry = {};
			newEntry[request.user.id] = {
				name: candidateName,
				voter_name: request.user.displayName
			};

			console.log("GONNA DIE HERE ALL ALONE");
			candidateVoteRef.update(newEntry);

			//To add the new vote
			candidateRef.child(candidateName).child("count").set(candidateList[candidateName].count + 1);
		}
	]);
	response.send("Success");
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
	var uid = parseInt(request.body.uid);
	var uidUrl = "/" + request.body.uid + "?fields=name";
	//console.log(request);
	graph.get(uidUrl, {access_token : request.user.accessToken} ,function(err, res) {
		//console.log("\n\n\nResponse: " + res + "\n\n\n");
		var nomineeParam = {};
		nomineeParam[res.name] = {
			uid: uid,
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

/*
	User Endpoints:
		get /user
			get details of logged in user through the session

		get /user/picture
			queries graph api with user's access token to get 
			their profile picture

		get /user/permissions
			queries graph api with user's access token to see 
			if they are valid members & admins or not
*/

app.get('/user', function(request, response){
	var s = request.session;
	var details = {};
	details.loggedIn = false;
	details.admin = false;
	details.displayName = null;
	details.id = null;

	if(s.flash){
		if(s.flash.success){
			details.loggedIn = true;
			details.admin = false;
			details.displayName = s.passport.user.displayName;
			details.id = s.passport.user.id;	
		}		
	}
	response.json(details);
});

app.get('/user/picture', function(request, response){
	
	if(!request.session.flash){
		response.status(400).send("Error: User not logged in.");
		return;
	}

	var reqURL = '/me/picture?height=300&access_token='+request.session.passport.user.accessToken;
	
	graph.get(reqURL, function(error, success){
		if(error){
			console.log(error);
			response.send("Error occurred while fetching Profile Picture: "+error);
		}
		else{
			response.send(success);
		}
	});
});

app.get('/user/permissions', function(request, response){

	if(!request.session.flash){
		response.status(400).send("Error: User not logged in.");
		return;
	}

	var reqURL = '/289190546930/members?limit=2000&access_token='+request.session.passport.user.accessToken;
	var currentUser = request.session.passport.user;
	var returnPermissions = {
		isValidACMMember: false,
		isAdmin: false,
		id:"",
		displayName:""
	};

	graph.get(reqURL, function(error, success){
		if(error){
			response.status(500).send(error);
		}
		else {
			var member_list = success.data;
			for(var key in member_list){
				if(member_list[key].id == currentUser.id){
					console.log("Found the user "+currentUser.displayName+" in the member list");
					console.log("VALID ACM GROUP MEMBER: ALLOWED TO VOTE");

					returnPermissions.isValidACMMember = true;

					if(member_list[key].administrator == true){
						returnPermissions.isAdmin = true;
					}

					returnPermissions.id = member_list[key].id;
					returnPermissions.displayName = member_list[key].name;
				}
			}
			response.json(returnPermissions);
			console.log("Sent response:\n"+returnPermissions);
		}
	});
});

/* 

	Endpoint to test session 

*/

app.get('/sess', function(request, response){
	var s = request.session;
	var st = "Session contains:\n<br />\n<br />" + s;
	console.log(s);
	response.send(s	);
});

/*
	Endpoint to cast vote

*/

app.post('/vote', function(request,response){

	var userName = request.body.user;
	var vote = request.body.vote;
	console.log("Vote: " + vote);
	var child_string = "votes/" + userName;
	console.log("child_string is: -----> " + child_string);
	var prev_vote_OBJ = {};
	//To get the previous vote cast
	myFirebaseRef.child(child_string).on("value", function(snapshot) {
		prev_vote_OBJ = snapshot.val();
		console.log("PREV VOTE ----->>>:" + JSON.stringify(prev_vote_OBJ));
	});

	//To revert previous change

	if (prev_vote_OBJ != null) { 
		if(prev_vote_OBJ.chair){
			var csref = nomineesRef.child(prev_vote_OBJ.chair+'/CScore');
			csref.set( nominee_list[prev_vote_OBJ.chair]['CScore'] - 1);
		}

		if(prev_vote_OBJ.vice_chair){
			var vsref = nomineesRef.child(prev_vote_OBJ.vice_chair+'/VScore');
			vsref.set( nominee_list[prev_vote_OBJ.chair]['VScore'] - 1); 
		}

		if(prev_vote_OBJ.treasurer){
			var tsref = nomineesRef.child(prev_vote_OBJ.treasurer+'/TScore');
			tsref.set( nominee_list[prev_vote_OBJ.chair]['TScore'] - 1);
		}
		if(prev_vote_OBJ.secretary){
			var ssref = nomineesRef.child(prev_vote_OBJ.secretary+'/SScore');
			ssref.set( nominee_list[prev_vote_OBJ.chair]['SScore'] - 1);
		}

		console.log("PREVIOUS VOTE CLEARED!");
	}

	var db_param = {};
	

	
	vote["voter_name"] = userName;
	var uID = request.user["id"];
	db_param[uID] = vote
	myFirebaseRef.child('votes').update(db_param);

	if(vote.chair){
		csref = nomineesRef.child(vote.chair+'/CScore');
		csref.set( nominee_list[vote.chair]['CScore'] + 1);
	}

	if(vote.vice_chair){
		vsref = nomineesRef.child(vote.vice_chair+'/VScore');
		vsref.set( nominee_list[vote.vice_chair]['VScore'] + 1); 
	}

	if(vote.treasurer){
		tsref = nomineesRef.child(vote.treasurer+'/TScore');
		tsref.set( nominee_list[vote.treasurer]['TScore'] + 1);
	}
	if(vote.secretary){
		ssref = nomineesRef.child(vote.secretary+'/SScore');
		ssref.set( nominee_list[vote.secretary]['SScore'] + 1);
	}

	response.send("success");
});

app.listen(port, function(){
	console.log("Server running on port: " + port);
});

