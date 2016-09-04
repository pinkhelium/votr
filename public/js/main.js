var app = angular.module('votrApp',['ngRoute', 'toaster']);

app.config(function($routeProvider){
	$routeProvider
		.when('/',{
			templateUrl: "./views/home.html",
			controller: "MainCtrl"
		})
		// .when('/dashboard', {
		// 	templateUrl: "./views/dashboard.html",
		// 	controller: "DashboardCtrl",
		// })
		// .when('/karanneedstovote', {
		// 	templateUrl: './views/vote.html',
		// 	controller: 'VoteCtrl'
		// })
		.when('/flamingeyelid', {
			templateUrl: './views/result.html',
			controller: 'ResultCtrl'
		})
		.when('/404', {
			templateUrl: './views/404.html'
		})
		// .when('/prevote', {
		// 	templateUrl: './views/prevote.html',
		// 	controller: 'PrevoteCtrl'
		// })
		// .when('/candidatedashboard', {
		// 	templateUrl: './views/candidateDashboard.html',
		// 	controller: 'CandidateDashboardCtrl'
		// })
		// .when('/candidates', {
		// 	templateUrl: './views/candidates.html',
		// 	controller: 'CandidatesCtrl'
		// })
		// .when('/nominationsResults', {
		// 	templateUrl: './views/nominationResults.html',
		// 	controller: 'NominationResultsCtrl'
		// })
		// .when('/candidate/:c_id', {
		// 	templateUrl: './views/singleCandidate.html',
		// 	controller: 'SingleCandidateCtrl'
		// })
		.otherwise({
			redirectTo: '/404'
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

app.controller("DashboardCtrl", function($scope,$http,$q,$location,toaster,$route){

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
			url: '/tabledata',
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
			toaster.pop("error","Adding Nominee",error.data);
			deferred.reject(error);
		})

		return deferred.promise;
	}

	//Switching between VOTR-types

	$scope.votrType = $scope.$parent.votrType;
	$scope.masterPassword = '';
	
	$scope.votrModeChange = function(masterPassword){
		var promise = changeMode(masterPassword);
		promise.then(function success(data){

			if($scope.votrType == 'prevote'){
				$scope.$parent.votrType = 'vote';
				toaster.pop("success","VOTR Type", "VOTR Type Changed to vote");
			}
			else if($scope.votrType == 'vote'){
				$scope.$parent.votrType = 'prevote';
				toaster.pop("success","VOTR Type", "VOTR Type Changed to prevote")
			}
			$location.path("/");
		}, function error(error){
			toaster.pop("error","VOTR Type", "Something Went Wrong" );
			console.log(error);
			$location.path('/');
		})
	}

	var changeMode = function(masterPassword){

		var deferred = $q.defer();

		$http({
			url : '/changemode',
			method: 'POST',
			data: {
				password: masterPassword
			}
		}).then(function success(response){
			if(response.data == 'success'){
				deferred.resolve(response.data);
			}
			else{
				deferred.reject(response.data);
			}
		}, function error(){
			deferred.reject(error);
		})

		return deferred.promise;
	}


	//Mass Message

	$scope.addMassMessage = function(message){

		$http({
			url: 'message',
			method: 'POST',
			data: {
				message: message
			}
		}).then(function success(response){
			toaster.pop("success","Message From Admin", "Added Successfully");
			$scope.$parent.getMassMessage();
			$location.path('/');
		}, function error(){
			toaster.pop("error","Message From Admin", "Something Went Wrong");
			$location.path('/')
		})
	}
});

app.controller("AppCtrl", function($scope,$http,$q){

	//Call to check what type of votr session this is.
	$scope.getTypeOfVotr = function(){
		var promise = votrType();
		promise.then(function success(data){
			console.log("Data: " + data);
			$scope.votrType = data;
		})
	}

	$scope.getMassMessage = function(){
		var promise = massMessage();
		promise.then(function success(data){
			$scope.massMessagesArray = [];
			$scope.massMessages = data;
			for(key in $scope.massMessages){
				if($scope.massMessages[key].dateJSON.day < 10){
					$scope.massMessages[key].dateJSON.day = "0" + $scope.massMessages[key].dateJSON.day;
				}
				if($scope.massMessages[key].dateJSON.month < 10){
					$scope.massMessages[key].dateJSON.month = "0" + $scope.massMessages[key].dateJSON.month;
				}
				//$scope.massMessages[key].date = new Date($scope.massMessages[key].date);
				$scope.massMessagesArray.push($scope.massMessages[key]);		
			}
			$scope.massMessagesArray.sort(function(a, b) {
			    a = new Date(a.date);
			    b = new Date(b.date);
			    return a>b ? -1 : a<b ? 1 : 0;
			});
			//console.log(massMessagesArray);
		})
	}

	var massMessage = function(){
		var deferred = $q.defer();

		$http({
			url: '/message',
			method: 'GET',
		}).then(function success(response){
			deferred.resolve(response.data);
		}, function error(error){
			deferred.reject(error);
		})

		return deferred.promise;
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
	$scope.user.nominee = false;
	$scope.user.displayName = "";
	$scope.user.picture = {
		url: '/images/ui-anim_basic_16x16.gif'
	};
	$scope.user.cover = {};


	var isNominee = function(){
		var deferred = $q.defer();

		$http({
			method: 'GET',
			url: '/nominees'
		}).then(function success(response){
			deferred.resolve(response.data);
		}, function error(error){
			deferred.reject(error);
		})

		return deferred.promise;
	}


	$scope.checkNominee = function(){
		var promise = isNominee();
		promise.then(function success(data){
			for (key in data){
				if(data[key] === $scope.user.displayName){
					$scope.user.nominee = true;
					console.log("IS NOMINEE");
				}
			}
		})
	}


	
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
				url: '/user/more'	
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
		//Just to trigger these functions on call
		$scope.checkNominee();
		$scope.getTypeOfVotr();
		$scope.getMassMessage();
		///--------------------------------------
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
			$scope.user.picture = data.picture.data;
			$scope.user.cover = data.cover;
			console.log("cover: ");
			console.log($scope.user.cover);
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
	$scope.nominees = [];
	$scope.populateTable= function(){

		var promise = getData();

		promise.then(function success(data){
			// $scope.nominees = data;
			for(key in data){
				var newEntry={};
				newEntry.name = key;
				newEntry.CScore = data[key].CScore;
				newEntry.VScore = data[key].VScore;
				newEntry.TScore = data[key].TScore;
				newEntry.SScore = data[key].SScore;
				newEntry.TotalScore = 8*newEntry.CScore + 4*newEntry.VScore + 2*newEntry.TScore + newEntry.SScore;
				$scope.nominees.push(newEntry);
			}

			$scope.nominees.sort(function(a,b){
				// return (a.TotalScore - b.TotalScore);
				if( (b.CScore - a.CScore) != 0 ){
					return (b.CScore - a.CScore);
				} 
				else if( (b.VScore - a.VScore)!=0 ){
					return (b.VScore - a.VScore);
				}
				else if( (b.TScore - a.TScore)!=0 ) {
					return (b.TScore - a.TScore);
				}
				else{
					return (b.SScore - a.SScore);
				}

			});
		});
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
});

app.controller('PrevoteCtrl', function($scope,$q,$http,$location,toaster){
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
			url: '/candidatenames',
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
			toaster.pop("success","Adding Candidate", "Candidate Added");
			$location.path('/');

		}, function error(error){
			console.log(error);
			if(error.data = "Candidate not a member of PESITSouth ACM Facebook Group"){
				toaster.pop("error","Adding Candidate", error.data);
			} else {
				toaster.pop("error","Adding Candidate", "Something Went Wrong");	
			}
			$location.path('/');
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
			toaster.pop("success","Nominate Candidate", "Candidate Nominated");
			$location.path('/');
		}, function error(error){
			console.log(error);
			toaster.pop("error","Nominate Candidate", "Something Went Wrong");
			$location.path('/');
		})
	}
})

