
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
	$scope.user.picture = {};

	$scope.getUser = function(){
		var deferred = $q.defer();
		$http({
			method: 'GET',
			url: '/getSession'
		}).then(function success(response){
			console.log("function getUser: success");
			console.log(response);
			deferred.resolve(response.data);

		}, function error(response){
			console.log("function getUser: error");
			console.log(response);
			deferred.reject(response);
		});
		return deferred.promise;
	};

	$scope.getMoreDetails = function(){
		var deferred = $q.defer();
		if($scope.user.loggedIn == true){
			$http({
				method: 'GET',
				url: '/user/picture'	
			}).then(function success(response){
				console.log("function getMoreDetails: success");
				console.log(response);
				deferred.resolve(response.data);
			}, function error(response){
				console.log("function getMoreDetails: error");
				console.log(response);
				deferred.reject(response);
			});
		}
		else{
			deferred.reject("UserNotLoggedIn");
		}
		return deferred.promise;
	};

	var loginPromise = $scope.getUser();
	loginPromise.then(function success(data){

		$scope.user.loggedIn = data.loggedIn;
		$scope.user.admin = data.admin;
		$scope.user.displayName = data.displayName;
		console.log("$scope.user: ");
		console.log($scope.user);

		var detailsPromise = $scope.getMoreDetails();

		detailsPromise.then(function success(data){
			console.log("Success picture");
			console.log(data);
			$scope.user.picture = data;
		}, function error(data){
			console.log("Error picture");
			console.log(data);
		});

	}, function error(data){
		console.log("Error:" + data);
	});

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