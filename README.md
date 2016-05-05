# Hello, there!

> **votr** is an open voting platform developed for the PESIT South ACM Student Chapter's General Elections.

## Contents

* [About](#about)
* [Features](#feat)
* [Behind the Scenes](#req)
* [Instructions to Setup](#setup)

<a name="about"/>
## About

A project by [pink**helium**](https://github.com/pinkhelium) - [Sandesh Gade](https://github.com/cyberbeast), [Abinav Seelan](https://github.com/abinavseelan) and [Aditi Mohanty](https://github.com/rheaditi).


<a name="feat"/>
## Features

* User authentication using Facebook.
* Voter authentication through Facebook Group membership.
* Admin user support (admins of the facebook group)
* Candidates & Rules pages

<a name="req"/>
## Behind the Scenes

* Node and npm
* Passport.js for Authentication using Facebook
* Facebook Graph API
* AngularJS || ejs



<a name="setup"/>
## Setup Locally

1. Install Node.js and npm
2. Clone this repository
3. Create a config.js file at the root of this project with the following contents:  
  ```js
  var clientID = '<<CLIENT_ID_HERE>>';
  var clientSecret = '<<CLIENT_SECRET_HERE>>';
  var callbackUrl = 'http://localhost:3000/login/facebook/return'; //change this to your actual domain on deployment
  var graphAppSecret = '<<GRAPH_API_APP_SECRET_HERE>>';
  
  module.exports.clientID = clientID;
  module.exports.clientSecret = clientSecret;
  module.exports.callbackUrl = callbackUrl;
  module.exports.graphAppSecret = graphAppSecret;
  ```
4. Run `npm install` to install all the dependencies
5. `npm start` to run the app locally.
  