app.controller('VoteCtrl', function($scope,$http,$q,$location,toaster){


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
				toaster.pop("success","Voting", "Vote Cast Successfully");
			}
			else{
				toaster.pop("error","Voting", "Something Went Wrong");
			}
			$location.path("/")
		}, function error(error){
			$scope.voteMessage = error;
		})
	}
});

app.controller('CandidateDashboardCtrl', function($scope,$http,$q,$route,$location,toaster){
	$scope.user.displayName = $scope.$parent.user.displayName;
	$scope.user.picture = $scope.$parent.user.picture;

	$scope.getPitch = function(){
		var promise = pitch();
		promise.then(function success(data){
			console.log("HERE PITCH");
			$scope.pitch = data;
		})
	}

	var pitch = function(){

		var deferred = $q.defer();

		$http({
			url: '/pitch',
			method: 'GET'
		}).then(function success(response){
			deferred.resolve(response.data);
		}, function error(error){
			deferred.reject(error);
		})

		return deferred.promise;
	}

	$scope.addPitch = function(pitch){
		console.log("here: " + pitch);
		$http({
			method: "POST",
			url: '/pitch',
			data: {
				pitch: pitch,
				picture: $scope.user.picture
			}
		}).then(function success(response){
			console.log(response.data);
			if(response.data == "Success"){
				//$scope.$parent.voteMessage = "Pitch Successfully Added";
				toaster.pop('success', "Pitch", "Added");
				$location.path("/");
			}
			else{
				toaster.pop('error', "Pitch", "Something Went Wrong");
				$location.path("/");
			}
			
		}, function error(error){
			console.log("AddDescription: " + error);
		})
	}
});

