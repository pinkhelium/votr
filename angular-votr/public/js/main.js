
var app = angular.module('votrApp',['ngRoute','mgcrea.ngStrap']);

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
		.when('/vote', {
			templateUrl: './views/vote.html',
			controller: 'VoteCtrl'
		})
		.when('/nominate', {
			templateUrl: './views/nominate.html',
			controller: 'NominateCtrl'
		})
});


app.controller("MainCtrl", function($scope,$http){
	//$scope.pageName = $scope.$parent.pageName;
	$scope.user.loggedIn = $scope.$parent.user.loggedIn;
	$scope.logUserIn = $scope.$parent.logUserIn;
	$scope.user.admin = $scope.$parent.user.admin;
	$scope.user.displayName = $scope.$parent.user.displayName
});

app.controller("AppCtrl", function($scope,$http,$q){
	$scope.user = {};
	$scope.nominees = {};
	$scope.user.loggedIn = false;
	$scope.user.admin = false;
	$scope.user.displayName = "";

	// $scope.logUserIn = function(){
	// 	// console.log("Here")
	// 	// var promise = loginCall();
	// 	// promise.then(function(data){
	// 	// 	if(data=="success"){
	// 	// 		console.log("Here")
	// 	// 		$user.loggedIn = true;
	// 	// 		$location.path('/home')
	// 	// 	}
	// 	// })
	// 	//function that hits the passport endpoint
	// }

	// var loginCall = function(){
	// 	var deferred = $q.defer();
	// 	$http({
	// 		method: 'GET',
	// 		'url': '/login',
	// 	}).then(function success(response){
	// 		deferred.resolve(response.data);
	// 	}, function error(error){
	// 		deferred.reject(error);
	// 	})

	// 	return deferred.promise;
	// }

	$scope.getUser = function(){
		var deferred = $q.defer();
		$http({
			method: 'GET',
			url: '/getSession'
		}).then(function success(response){
			console.log("function getUser: success");
			console.log(response);
			$scope.user.loggedIn = response.data.loggedIn;
			$scope.user.admin = response.data.admin;
			$scope.user.displayName = response.data.displayName;
			console.log("$scope.user: ");
			console.log($scope.user);

		}, function error(response){
			console.log("function getUser: error");
			console.log(error);
		});
	};
	$scope.getUser();

});

app.controller('NominateCtrl', function($scope,$http,$q){

	//Inherited for logging in the user
	$scope.user.loggedIn = $scope.$parent.user.loggedIn;
	$scope.logUserIn = $scope.$parent.logUserIn;
	$scope.user.admin = $scope.$parent.user.admin;
	//$scope.uid = 0;
	//To get all the nominees
	$scope.getNominees = function(){
		var promise = nomineesCall();

		promise.then(function success(data){
			$scope.nominees = data;
		})
	}

	var nomineesCall = function(){
		var deferred = $q.defer();

		$http({
			method: 'GET',
			url: '/nominees',
		}).then(function success(response){
			console.log(response);
			deferred.resolve(response.data);
		}, function(error){
			deferred.reject(error);
		})
		return deferred.promise;
	}

	//To remove a nominee
	$scope.removeNominee = function(nominee){
		console.log("Here: " + nominee);
		$http({
			url: '/nominees',
			method: 'DELETE',
			params: {
				'nominee' : nominee
			}
		}).then(function success(response){
			if(response.data == "success"){
				$scope.nominateMessage = "Deleted";
				getNominees();
			}
			else{
				$scope.nominateMessage = response.data;
			}
		}, function error(error){
			console.log(error);
		})
	}

	//To add a nominee
	$scope.newNominee = function(uid){
		console.log(uid);
		var promise = addNominee(uid);
		promise.then(function success(data){
			$scope.nominateMessage = data
		});
	}

	var addNominee = function(uid){
		var deferred = $q.defer();
		console.log(uid);
		$http({
			method: "POST",
			url: '/nominees',
			data: {
				"uid": uid
			}
		}).then(function success(response){
			console.log("addNominee: "+ response.data);
			deferred.resolve(response.data);
		} , function error(error){
			console.log("addNominee(Error): " + error);
			deferred.reject(error);
		})

		return deferred.promise;
	}


});

app.controller('VoteCtrl', function($scope,$http,$q){


	//Inherited for logging in the user
	$scope.user.loggedIn = $scope.$parent.user.loggedIn;
	$scope.logUserIn = $scope.$parent.logUserIn;
	$scope.user.displayName = $scope.$parent.user.displayName;
	$scope.user.admin = $scope.$parent.user.admin;

	//$scope.getNominees = $scope.$parent.getNominees;
	$scope.getNominees = function(){
		var promise = nomineesCall();

		promise.then(function success(data){
			$scope.nominees = data;
		})
	}

	var nomineesCall = function(){
		var deferred = $q.defer();

		$http({
			method: 'GET',
			url: '/nominees',
		}).then(function success(response){
			console.log(response);
			deferred.resolve(response.data);
		}, function(error){
			deferred.reject(error);
		})
		return deferred.promise;
	}

	$scope.castVote = function(vote){
		$http({
			url: '/vote',
			method: 'POST',
			data: {
				user: $scope.user.displayName,
				vote: vote
			}
		}).then(function success(response){
			if(response.data == "success"){
				$scope.voteMessage = "Vote Cast";
			}
			else{
				$scope.voteMessage = "Something Went Wrong";
			}
		}, function error(error){
			$scope.voteMessage = error;
		})
	}

});