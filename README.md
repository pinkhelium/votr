# Hello, there!

> **votr** is an open voting platform developed for the PESIT South ACM Student Chapter's General Elections.

<a name="contents"/>
## Contents

* [About](#about)
* [Features](#feat)
* [Behind the Scenes](#req)
* [Note About Security](#security)
* [Instructions to Setup](#setup)

<a name="about"/>
## About

A project by [pink**helium**](https://github.com/pinkhelium) - [Sandesh Gade](https://github.com/cyberbeast), [Abinav Seelan](https://github.com/abinavseelan) and [Aditi Mohanty](https://github.com/rheaditi).

[To Top](#contents)

<a name="feat"/>
## Features

* User authentication using Facebook.
* Voter authentication through Facebook Group membership.
* Admin user support (admins of the facebook group)
* Candidates & Rules pages

[To Top](#contents)

<a name="req"/>
## Behind the Scenes

* Node and npm
* Passport.js for Authentication using Facebook
* Facebook Graph API
* AngularJS || ejs

[To Top](#contents)

<a name="security"/>
## Note About Security

[To Top](#contents)

<a name="setup"/>
## Setup Locally

1. Install Node.js and npm
2. Clone this repository
3. Create a config.js file at the root of this project with the following contents:  
  ```js
  // get these values from your app settings after registering your app on https://developers.facebook.com
  var clientID = '<<CLIENT_ID_HERE>>';
  var clientSecret = '<<CLIENT_SECRET_HERE>>';
  var graphAppSecret = '<<GRAPH_API_APP_SECRET_HERE>>';
  
  // change 'callbackUrl' value to your actual domain on deployment
  // for example: 'http://www.example.com/login/facebook/return'
  var callbackUrl = 'http://localhost:3000/login/facebook/return'; 
  
  module.exports.clientID = clientID;
  module.exports.clientSecret = clientSecret;
  module.exports.callbackUrl = callbackUrl;
  module.exports.graphAppSecret = graphAppSecret;
  ```
4. Run `npm install` to install all the dependencies
5. `npm start` to run the app locally.
  
[To Top](#contents)