app.controller('CandidatesCtrl', function($http,$scope,$q,$route){

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
			url: '/nameandpitch',
		}).then(function success(response){
			console.log(response);
			deferred.resolve(response.data);
		}, function(error){
			deferred.reject(error);
		})
		return deferred.promise;
	}
	$scope.randomsort = function(){
		return 0.5 - Math.random();
	}
});

app.controller('NominationResultsCtrl', function($http,$scope,$q){

	$scope.getCandidates = function(){
		var promise = serverCall();
		promise.then(function success(data){
			$scope.candidates = [] ;
			for(key in data){
				var newEntry = data[key];
				newEntry.name = key;
				$scope.candidates.push(newEntry);
			}
			console.log($scope.candidates);
			$scope.candidates.sort(function(a, b) {
			    a = a.count;
			    b = b.count;
			    console.log("Sort");
			    return a>b ? -1 : a<b ? 1 : 0;
			});

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

});

app.controller('TabCtrl', [function() {
    angular.element(document).ready(function () {
        $('ul.tabs li').click(function(){
		var tab_id = $(this).attr('data-tab');

		$('ul.tabs li').removeClass('current');
		$('.tab-content').removeClass('current');

		$(this).addClass('current');
		$("#"+tab_id).addClass('current');
	});
    });
}]);

app.controller('SingleCandidateCtrl', function($scope, $q, $http, $routeParams) {

	$scope.uid = $routeParams.c_id;
	$scope.thisNominee = null;

    $scope.getNominees = function(){
		var promise = nomineesCall();
		console.log("---------------------------------------HERE");
		promise.then(function success(data){
			for (nom in data){
				if(data[nom].uid == $routeParams.c_id){
					$scope.thisNominee = data[nom];
					console.log('nomgot: ');
					console.log($scope.thisNominee);
				}
			}
		});
	}

	var nomineesCall = function(){
		var deferred = $q.defer();

		$http({
			method: 'GET',
			url: '/nameandpitch',
		}).then(function success(response){
			console.log(response);
			deferred.resolve(response.data);
		}, function(error){
			deferred.reject(error);
		})
		return deferred.promise;
	}
});
