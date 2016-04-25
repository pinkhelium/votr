
var app = angular.module('votrApp',['ngRoute']);

app.config(function($routeProvider){
	$routeProvider
		.when('/',{
			templateUrl: "./views/home.html",
			controller: "MainCtrl"
		})
		.when('/dashboard', {
			templateUrl: "./views/dashboard.html",
			controller: "MainCtrl",
		})
});


app.controller("MainCtrl", function($scope){
	//$scope.pageName = $scope.$parent.pageName;
	$scope.user.loggedIn = $scope.$parent.user.loggedIn;
	$scope.logUserIn = $scope.$parent.logUserIn;
});

app.controller("AppCtrl", function($scope,$http){
	$scope.user = {};
	$scope.user.loggedIn = false;
	$scope.user.admin = false;
	$scope.logUserIn = function(){
		console.log("Function Hit!");
		//function that hits the passport endpoint
	}
})