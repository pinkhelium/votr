var express = require('express');
var app = express();

app.listen(1337, function(){
	console.log("Server running on port 1337");
})

app.use(express.static(__dirname + "/public"));