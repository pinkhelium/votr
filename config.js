
/* Facebook Graph API Config ****************************************************/

// App > Settings > Basic > Application ID
var clientID = 1005519669533262;

// App > Settings > Basic > App Secret
var clientSecret = 'c303396aaab9e8f67f2e410773ae1cef'; 

// Switch Between these two for Production & Development Environments
// var callbackUrl = 'http://votr.eu-1.evennode.com/login/facebook/return';
var callbackUrl = 'http://localhost:3000/login/facebook/return';

var graphAppSecret = clientSecret;

/********************************************************************************/



/* Firebase Secrets *************************************************************/

// Firebase Dashboard > Secrets > First Secret
var firebaseAppSecret = 'OtFOpKwXza6HwoWLyp8sgt4UEy1Sky8uYnuFrUvW';

// Application ID From Facebook re-used as client-id
var firebaseClientID = String(clientID);

/********************************************************************************/



/* ALL EXPORTS *************************************************************/

module.exports.clientID = clientID;
module.exports.clientSecret = clientSecret;
module.exports.callbackUrl = callbackUrl;
module.exports.graphAppSecret = graphAppSecret;
module.exports.firebaseAppSecret = firebaseAppSecret;
module.exports.firebaseClientID = firebaseClientID;

/********************************************************************************/