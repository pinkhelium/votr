var express = require('express');
var app = express();


app.use(express.static(__dirname + "/public"));

app.listen(1337, function(){
	console.log("Server running on port 1337");
});

