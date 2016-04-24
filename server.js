var express = require('express');
var passport = require('passport');
var Strategy = require('passport-facebook').Strategy;
var graph = require('fbgraph');
var CONFIG = require('./config.js');
var bodyParser = require('body-parser');
var Firebase = require("firebase");
var myFirebaseRef = new Firebase("https://votr-dev.firebaseio.com/");
var nomineesRef = new Firebase("https://votr-dev.firebaseio.com/nominees");

var at = ""
var member_list = [];
var admin_list = [];

var nominee_list = [];

nomineesRef.on('value', function(data){
  console.log(data.val());
  nominee_list = data.val();
})

// Configure the Facebook strategy for use by Passport.
//
// OAuth 2.0-based strategies require a `verify` function which receives the
// credential (`accessToken`) for accessing the Facebook API on the user's
// behalf, along with the user's profile.  The function must invoke `cb`
// with a user object, which will be set at `req.user` in route handlers after
// authentication.
passport.use(new Strategy({
    clientID: CONFIG.clientID,
    clientSecret: CONFIG.clientSecret,
    callbackURL: CONFIG.callbackUrl
  },
  function(accessToken, refreshToken, profile, cb) {
    // In this example, the user's Facebook profile is supplied as the user
    // record.  In a production-quality application, the Facebook profile should
    // be associated with a user record in the application's database, which
    // allows for account linking and authentication with other identity
    // providers.
    console.log("AT: -----****** ->" + accessToken);
    graph.setAccessToken(accessToken);
    at = accessToken;
    graph.setAppSecret(CONFIG.graphAppSecret);
    return cb(null, profile);
  }));


// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Twitter profile is serialized
// and deserialized.
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});


// Create a new Express application.
var app = express();

// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.

//app.use(require('morgan')('combined'));

// commenting to stop all that logging =P OMG
// app.use(require('morgan')('combined'));

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: CONFIG.graphAppSecret, resave: true, saveUninitialized: true }));
app.use(express.static(__dirname + '/public'));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

var pic_url = ""
var uName = ""
// Define routes.
app.get('/', function(req, res) {
    var params = { fields: "picture" };
    var res_obj = {}
    graph.get("/me/picture?height=200", function(err, ress) {
      console.log("res: %j", ress);
      pic_url = ress; // { picture: "http://profile.ak.fbcdn.net/..." }
      graph.get("/289190546930/members", {limit: 2000, access_token: at}, function(err, res_g) {
        member_list = [];
        admin_list = [];
        var something = false;
        for (var key in res_g.data){
          var obj = res_g.data[key];
          if(something === false){
            console.log(obj);
            something = true;
          }
          // console.log(obj.name);
          member_list.push(obj.name);
          admin_list.push(obj);
          // console.log(res_g.data);
        }

        console.log(typeof(req.user));
        for (var namekey in req.user){
          if (namekey === "displayName") {
            uName = req.user[namekey];
            console.log(req.user[namekey]);
            var memberNumber = member_list.indexOf(req.user[namekey]);
            if ( memberNumber != -1) {
              console.log("ACM MEMBER ACM MEMBER ACM MEMBER!")
              if(admin_list[memberNumber].administrator === true){
                req.user.admin = true;
              }
              else{
                req.user.admin = false;
              }
              //var nominees = getNominees();
              console.log("\n\n\n\nBefore: " + nominee_list);
              res.render('home', { user: req.user, prof_pic: pic_url, nominees: nominee_list });
              return
            }
            else {
              console.log("TRESPASSER! TRESPASSER! TRESPASSER!")
              res.render('error', { user: req.user });
            }
          }
        }
        res.render('home', { user: req.user ,nominees: nominee_list });
        // console.log(res_g.data["name"]);
        // console.log(res_g.data.name);
        console.log(member_list.length);
      });
    });
  });

app.get('/login',
  function(req, res){
    res.render('login');
  });

app.get('/login/facebook',
  passport.authenticate('facebook'));

app.get('/login/facebook/return', 
  passport.authenticate('facebook', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/');
  });


app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('profile', { user: req.user });
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
  console.log("HELLO");
});


app.post('/nominate', function(request,response){

  var uid = "/" + request.body.uid + "?fields=name";
  console.log(uid);
  graph.get(uid, function(err, res) {
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
    response.send(res); // { id: '4', name: 'Mark Zuckerberg'... }
  });
  
})

app.post('/castvote', function(req, res){
  console.log(req.body);
  var db_param = {};
  db_param[uName] = req.body;
  votes = req.body;
  myFirebaseRef.child('votes').update(db_param);

  //scaffolding
  // { chair: 'Person1',
  // vice_chair: 'Person2',
  // treasurer: 'Person3',
  // secretary: 'Person1' }

  // CHAIR
  nomineesRef.child(votes.chair).on("value", function(data){
    var val = data.val();
    console.log('cscore' + val.CScore);
  })
  res.redirect('/');
  // res.send(req.body);
});

app.listen(3000, function(){
  console.log("Server Running on port 3000");
});

