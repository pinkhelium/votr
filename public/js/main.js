
var app = angular.module('votrApp',['ngRoute']);

app.config(function($routeProvider){
	$routeProvider
		.when('/',{
			templateUrl: "./views/home.html",
			controller: "MainCtrl"
		})
		.when('/dashboard', {
			templateUrl: "./views/dashboard.html",
			controller: "DashboardCtrl",
		})
		.when('/vote', {
			templateUrl: './views/vote.html',
			controller: 'VoteCtrl'
		})
		.when('/result', {
			templateUrl: './views/result.html',
			controller: 'ResultCtrl'
		})
		.when('/prevote', {
			templateUrl: './views/prevote.html',
			controller: 'PrevoteCtrl'
		})
		.when('/candidate', {
			templateUrl: './views/candidate.html',
			controller: 'CandidateCtrl'
		})
});


app.controller("MainCtrl", function($scope,$http){
	//$scope.pageName = $scope.$parent.pageName;
	$scope.user.loggedIn = $scope.$parent.user.loggedIn;
	$scope.logUserIn = $scope.$parent.logUserIn;
	$scope.user.admin = $scope.$parent.user.admin;
	$scope.user.displayName = $scope.$parent.user.displayName;
	$scope.user.isValidACMMember = $scope.$parent.user.isValidACMMember;
	$scope.user.picture = $scope.$parent.user.picture;
});

app.controller("DashboardCtrl", function($scope,$http,$q,$route){

	//Nominate Part

	//Inherited for logging in the user
	$scope.user.loggedIn = $scope.$parent.user.loggedIn;
	$scope.logUserIn = $scope.$parent.logUserIn;
	$scope.user.admin = $scope.$parent.user.admin;
	$scope.votrType = $scope.$parent.votrType;
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
				$route.reload();
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
			$route.reload();
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

})

app.controller("AppCtrl", function($scope,$http,$q){

	//Call to check what type of votr session this is.
	$scope.getTypeOfVotr = function(){
		var promise = votrType();
		promise.then(function success(data){
			$scope.votrType = data;
		})
	}

	var votrType = function(){

		var deferred = $q.defer();
		$http({
			url: '/votrtype',
			method: 'GET',
		}).then(function success(response){
			deferred.resolve(response.data);
		}, function error(error){
			deferred.reject(error);
		})

		return deferred.promise;
	}

	$scope.user = {};
	$scope.nominees = {};

	//Setting default user object
	$scope.user.loggedIn = false;
	$scope.user.isValidACMMember = false;
	$scope.user.admin = false;
	$scope.user.displayName = "";
	$scope.user.picture = {
		location: '/images/ui-anim_basic_16x16.gif'
	};

	$scope.getUser = function(){
		var deferred = $q.defer();
		$http({
			method: 'GET',
			url: '/user'
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

	$scope.getUserPermissions = function(){
		var deferred = $q.defer();
		if($scope.user.loggedIn == true){

			$http({
				method: 'GET',
				url: '/user/permissions'
			}).then(function success(response){
				console.log("function getUserPermissions: success");
				console.log(response);
				deferred.resolve(response.data);
			}, function error(response){
				console.log("function getUserPermissions: error");
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

		var permissionsPromise = $scope.getUserPermissions();
		permissionsPromise.then(function success(data){
			console.log("Permissions got successfully.");
			console.log(data);
			$scope.user.admin = data.isAdmin;
			$scope.user.isValidACMMember = data.isValidACMMember;
			console.log("$scope.user.admin: " + $scope.user.admin);
			console.log("$scope.user.isValidACMMember: " + $scope.user.isValidACMMember);
		}, function error(data){
			console.log("PermissionsError:"+data);
		});


		var detailsPromise = $scope.getMoreDetails();
		detailsPromise.then(function success(data){
			console.log("Picture got successfully.");
			console.log(data);
			$scope.user.picture = data;
		}, function error(data){
			console.log("PictureError");
			console.log(data);
		});

	}, function error(data){
		console.log("LoginError:" + data);
	});
});


app.controller('ResultCtrl', function($scope,$http,$q){
	//Results
	$scope.populateTable= function(){

		var promise = getData();

		promise.then(function success(data){
			for(key in data){
				var newEntry = [];
				newEntry.push(key);
				newEntry.push(data[key].CScore);
				newEntry.push(data[key].VScore);
				newEntry.push(data[key].TScore);
				newEntry.push(data[key].SScore);

				dataSet.push(newEntry);
				console.log(dataSet);
			}
			drawChart();
		})

	}

	var getData = function(){
		var deferred = $q.defer();

		$http({
			'url':'/tabledata',
			'method': 'GET',
		}).then(function success(response){
			deferred.resolve(response.data);
		} , function error(error){
			deferred.reject(error);
		})

		return deferred.promise;
	}
	google.charts.load('current', {'packages':['bar']});
	google.charts.setOnLoadCallback(drawChart);
	var dataSet = [
	  ['', 'CScore', 'VScore', 'TScore', 'SScore']
	]

	$scope.add = function(){
	  drawChart();
	}

	function drawChart() {
		var data = google.visualization.arrayToDataTable(dataSet);
		var options = {
		  bars: 'horizontal' // Required for Material Bar Charts.
		};

		var chart = new google.charts.Bar(document.getElementById('barchart_material'));

		chart.draw(data, options);
	}
})

app.controller('PrevoteCtrl', function($scope,$q,$http){
	$scope.user.loggedIn = $scope.$parent.user.loggedIn;

	$scope.getCandidates = function(){
		var promise = serverCall();
		promise.then(function success(data){
			$scope.candidates = data;
		});
	}

	var serverCall = function(){
		var deferred = $q.defer();

		$http({
			url: '/candidates',
			method: "GET"
		}).then(function success(response){
			deferred.resolve(response.data);
		} ,function error(error){
			deferred.reject(error);
		})

		return deferred.promise;
	}

	$scope.addCandidate = function(candidateName){

		$http({
			url: "/candidates",
			method: "POST",
			data: {
				candidateName : candidateName
			}
		}).then(function success(response){
			console.log(response.data);
		}, function error(error){
			console.log(error);
		})
	}

	$scope.voteCandidate = function(candidateName){
		$http({
			url: '/nominate',
			method: "POST",
			data: {
				candidateName: candidateName
			}
		}).then(function success(response){
			console.log(response.data);
		}, function error(error){
			console.log(error);
		})
	}
})

app.controller('VoteCtrl', function($scope,$http,$q,$location){


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
				$scope.$parent.voteMessage = "Vote Successfully Cast";
			}
			else{
				$scope.$parent.voteMessage = "Something Went Wrong";
			}
			$location.path("/")
		}, function error(error){
			$scope.voteMessage = error;
		})
	}

});

app.controller('')