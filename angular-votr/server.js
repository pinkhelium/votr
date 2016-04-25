var express = require('express');
var app = express();

app.use(express.static(__dirname + "/public"));

app.get('api/sec/', function(request, response){

});


app.get('/api', function(request, response){

});


app.listen(1337, function(){
	console.log("Server running on port 1337");
});

