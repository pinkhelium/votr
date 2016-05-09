# Hello, there!

> **votr** is an open voting platform developed for the PESIT South ACM Student Chapter's General Elections.

*Disclaimer*: This repository is still in the process of being made completely *plug-n-play*-able. Some portions are still coded to the specifics of the current use case. We are working on genericizing it.  =)

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

VOTR is an __open source__ voting platform that has been developed to facilitate the election process. _Over the years, we've strived to engage *every single member* of the PESITSouth ACM Student Chapter in the process of choosing the office bearers_. VOTR is our offering for doing the same.

[To Top](#contents)

<a name="feat"/>
## Features

* User authentication using Facebook.
* Voter authentication through Facebook Group membership.
* Admin user support (admins of the facebook group)
* Different voting phases:
  * Pre-vote Nomination Phase
  * Candidate Pitch Submission
  * Final Votes

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

* Make sure the `config.js` file at the root of the project does not get tracked or committed or pushed to a public repository - mistakes happen, be careful =P


[To Top](#contents)

<a name="setup"/>
## Setup Locally

1. Install Node.js and npm
2. Clone this repository
3. Create a config.js file at the root of this project with the following contents:  
  ```js
  // Facebook Graph API Config
  // Get these values from your app settings after registering your app on https://developers.facebook.com
  
  // App > Settings > Basic >> Application ID
  var clientID = '<<CLIENT_ID_HERE>>';
  // App > Settings > Basic >> App Secret
  var clientSecret = '<<CLIENT_SECRET_HERE>>';
  var graphAppSecret = clientSecret;
  
  // change 'callbackUrl' value to your actual domain on deployment
  // for example: 'http://www.example.com/login/facebook/return'
  var callbackUrl = 'http://localhost:3000/login/facebook/return'; 
  
  
  // Firebase Config
  // Firebase is the database environment, establish App Secrets & security rules to ensure your data is not readable/writable by un-authorized users
  
  // Firebase Dashboard > Secrets > First Secret
  var firebaseAppSecret = '<<FIREBASE_APP_SECRET_HERE>>'

  // We re-use the Facebook client ID again, you may use anything you like; just update your security rules accordingly on Firebase.
  var firebaseClientID = String(clientID);
  
  // This section exports all the variables for use within the application
  module.exports.clientID = clientID;
  module.exports.clientSecret = clientSecret;
  module.exports.callbackUrl = callbackUrl;
  module.exports.graphAppSecret = graphAppSecret;
  module.exports.firebaseAppSecret = firebaseAppSecret;
  module.exports.firebaseClientID = firebaseClientID;
  ```
4. Run `npm install` to install all the dependencies
5. `npm start` to run the app locally.
  
[To Top](#contents)
