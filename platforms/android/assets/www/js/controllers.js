angular.module('animeApp.controllers', [])
.controller('animeCtrl', ['$scope', 'animeHTTP', 'localService', '$timeout', '$ionicLoading', function($scope, animeHTTP, localService, $timeout, $ionicLoading) {
  //load main list
  $scope.Data = [];
  $scope.Page = 0;
  $scope.message = "";
  $scope.isDataExist = true;
  
  var loadSuccess = function(data, status) {
	  $ionicLoading.hide();
	  var isObj = data instanceof Object;
	  if(!isObj) { 
		 $scope.message = "Error occured while processing your request";
	  }
	  else if(data.status == 'error') {
		 $scope.message = data.message;
		 $scope.isDataExist = false;
	  }
	  else {
		  if(data.records.length > 0) {
			  $scope.Data = $scope.Data.concat(data.records); 
		  } else {
			  $scope.isDataExist = false;
		  }
		  $scope.$broadcast('scroll.infiniteScrollComplete');
	  }
  };
  var loadError = function(data, status, headers, config) {
	  $scope.message = "Error occured";
	  $ionicLoading.hide();
  }
  
  $scope.$on('$stateChangeSuccess', function() {
    $scope.loadMore();
  });

  $scope.loadMore = function() {
	  $scope.Page++;
	  $ionicLoading.show({
		  template: 'Loading...'
	  });
	  var url = domain + "fetch.php?p=" + $scope.Page;
	  animeHTTP.httpProcess(url)
		  .success(loadSuccess)
		  .error(loadError); 
  };
}])
.controller('LoadingCtrl', function($scope, $ionicLoading) {
  $scope.show = function() {
    $ionicLoading.show({
      template: 'Loading...'
    });
  };
  $scope.hide = function(){
    $ionicLoading.hide();
  };
})
.controller('AppCtrl', function($scope, $ionicModal, $timeout, $stateParams, $ionicHistory, $state, animeHTTP, localService, $cookies, $cookieStore) {
  $scope.items = [];
  if(localService.getLoggedIn()) {
	  $scope.items = [
	    { name: 'My Account', icon: 'ion-home', redirect: '/app/myaccount' },
		{ name: 'My Anime', icon: 'ion-heart', redirect: '/app/myanime' },
		{ name: 'Signout', icon: 'ion-power', redirect: '/app/signout' }
	  ];
  } else {
	  $scope.items = [
		{ name: 'Login', icon: 'ion-share', redirect: '/app/login' },
		{ name: 'Register', icon: 'ion-upload', redirect: '/app/register'}
	  ];
  }
	
  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });
  
   // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };
  
	$scope.procLink = function(name, lnk) {
		$ionicHistory.nextViewOptions({
		   disableBack: true
	    });
		switch(name) {
			case "Login":
			   $scope.modal.show();
			break;
			case "Register":
			   $state.go("app.register");
			break;
			case "My Account":
			   $state.go("app.myaccount");
			break;
			case "My Anime":
			   $state.go("app.myanime");
			break;
			case "My Points":
			   $state.go("app.mypoints");
			break;
			case "My Profile":
			  $state.go("app.myprofile");
			break;
			case "Signout":
			  $cookieStore.remove("auth")
			  $scope.items = [
				{ name: 'Login', icon: 'ion-share', redirect: '/app/login' },
				{ name: 'Register', icon: 'ion-upload', redirect: '/app/register'}
			  ];
			  $state.go("app.core");
			break;
		}
   }
	
   $scope.searchClk = function(query) {
	  /*if (keyEvent.which == 13) { */
		  $ionicHistory.nextViewOptions({
			 disableBack: true
		  });
		  var timestamp = new Date().getUTCMilliseconds();
		  $state.go("app.search",  { "query": encodeURIComponent(query), "guide": timestamp});
	  //}
   }
   
   $scope.asearchClk = function() {
	  $ionicHistory.nextViewOptions({
		 disableBack: true
	  });
	  $state.go("app.advance");
   }
  
   $scope.StartProcessing = false;
   $scope.user = localService.getUser();
   $scope.message = "";
   
   var actionSuccess = function(data, status) {
		$scope.StartProcessing = false;
		 var isObj = data instanceof Object;
		 if(!isObj) { 
			 $scope.message = "Error occured while processing your request";
		 }
		 else if(data.status == 'success') {
			 $cookieStore.put('auth', data);
			 console.log(data);
			 $scope.items = [
				{ name: 'My Account', icon: 'ion-home', redirect: '/app/myaccount' },
				{ name: 'My Anime', icon: 'ion-heart', redirect: '/app/myanime' },
				{ name: 'Signout', icon: 'ion-power', redirect: '/app/signout' }
			  ];
			 $scope.closeLogin();
			 $ionicHistory.nextViewOptions({
				 disableBack: true
			 });
			 $state.go("app.myaccount");
		} else {
			 $scope.message = data.message;
		}
	};
		  
	var actionError = function(data, status, headers, config) {
		  $scope.message = "Error occured";
		  $scope.StartProcessing = false;
	}
		
   $scope.processLogin = function(user) {
	    console.log(user);
	    $scope.StartProcessing = true;
	    var url = domain + "login.php";
		animeHTTP.actionProcess(url, {
			  username: user.username,
			  password: user.password
			  })
			 .success(actionSuccess)
			 .error(actionError);
   };
   
   $scope.forgot = function() {
	    $scope.closeLogin();
	    $ionicHistory.nextViewOptions({
			disableBack: true
		});
		$state.go("app.forgotpass");
   };
}) // login page
.controller('LoginCtrl', function($scope, $timeout, $stateParams, $ionicHistory, $state, animeHTTP, localService, $cookies, $cookieStore, $ionicLoading, $ionicPopup) {
   $scope.user = localService.getUser();
   $scope.message = "";
   
   var actionSuccess = function(data, status) {
		 $ionicLoading.hide();
		 var isObj = data instanceof Object;
		 if(!isObj) { 
		      var alertPopup = $ionicPopup.alert({
				 title: 'Error Occured!',
				 template: 'Error occured while processing your request'
			   });
			   alertPopup.then(function(res) {
				   console.log("alert closed");
			   });
		 }
		 else if(data.status == 'success') {
			 $cookieStore.put('auth', data);
			  $ionicHistory.nextViewOptions({
				 disableBack: true
			  });
			  $state.go("app.myaccount");
		} else {
			 console.log("login failed");
			 var alertPopup = $ionicPopup.alert({
				 title: 'Validation Error!',
				 template: data.message
			 });
			 alertPopup.then(function(res) {
				 console.log("alert closed");
			 });
			 //$scope.message = data.message;
		}
	};
		  
	var actionError = function(data, status, headers, config) {
		  $scope.message = "Error occured";
		  $ionicLoading.hide();
	}
		
   $scope.processLogin = function(user) {
	   $scope.message = "";
	    $ionicLoading.show({
			template: 'Processing...'
		});
	    var url = domain + "login.php";
		animeHTTP.actionProcess(url, {
			  username: user.username,
			  password: user.password
			  })
			 .success(actionSuccess)
			 .error(actionError);
   };
})
.controller('signoutController', function($scope, $ionicHistory, animeHTTP, localService, $cookies, $cookieStore, $state) {
    $cookieStore.remove("auth")
	$ionicHistory.nextViewOptions({
		disableBack: true
	});
	$state.go("app.core");
})
.controller('myprofileController', function($scope, $ionicHistory, $state, animeHTTP, localService, $cookies, $cookieStore, $ionicLoading, $ionicPopup) {
   // my profile controller
   
})
.controller('myanimeController', function($scope, $ionicHistory, $state, animeHTTP, localService, $cookies, $cookieStore, $ionicLoading, $ionicPopup) {
   // my points controller
    if(!localService.getLoggedIn()) {
	  $ionicHistory.nextViewOptions({
		 disableBack: true
	  });
	  $state.go("app.login");
   } else {
	  
   }
})
.controller('mysubscriptionController', function($scope, $ionicHistory, $state, animeHTTP, localService, $cookies, $cookieStore, $ionicLoading, $ionicPopup, $ionicListDelegate) {
   $scope.Data = [];
   $scope.message = "";
   $scope.isDataExist = true;
   $scope.Page = 0;
   $scope.showDelete = false;
   var removeSuccess = function(data, status) {
	   console.log(data);
   };
   
     var loadSuccess = function(data, status) {
	  $ionicLoading.hide();
	  var isObj = data instanceof Object;
	  if(!isObj) { 
		 $scope.message = "Error occured while processing your request";
	  }
	  else if(data.status == 'error') {
		  if($scope.Data.length == 0) {
			   $scope.message = "No Records Found!";
		  }
		
		 $scope.isDataExist = false;
	  }
	  else {
		  if(data.records.length > 0) {
			   $scope.message =""
			  $scope.Data = $scope.Data.concat(data.records); 
			  $scope.isDataExist = true;
		  } else {
			  $scope.isDataExist = false;
		  }
		  $scope.$broadcast('scroll.infiniteScrollComplete');
	  }
  };
 
  var loadError = function(data, status, headers, config) {
	  $scope.message = "Error occured";
	  $ionicLoading.hide();
  }

  if(!localService.getLoggedIn()) {
	  $ionicHistory.nextViewOptions({
		 disableBack: true
	  });
	  $state.go("app.login");
   } else {
	   ldMore();
   }
   
    $scope.deleteItem = function(id, obj, index) {
	  console.log("delete id clicked" + id);
	  obj.splice(index, 1);
	  if(obj.length == 0) {
		  $scope.message = "No Records Found!";
	  }
	  var url = domain + "unsubscribev2.php";
		 animeHTTP.actionProcess(url, { id: id })
		 .success(removeSuccess)
		 .error(loadError);
    };
 
   
    $scope.loadMore = function() {
	  ldMore();
   };
   
   function ldMore() {
	   $scope.isDataExist = false;
	   $scope.Page++;
		  $ionicLoading.show({
			  template: 'Loading...'
		  });
		  var logged_in_info = localService.getLoggedInfo();
	      var _userid = logged_in_info.userid;
		  var url = domain + "mysubscriptions.php?userid=" + _userid + "&p=" + $scope.Page;
		  console.log(url);
		  animeHTTP.httpProcess(url)
			  .success(loadSuccess)
			  .error(loadError); 
   }
 
})
.controller('watchedlistController', function($scope, $ionicHistory, $state, animeHTTP, localService, $cookies, $cookieStore, $ionicLoading, $ionicPopup) {
   $scope.Data = [];
   $scope.message = "";
  
   var loadSuccess = function(data, status) {
	  $ionicLoading.hide();
	  var isObj = data instanceof Object;
	  if(!isObj) { 
		 $scope.message = "Error occured while processing your request";
	  }
	  else if(data.status == 'error') {
		 $scope.message = data.message;
	  }
	  else {
		 $scope.Data = data.records; 
		 console.log($scope.Data);
	  }
  };
  var loadError = function(data, status, headers, config) {
	  $scope.message = "Error occured";
	  $ionicLoading.hide();
  }

  if(!localService.getLoggedIn()) {
	  $ionicHistory.nextViewOptions({
		 disableBack: true
	  });
	  $state.go("app.login");
   } else {
	   $ionicLoading.show({
		  template: 'Loading...'
	  });
	  var logged_in_info = localService.getLoggedInfo();
	  var _userid = logged_in_info.userid;
	  var url = domain + "myanime.php?userid=" + _userid;
	  animeHTTP.httpProcess(url)
		  .success(loadSuccess)
		  .error(loadError); 
   }
})
.controller('myanimecurrentlyController', function($scope, $ionicHistory, $state, animeHTTP, localService, $cookies, $cookieStore, $ionicLoading, $ionicPopup, $ionicListDelegate) {
   $scope.Data = [];
   $scope.message = "";
   $scope.isDataExist = true;
   $scope.Page = 0;
   $scope.showDelete = false;
   var removeSuccess = function(data, status) {
	   console.log(data);
   };
   
     var loadSuccess = function(data, status) {
	  $ionicLoading.hide();
	  var isObj = data instanceof Object;
	  if(!isObj) { 
		 $scope.message = "Error occured while processing your request";
	  }
	  else if(data.status == 'error') {
		 //$scope.message = data.message;
		 $scope.isDataExist = false;
	  }
	  else {
		  if(data.records.length > 0) {
			  $scope.message =""
			  $scope.Data = $scope.Data.concat(data.records); 
			  $scope.isDataExist = true;
		  } else {
			  $scope.isDataExist = false;
		  }
		  $scope.$broadcast('scroll.infiniteScrollComplete');
	  }
  };
 
  var loadError = function(data, status, headers, config) {
	  $scope.message = "Error occured";
	  $ionicLoading.hide();
  }

  if(!localService.getLoggedIn()) {
	  $ionicHistory.nextViewOptions({
		 disableBack: true
	  });
	  $state.go("app.login");
   } else {
	   ldMore();
   }
   
     $scope.deleteItem = function(id, obj, index) {
	  console.log("delete id clicked" + id);
	  obj.splice(index, 1);
	   if(obj.length == 0) {
		  $scope.message = "No Records Found!";
	  }
	  var url = domain + "remove_to_watch.php";
		 animeHTTP.actionProcess(url, { id: id })
		 .success(removeSuccess)
		 .error(loadError);
    };
 
   
    $scope.loadMore = function() {
	  ldMore();
   };
   
   function ldMore() {
	   $scope.isDataExist = false;
	   $scope.Page++;
		  $ionicLoading.show({
			  template: 'Loading...'
		  });
		  var logged_in_info = localService.getLoggedInfo();
	      var _userid = logged_in_info.userid;
		  var url = domain + "list_currently.php?userid=" + _userid + "&p=" + $scope.Page;
		  console.log(url);
		  animeHTTP.httpProcess(url)
			  .success(loadSuccess)
			  .error(loadError); 
   }
 
})
.controller('addmyanimecurrentlyController', function($scope, $ionicHistory, $state, animeHTTP, localService, $cookies, $cookieStore, $ionicLoading, $ionicPopup) {
   $scope.Series = [];
   $scope.FanSub = [];
   $scope.Movie = [];
   $scope.Ova = [];
   $scope.Live = [];
   
   $scope.selectedSeriesItems = [];
   $scope.selectedFansubItems = [];
   $scope.selectedMovieItems = [];
   $scope.selectedOvaItems = [];
   $scope.selectedLiveItems = [];
   $scope.smessage = "";
   var loadSuccess = function(data, status) {
	  $ionicLoading.hide();
	  var isObj = data instanceof Object;
	  if(!isObj) { 
		 $scope.message = "Error occured while processing your request";
	  }
	  else if(data.status == 'error') {
		 $scope.message = data.message;
	  }
	  else {
		 $scope.Series = data.series; 
		 $scope.FanSub = data.fansub;
		 $scope.Movie = data.movie;
		 $scope.Ova = data.ova;
		 $scope.Live = data.live;
		 
	  }
  };
  var loadError = function(data, status, headers, config) {
	  $scope.message = "Error occured";
	  $ionicLoading.hide();
  }

  if(!localService.getLoggedIn()) {
	  $ionicHistory.nextViewOptions({
		 disableBack: true
	  });
	  $state.go("app.login");
   } else {
	   $ionicLoading.show({
		  template: 'Loading...'
	  });
	  var logged_in_info = localService.getLoggedInfo();
	  var _userid = logged_in_info.userid;
	  var url = domain + "add_to_watch.php";
	  animeHTTP.httpProcess(url)
		  .success(loadSuccess)
		  .error(loadError); 
   }
   
   var actionSuccess = function(data, status) {
	  $ionicLoading.hide();
	  var isObj = data instanceof Object;
	  if(!isObj) { 
		 $scope.message = "Error occured while processing your request";
	  }
	  else if(data.status == 'error') {
		 $scope.message = data.message;
	  }
	  else {
	   var alertPopup = $ionicPopup.alert({
		 title: 'Success!',
		 template: 'Anime has been added to your list!'
	   });
	   alertPopup.then(function(res) {
	   });
	   $ionicHistory.nextViewOptions({
		 disableBack: true
	   });
	    $state.go("app.myanimecurrently");
	  }
  };
  
   $scope.addCurrently = function(series, fansub, movies, ova, live) {
	    $scope.message = "";
		var _selectedItems = [];
		if(series.length > 0) {
			for(var i =0; i<= series.length-1;i++) {
				_selectedItems.push({id: series[i], userid: _userid, type: '2'});
			}
		}
		if(fansub.length > 0) {
			for(var i =0; i<= fansub.length-1;i++) {
				_selectedItems.push({id: fansub[i], userid: _userid, type: '2'});
			}
		}
		if(movies.length > 0) {
			for(var i =0; i<= movies.length-1;i++) {
				_selectedItems.push({id: movies[i], userid: _userid, type: '2'});
			}
		}
		if(ova.length > 0) {
			for(var i =0; i<= ova.length-1;i++) {
				_selectedItems.push({id: ova[i], userid: _userid, type: '2'});
			}
		}
		if(live.length > 0) {
			for(var i =0; i<= live.length-1;i++) {
				_selectedItems.push({id: live[i], userid: _userid, type: '2'});
			}
		}
		if(_selectedItems.length == 0) {
		   var alertPopup = $ionicPopup.alert({
			 title: 'Validation!',
			 template: 'Please select at least one item to add'
		   });
		   alertPopup.then(function(res) {
		   });
		} else {
			 $ionicLoading.show({
				  template: 'Adding...'
			 });
			 
			 var url = domain + "add_to_watch_proc.php";
			 animeHTTP.actionProcess(url, _selectedItems)
			 .success(actionSuccess)
			 .error(loadError);
		}
   };
  
})
.controller('myanimelibraryController', function($scope, $ionicHistory, $state, animeHTTP, localService, $cookies, $cookieStore, $ionicLoading, $ionicPopup, $ionicListDelegate) {
   $scope.Data = [];
   $scope.message = "";
   $scope.isDataExist = true;
   $scope.showDelete = false;
   var removeSuccess = function(data, status) {
	   console.log(data);
   };
   $scope.Page = 0;
   
   var loadSuccess = function(data, status) {
	  $ionicLoading.hide();
	  var isObj = data instanceof Object;
	  if(!isObj) { 
		 $scope.message = "Error occured while processing your request";
	  }
	  else if(data.status == 'error') {
		  if($scope.Data.length == 0) {
			  $scope.message ="No Records Found!"
		  }
		 $scope.isDataExist = false;
	  }
	  else {
		  if(data.records.length > 0) {
			  $scope.message =""
			  $scope.Data = $scope.Data.concat(data.records); 
			   $scope.isDataExist = true;
		  } else {
			  $scope.isDataExist = false;
		  }
		 
		  $scope.$broadcast('scroll.infiniteScrollComplete');
	  }
  };
 
  var loadError = function(data, status, headers, config) {
	  $scope.message = "Error occured";
	  $ionicLoading.hide();
  }

  if(!localService.getLoggedIn()) {
	  $ionicHistory.nextViewOptions({
		 disableBack: true
	  });
	  $state.go("app.login");
   } else {
	   ldMore();
   }
      
    $scope.deleteItem = function(id, obj, index) {
	  console.log("delete id clicked" + id);
	  obj.splice(index, 1);
	   if(obj.length == 0) {
		  $scope.message = "No Records Found!";
	  }
	  var url = domain + "remove_to_watch.php";
		 animeHTTP.actionProcess(url, { id: id })
		 .success(removeSuccess)
		 .error(loadError);
    };
 
    $scope.loadMore = function() {
	  ldMore();
   };
   
   function ldMore() {
	    $scope.isDataExist = false;
	   $scope.Page++;
		  $ionicLoading.show({
			  template: 'Loading...'
		  });
		  var logged_in_info = localService.getLoggedInfo();
	      var _userid = logged_in_info.userid;
		  var url = domain + "list_library.php?userid=" + _userid + "&p=" + $scope.Page;
		  console.log(url);
		  animeHTTP.httpProcess(url)
			  .success(loadSuccess)
			  .error(loadError); 
   }
 
})
.controller('addmyanimelibraryController', function($scope, $ionicHistory, $state, animeHTTP, localService, $cookies, $cookieStore, $ionicLoading, $ionicPopup) {
   $scope.Series = [];
   $scope.FanSub = [];
   $scope.Movie = [];
   $scope.Ova = [];
   $scope.Live = [];
   
   $scope.selectedSeriesItems = [];
   $scope.selectedFansubItems = [];
   $scope.selectedMovieItems = [];
   $scope.selectedOvaItems = [];
   $scope.selectedLiveItems = [];
   $scope.smessage = "";
   var loadSuccess = function(data, status) {
	  $ionicLoading.hide();
	  var isObj = data instanceof Object;
	  if(!isObj) { 
		 $scope.message = "Error occured while processing your request";
	  }
	  else if(data.status == 'error') {
		 $scope.message = data.message;
	  }
	  else {
		 $scope.Series = data.series; 
		 $scope.FanSub = data.fansub;
		 $scope.Movie = data.movie;
		 $scope.Ova = data.ova;
		 $scope.Live = data.live;
		 
	  }
  };
  var loadError = function(data, status, headers, config) {
	  $scope.message = "Error occured";
	  $ionicLoading.hide();
  }

  if(!localService.getLoggedIn()) {
	  $ionicHistory.nextViewOptions({
		 disableBack: true
	  });
	  $state.go("app.login");
   } else {
	   $ionicLoading.show({
		  template: 'Loading...'
	  });
	  var logged_in_info = localService.getLoggedInfo();
	  var _userid = logged_in_info.userid;
	  var url = domain + "add_to_watch.php";
	  animeHTTP.httpProcess(url)
		  .success(loadSuccess)
		  .error(loadError); 
   }
   
   var actionSuccess = function(data, status) {
	  $ionicLoading.hide();
	  var isObj = data instanceof Object;
	  if(!isObj) { 
		 $scope.message = "Error occured while processing your request";
	  }
	  else if(data.status == 'error') {
		 $scope.message = data.message;
	  }
	  else {
	   var alertPopup = $ionicPopup.alert({
		 title: 'Success!',
		 template: 'Anime has been added to your list!'
	   });
	   alertPopup.then(function(res) {
	   });
	   $ionicHistory.nextViewOptions({
		 disableBack: true
	   });
	    $state.go("app.myanimelibrary");
	  }
  };
  
   $scope.addCurrently = function(series, fansub, movies, ova, live) {
	    $scope.message = "";
		var _selectedItems = [];
		if(series.length > 0) {
			for(var i =0; i<= series.length-1;i++) {
				_selectedItems.push({id: series[i], userid: _userid, type: '1'});
			}
		}
		if(fansub.length > 0) {
			for(var i =0; i<= fansub.length-1;i++) {
				_selectedItems.push({id: fansub[i], userid: _userid, type: '1'});
			}
		}
		if(movies.length > 0) {
			for(var i =0; i<= movies.length-1;i++) {
				_selectedItems.push({id: movies[i], userid: _userid, type: '1'});
			}
		}
		if(ova.length > 0) {
			for(var i =0; i<= ova.length-1;i++) {
				_selectedItems.push({id: ova[i], userid: _userid, type: '1'});
			}
		}
		if(live.length > 0) {
			for(var i =0; i<= live.length-1;i++) {
				_selectedItems.push({id: live[i], userid: _userid, type: '1'});
			}
		}
		if(_selectedItems.length == 0) {
		   var alertPopup = $ionicPopup.alert({
			 title: 'Validation!',
			 template: 'Please select at least one item to add'
		   });
		   alertPopup.then(function(res) {
		   });
		} else {
			 $ionicLoading.show({
				  template: 'Adding...'
			 });
			 
			 var url = domain + "add_to_watch_proc.php";
			 animeHTTP.actionProcess(url, _selectedItems)
			 .success(actionSuccess)
			 .error(loadError);
		}
   };
  
})
.controller('myanimewantController', function($scope, $ionicHistory, $state, animeHTTP, localService, $cookies, $cookieStore, $ionicLoading, $ionicPopup, $ionicListDelegate) {
   $scope.Data = [];
   $scope.message = "";
   $scope.isDataExist = true;
   $scope.Page = 0;
   $scope.showDelete = false;
   var removeSuccess = function(data, status) {
	   console.log(data);
   };
   
   var loadSuccess = function(data, status) {
	  $ionicLoading.hide();
	  var isObj = data instanceof Object;
	  if(!isObj) { 
		 $scope.message = "Error occured while processing your request";
	  }
	  else if(data.status == 'error') {
		  if($scope.Data.length == 0) {
			  $scope.message ="No Records Found!"
		  }
		 $scope.isDataExist = false;
	  }
	  else {
		  if(data.records.length > 0) {
			   $scope.message =""
			  $scope.Data = $scope.Data.concat(data.records); 
			   $scope.isDataExist = true;
		  } else {
			  $scope.isDataExist = false;
		  }
		 
		  $scope.$broadcast('scroll.infiniteScrollComplete');
	  }
  };
 
  var loadError = function(data, status, headers, config) {
	  $scope.message = "Error occured";
	  $ionicLoading.hide();
  }

  if(!localService.getLoggedIn()) {
	  $ionicHistory.nextViewOptions({
		 disableBack: true
	  });
	  $state.go("app.login");
   } else {
	   ldMore();
   }
   
   
    $scope.deleteItem = function(id, obj, index) {
	  console.log("delete id clicked" + id);
	  obj.splice(index, 1);
	   if(obj.length == 0) {
		  $scope.message = "No Records Found!";
	  }
	  var url = domain + "remove_to_watch.php";
		 animeHTTP.actionProcess(url, { id: id })
		 .success(removeSuccess)
		 .error(loadError);
    };
 

   
    $scope.loadMore = function() {
	  ldMore();
   };
   
   function ldMore() {
	   $scope.isDataExist = false;
	   $scope.Page++;
		  $ionicLoading.show({
			  template: 'Loading...'
		  });
		  var logged_in_info = localService.getLoggedInfo();
	      var _userid = logged_in_info.userid;
		  var url = domain + "list_want.php?userid=" + _userid + "&p=" + $scope.Page;
		  console.log(url);
		  animeHTTP.httpProcess(url)
			  .success(loadSuccess)
			  .error(loadError); 
   }
 
})
.controller('addmyanimewantController', function($scope, $ionicHistory, $state, animeHTTP, localService, $cookies, $cookieStore, $ionicLoading, $ionicPopup) {
   $scope.Series = [];
   $scope.FanSub = [];
   $scope.Movie = [];
   $scope.Ova = [];
   $scope.Live = [];
   
   $scope.selectedSeriesItems = [];
   $scope.selectedFansubItems = [];
   $scope.selectedMovieItems = [];
   $scope.selectedOvaItems = [];
   $scope.selectedLiveItems = [];
   $scope.smessage = "";
   var loadSuccess = function(data, status) {
	  $ionicLoading.hide();
	  var isObj = data instanceof Object;
	  if(!isObj) { 
		 $scope.message = "Error occured while processing your request";
	  }
	  else if(data.status == 'error') {
		 $scope.message = data.message;
	  }
	  else {
		 $scope.Series = data.series; 
		 $scope.FanSub = data.fansub;
		 $scope.Movie = data.movie;
		 $scope.Ova = data.ova;
		 $scope.Live = data.live;
		 
	  }
  };
  var loadError = function(data, status, headers, config) {
	  $scope.message = "Error occured";
	  $ionicLoading.hide();
  }

  if(!localService.getLoggedIn()) {
	  $ionicHistory.nextViewOptions({
		 disableBack: true
	  });
	  $state.go("app.login");
   } else {
	   $ionicLoading.show({
		  template: 'Loading...'
	  });
	  var logged_in_info = localService.getLoggedInfo();
	  var _userid = logged_in_info.userid;
	  var url = domain + "add_to_watch.php";
	  animeHTTP.httpProcess(url)
		  .success(loadSuccess)
		  .error(loadError); 
   }
   
   var actionSuccess = function(data, status) {
	  $ionicLoading.hide();
	  var isObj = data instanceof Object;
	  if(!isObj) { 
		 $scope.message = "Error occured while processing your request";
	  }
	  else if(data.status == 'error') {
		 $scope.message = data.message;
	  }
	  else {
	   var alertPopup = $ionicPopup.alert({
		 title: 'Success!',
		 template: 'Anime has been added to your list!'
	   });
	   alertPopup.then(function(res) {
	   });
	   $ionicHistory.nextViewOptions({
		 disableBack: true
	   });
	    $state.go("app.myanimewant");
	  }
  };
  
   $scope.addCurrently = function(series, fansub, movies, ova, live) {
	    $scope.message = "";
		var _selectedItems = [];
		if(series.length > 0) {
			for(var i =0; i<= series.length-1;i++) {
				_selectedItems.push({id: series[i], userid: _userid, type: '4'});
			}
		}
		if(fansub.length > 0) {
			for(var i =0; i<= fansub.length-1;i++) {
				_selectedItems.push({id: fansub[i], userid: _userid, type: '4'});
			}
		}
		if(movies.length > 0) {
			for(var i =0; i<= movies.length-1;i++) {
				_selectedItems.push({id: movies[i], userid: _userid, type: '4'});
			}
		}
		if(ova.length > 0) {
			for(var i =0; i<= ova.length-1;i++) {
				_selectedItems.push({id: ova[i], userid: _userid, type: '4'});
			}
		}
		if(live.length > 0) {
			for(var i =0; i<= live.length-1;i++) {
				_selectedItems.push({id: live[i], userid: _userid, type: '4'});
			}
		}
		if(_selectedItems.length == 0) {
		   var alertPopup = $ionicPopup.alert({
			 title: 'Validation!',
			 template: 'Please select at least one item to add'
		   });
		   alertPopup.then(function(res) {
		   });
		} else {
			 $ionicLoading.show({
				  template: 'Adding...'
			 });
			 
			 var url = domain + "add_to_watch_proc.php";
			 animeHTTP.actionProcess(url, _selectedItems)
			 .success(actionSuccess)
			 .error(loadError);
		}
   };
  
})

.controller('upgradeaccountController', function($scope, $ionicHistory, $state, animeHTTP, localService, $cookies, $cookieStore) {
   // upgrade controller
  if(!localService.getLoggedIn()) {
	  $ionicHistory.nextViewOptions({
		 disableBack: true
	  });
	  $state.go("app.login");
   } else {
	  
   }
})
.controller('RegisterCtrl', function($scope, $timeout, $ionicHistory, $state, animeHTTP, localService, $ionicLoading, $ionicPopup) {
 
   $scope.StartProcessing = false;
   $scope.message = "";
   $scope.days = [];
   $scope.year =[];
   $scope.user = localService.getUser();
   
   var i;
   for(i=1;i<=31;i++) {
	   $scope.days.push({
		   value: i,
		   name: i
	   });
   }
   var currentYear = new Date().getFullYear() - 5;
   var lastYear = currentYear - 80;
   for(i=currentYear;i>=lastYear;i--) {
	   $scope.year.push({
		   value: i,
		   name: i
	   });
   }
   
   var actionSuccess = function(data, status) {
	  $ionicLoading.hide();
	  var isObj = data instanceof Object;
		 if(!isObj) { 
		     var alertPopup = $ionicPopup.alert({
				 title: 'Error!',
				 template: "Error occured while processing your request, please provide data accurately"
			 });
			 alertPopup.then(function(res) {
				 console.log("alert closed");
			 });
		 }
      else if(data.status == 'success') {
		  $ionicHistory.nextViewOptions({
			 disableBack: true
		  });
		  $state.go("app.login");
	  } else {
		   var alertPopup = $ionicPopup.alert({
				 title: 'Error!',
				 template: data.message
		   });
		   alertPopup.then(function(res) {
			   console.log("alert closed");
		   });
	  }
  };
  
  var actionError = function(data, status, headers, config) {
	  $scope.message = "Error occured";
	  $ionicLoading.hide();
  }
   $scope.registerUrl = function(user) {
	   $scope.message = "";
	     $ionicLoading.show({
			template: 'Processing...'
	 	});
		 var url = domain + "register.php";
		 animeHTTP.actionProcess(url, {
			  username: user.username,
			  pass: user.pass, 
			  cpass: user.cpass,
			  city: user.city,
			  country: user.country,
			  day: user.day,
			  email: user.email,
			  gender: user.gender,
			  hiddenemail: user.hiddenemail,
			  hiddenname: user.hiddenname,
			  month: user.month,
			  name: user.name,
			  state: user.state,
			  year: user.year
			})
			.success(actionSuccess)
			.error(actionError);
	};
})
.controller('ForgotCtrl', function($scope, $timeout, animeHTTP, localService) {
  
   $scope.message = "";
   
})
.controller('myaccountController', function($scope, $timeout, $ionicHistory, $state, animeHTTP, localService, $ionicLoading) {
   $scope.paidstatus = "";
   $scope.data = [];
   $scope.info = [];
   // authentication
   if(!localService.getLoggedIn()) {
	  $ionicHistory.nextViewOptions({
		 disableBack: true
	  });
	  $state.go("app.login");
   } else {
	   $ionicLoading.show({
			template: 'Loading...'
	 	});
	   $scope.data =  localService.getLoggedInfo();
	   $scope.info = $scope.data.info;
	   console.log($scope.data);
	   console.log($scope.data.info);
	   $scope.paidstatus = localService.isPaidMember();
	   $ionicLoading.hide();
   }
   
})
.controller('searchListController', function($scope, $timeout, $ionicHistory, $state, $stateParams, animeHTTP, localService, $ionicLoading, $ionicPopup) {
   // initialize filter data from routeparams
   var sortOrder = "all";
   var char = "all";
   var genre = "all";
   var query = "all"
  

   if(typeof $stateParams != 'undefined') {
	  if(typeof $stateParams.genre != 'undefined')
		 genre = $stateParams.genre;
	  if(typeof $stateParams.char != 'undefined')	 
		 char = $stateParams.char;
	  if(typeof $stateParams.sort != 'undefined')	
		 sortOrder = $stateParams.sort;
      if(typeof $stateParams.query != 'undefined')	
		 query = $stateParams.query;
   }
   
   console.log(query);
   // store filter option in local server
   var opt = localService.getFilterOptions();
   opt.char = char;
   opt.sort = sortOrder;
   opt.genre = genre;
   opt.page = 'search';
   opt.query = query;
   $scope.message = "";
   localService.setFilterOptions(opt);
   
   $scope.isDataExist = true;
   $scope.Data = [];
   $scope.Page = 0;

	  var loadSuccess = function(data, status) {
		  $ionicLoading.hide();
		  var isObj = data instanceof Object;
		  if(!isObj) { 
		     var alertPopup = $ionicPopup.alert({
				 title: 'Error!',
				 template: "Error occured while processing your request"
			 });
			 alertPopup.then(function(res) {
				 console.log("alert closed");
			 });
		  }
		  else if(data.status == 'error') {
			  if($scope.Data.length > 0) {
				   $scope.isDataExist = false;
			  } else {
				var alertPopup = $ionicPopup.alert({
					 title: 'Error!',
					 template:  data.message
				 });
				 alertPopup.then(function(res) {
					 console.log("alert closed");
				 });
			  }
			  $scope.isDataExist = false;
		  }
		  else {
			  console.log("data is");
			  if(data.records.length > 0) {
				 $scope.Data = $scope.Data.concat(data.records);
				 console.log($scope.Data);
			  } else {
				 $scope.isDataExist = false;
			  }
			  $scope.$broadcast('scroll.infiniteScrollComplete');
		  }
	  };
	  
	  var loadError = function(data, status, headers, config) {
		   var alertPopup = $ionicPopup.alert({
			   title: 'Error!',
			   template: "Error occured while processing your request"
		   });
		   alertPopup.then(function(res) {
			  console.log("alert closed");
		   });
		   $ionicLoading.hide();
	  }
      /*$scope.$on('$stateChangeSuccess', function() {
        $scope.loadMore();
      }); */
	  $scope.loadMore = function() {
		  $ionicLoading.show({
			template: 'Loading...'
	 	  });
		  $scope.Page++;
		  var url = domain + "search.php?query=" + query + "&p=" + $scope.Page + "&genre=" + genre + "&char=" + char + "&sort=" + sortOrder;
		  console.log(url)
		  animeHTTP.httpProcess(url)
			  .success(loadSuccess)
			  .error(loadError); 
	  };
})
.controller('advsearchListController', function($scope, $timeout, $ionicHistory, $state, $stateParams, animeHTTP, localService, $ionicLoading, $ionicPopup) {
   $scope.Data = localService.getSearchData();
   $scope.message = "";
   $scope.isDataExist = true;
   $scope.searchData = localService.getSearch();
  console.log("search data");
  console.log($scope.searchData);
   if($scope.Data.length == 0) {
	  $ionicHistory.nextViewOptions({
		 disableBack: true
	  });
	  $state.go("app.advance");
   } else {
	  $scope.Page = 1;
	  console.log($scope.Data); 
	
	  if($scope.Data.status == "error") {
		   var alertPopup = $ionicPopup.alert({
			   title: 'Search Result!',
			   template: $scope.Data.message
		   });
		   alertPopup.then(function(res) {
			  console.log("alert closed");
		   });
	  }
   }
	
    var actionSuccess = function(data, status) {
			$ionicLoading.hide();
			 var isObj = data instanceof Object;
			 if(!isObj) { 
				 var alertPopup = $ionicPopup.alert({
					 title: 'Error!',
					 template: "Error occured while processing your request"
				 });
				 alertPopup.then(function(res) {
					 console.log("alert closed");
				 });
			}
			else if(data.status == 'error') {
				if($scope.Data.records.length > 0) {
					$scope.isDataExist = true;
				} else {
					 var alertPopup = $ionicPopup.alert({
						 title: 'Search Result!',
						 template: data.message
					 });
					 alertPopup.then(function(res) {
					    console.log("alert closed");
					 });
				}
			  
			} else {
				if(data.records.length > 0) {
				   $scope.Data.records = $scope.Data.records.concat(data.records);
			    } else {
				   $scope.isDataExist = false;
			    }
				$scope.$broadcast('scroll.infiniteScrollComplete');
			}
	};
	
	var actionError = function(data, status, headers, config) {
		   var alertPopup = $ionicPopup.alert({
			   title: 'Error!',
			   template: "Error occured while processing your request"
		   });
		   alertPopup.then(function(res) {
			  console.log("alert closed");
		   });
	}
	
	$scope.loadMore = function() {
	    console.log("load more called");
	    $scope.Page++;
	    $ionicLoading.show({
			  template: 'Loading...'
		});
		var url = domain + "advsearch.php";
		$scope.searchData.p = $scope.Page;
  	    animeHTTP.actionProcess(url, $scope.searchData)
		 .success(actionSuccess)
		 .error(actionError);
	};
	
})
.controller('asearchListController', function($scope, $timeout, $ionicHistory, $state, $stateParams, animeHTTP, localService, $ionicLoading, $ionicPopup) {
   $scope.Genre = localService.getGenre();
   $scope.contents = localService.getContents();
   $scope.showList = false;
   $scope.lanuages = [{ option: 'English Dubbed'}, { option: 'Japanese Subbed'}];
   $scope.quality = [{ option: 'High Definition'}, { option: 'High Quality'}, { option: 'Standard Quality'}];
   $scope.Page = 0;
   // options for selection
   $scope.langOptions = [];
   $scope.Data = [];
   $scope.qualityOptions = [];
   $scope.genreOptions = [];
   $scope.voidOptions = [];
   $scope.searchOptions = {
	   query: "",
	   type: "",
	   sort: "title",
	   status: ""
   };
   $scope.searchData = [];
   
   $scope.isLanguageChecked= function(option){
	  var _match = false;
		  for(var i=0 ; i < $scope.langOptions.length; i++) {
			if($scope.langOptions[i].option == option){
			  _match = true;
			}
		  }
		  return _match;
     };

	 $scope.syncLanguage  = function(bool, item){
		console.log(bool);
		if(bool){
		  // add item
		  $scope.langOptions.push(item);
		} else {
		  // remove item
		  for(var i=0 ; i < $scope.langOptions.length; i++) {
			if($scope.langOptions[i].option == item.option){
			  $scope.langOptions.splice(i,1);
			}
		  }      
		}
	  };
  
	  $scope.isQualityChecked= function(option){
		  var match = false;
		  for(var i=0 ; i < $scope.qualityOptions.length; i++) {
			if($scope.qualityOptions[i].option == option){
			  match = true;
			}
		  }
		  return match;
	  };

	  $scope.syncQuality  = function(bool, item){
		if(bool){
		  // add item
		  $scope.qualityOptions.push(item);
		} else {
		  // remove item
		  for(var i=0 ; i < $scope.qualityOptions.length; i++) {
			if($scope.qualityOptions[i].option == item.option){
			  $scope.qualityOptions.splice(i,1);
			}
		  }      
		}
	  };
  
	  $scope.isGenreChecked = function(option){
		  var match = false;
		  for(var i=0 ; i < $scope.genreOptions.length; i++) {
			if($scope.genreOptions[i].option == option){
			  match = true;
			}
		  }
		  return match;
	  };

	  $scope.syncGenre = function(bool, item){
		if(bool){
		  // add item
		  $scope.genreOptions.push(item);
		} else {
		  // remove item
		  for(var i=0 ; i < $scope.genreOptions.length; i++) {
			if($scope.genreOptions[i].option == item.option){
			  $scope.genreOptions.splice(i,1);
			}
		  }      
		}
	  };
  
	  $scope.isVoidChecked = function(option){
		  var match = false;
		  for(var i=0 ; i < $scope.voidOptions.length; i++) {
			if($scope.voidOptions[i].option == option){
			  match = true;
			}
		  }
		  return match;
	  };

	  $scope.syncVoid = function(bool, item){
		if(bool){
		  // add item
		  $scope.voidOptions.push(item);
		} else {
		  // remove item
		  for(var i=0 ; i < $scope.voidOptions.length; i++) {
			if($scope.voidOptions[i].option == item.option){
			  $scope.voidOptions.splice(i,1);
			}
		  }      
		}
	  };
	  
	  $scope.searchClk = function() {
		  /*if (keyEvent.which === 13) { */
			  console.log("search clicked " + $scope.searchQuery);
			  $ionicHistory.nextViewOptions({
				 disableBack: true
			  });
	          $state.go("app.search",  { "query": encodeURIComponent($scope.searchQuery)});
		 /* } */
	  }
 
	  var actionSuccess = function(data, status) {
			$ionicLoading.hide();
			 var isObj = data instanceof Object;
			 if(!isObj) { 
				 var alertPopup = $ionicPopup.alert({
					 title: 'Error!',
					 template: "Error occured while processing your request"
				 });
				 alertPopup.then(function(res) {
					 console.log("alert closed");
				 });
			}
			else if(data.status == 'error') {
			   var alertPopup = $ionicPopup.alert({
				   title: 'Search Result!',
				   template: data.message
			   });
			   alertPopup.then(function(res) {
				  console.log("alert closed");
			   });
			} else {
				/*$scope.showList = true;
				if(data.records.length > 0) {
				   $scope.Data = $scope.Data.concat(data.records);
			    } else {
				   $scope.isDataExist = false;
			    }
				$scope.$broadcast('scroll.infiniteScrollComplete');*/
				localService.setSearch($scope.searchData);
				localService.setSearchData(data);
				
				$ionicHistory.nextViewOptions({
					 disableBack: true
				});
				$state.go("app.advsearch");
			}
			
		};
         /* $scope.$on('$stateChangeSuccess', function() {
			$scope.loadMore();
		  }); */
			  
		var actionError = function(data, status, headers, config) {
			   var alertPopup = $ionicPopup.alert({
				   title: 'Error!',
				   template: "Error occured while processing your request"
			   });
			   alertPopup.then(function(res) {
				  console.log("alert closed");
			   });
			  $ionicLoading.hide();
			  console.log(data);
			  localService.setSearchData(data);
			  $ionicHistory.nextViewOptions({
				 disableBack: true
			  });
			  $state.go("app.advsearch");
		}
		
	    $scope.loadMore = function() {
			lMore($scope.searchOptions);
	    };
		
	    $scope.advSearch = function() {
		   lMore($scope.searchOptions);
	    }
		
		function lMore(data) {
			$scope.Page++;
			  if(typeof data == 'undefined') {
				  var alertPopup = $ionicPopup.alert({
					   title: 'Error!',
					   template: "Please select at least one input"
				   });
				   alertPopup.then(function(res) {
					  console.log("alert closed");
				   });
				  return;
			  }
			  // genre options
			  var genreoption = "";
			  var voidoption = "";
			  var langoption = "";
			  var qualityoption = "";
			  
			  for(var i=0 ; i < $scope.genreOptions.length; i++) {
				  if(genreoption != "") 
					 genreoption += ",";
				  genreoption += $scope.genreOptions[i].option;
			  }
			  for(var i=0 ; i < $scope.voidOptions.length; i++) {
				  if(voidoption != "") 
					 voidoption += ",";
				  voidoption += $scope.voidOptions[i].value;
			  }
			  for(var i=0 ; i < $scope.langOptions.length; i++) {
				  if(langoption != "") 
					 langoption += ",";
				  langoption += $scope.langOptions[i].option;
			  }
			  for(var i=0 ; i < $scope.qualityOptions.length; i++) {
				  if(qualityoption != "") 
					 qualityoption += ",";
				  qualityoption += $scope.qualityOptions[i].option;
			  }
			  
			  
			  
			  $ionicLoading.show({
				  template: 'Loading...'
			  });
			  var url = domain + "advsearch.php";
			  
			  $scope.searchData = {
				 genre: genreoption,
				 voidopt: voidoption,
				 lang: langoption,
				 quality: qualityoption,
				 status: data.status,
				 query: data.query,
				 type: data.type,
				 sort: data.sort,
				 p: $scope.Page
			  };
			  animeHTTP.actionProcess(url, $scope.searchData)
			 .success(actionSuccess)
			 .error(actionError);
		}
})
.controller('animeCategoryController', function($scope, $timeout, $ionicHistory, $state, $stateParams, animeHTTP, localService, $ionicLoading, $ionicPopup) {
   // initialize filter data from routeparams
   var sortOrder = "all";
   var char = "all";
   var genre = "all";
   $scope.pageName = "ANIME SERIES"
   var pagePath = "load_anime_series";
   switch($stateParams.name) {
	   case "series":
	     $scope.pageName = "ANIME SERIES"
         pagePath = "load_anime_series";
	   break;
	   case "fansub":
	     $scope.pageName = "ANIME FANSUBS"
         pagePath = "load_anime_fansubs";
	   break;
	   case "movies":
	     $scope.pageName = "ANIME MOVIES"
         pagePath = "load_anime_movies";
	   break;
	   case "ova":
	     $scope.pageName = "ANIME OVA's"
         pagePath = "load_anime_ova";
	   break;
	   case "trailers":
	     $scope.pageName = "ANIME TRAILERS"
         pagePath = "load_anime_trailers";
	   break;
	   case "rated":
	     $scope.pageName = "TOP RATED"
         pagePath = "toprated";
	   break;
	   case "live":
	     $scope.pageName = "Live Actions"
         pagePath = "load_live_actions";
	   break;
   }
   $scope.isDataExist = true;

   if(typeof $stateParams != 'undefined') {
	  if(typeof $stateParams.genre != 'undefined')
		 genre = $stateParams.genre;
	  if(typeof $stateParams.char != 'undefined')	 
		 char = $stateParams.char;
	  if(typeof $stateParams.sort != 'undefined')	
		 sortOrder = $stateParams.sort;
   }
   // store filter option in local server
   var opt = localService.getFilterOptions();
   opt.char = char;
   opt.sort = sortOrder;
   opt.genre = genre;
   opt.page = 'animeseries';
   localService.setFilterOptions(opt);
   
   $scope.Data = [];
   $scope.Page = 0;
   $scope.message = "";

	   var loadSuccess = function(data, status) {
		  $ionicLoading.hide();
		  var isObj = data instanceof Object;
		  if(!isObj) {
			  var alertPopup = $ionicPopup.alert({
				   title: 'Error!',
				   template: "Error occured while processing your request"
			   });
			   alertPopup.then(function(res) {
				  console.log("alert closed");
			   }); 
		  }
		  else if(data.status == 'error') {
			  if($scope.Data.length == 0) {
			       $scope.message = "No records found!";	 
			  }
			  $scope.isDataExist = false;
		  }
		  else {
			  if(data.records.length > 0) {
				 $scope.Data = $scope.Data.concat(data.records);
			  } else {
				 $scope.isDataExist = false;
			  }
		  }
		  $scope.$broadcast('scroll.infiniteScrollComplete');
	  };
	  
	  $scope.$on('$stateChangeSuccess', function() {
		$scope.loadMore();
	  });
  
	  var loadError = function(data, status, headers, config) {
		  $scope.message = "Error occured";
		  $ionicLoading.hide();
	  }
	
	  //loadData();
	  $scope.loadMore = function() {
		  $ionicLoading.show({
			 template: 'Loading...'
	 	  });
		  $scope.Page++;
		  var url = domain + pagePath + ".php?p=" + $scope.Page + "&genre=" + genre + "&char=" + char + "&sort=" + sortOrder;
		  animeHTTP.httpProcess(url)
			  .success(loadSuccess)
			  .error(loadError); 
	  };
})
.controller('seriesController', function($scope, $timeout, $ionicHistory, $state, $stateParams, animeHTTP, localService, $ionicLoading, $ionicPopup) {
     
   // initialize filter data from routeparams
   var id = 0;
   $scope.id = 0;
   if(typeof $stateParams != 'undefined') {
	  if(typeof $stateParams.id != 'undefined')
		 id = $stateParams.id;
   }
   $scope.id = id;
   console.log($scope.id);

   $scope.Data = [];
   $scope.Series = [];
   $scope.showLanguage = false;
   $scope.showTrailerOption = false;
   $scope.showMain = true;
   $scope.showQuality = false;
   $scope.selectedId = 0;
   $scope.selectedLanguage = 0;
   $scope.videoProcessing = false;
   $scope.message = "";
   $scope.isPaid = localService.isPaidMember();
   $scope.postRating = false;
   $scope.postSubscribe = false;
   $scope.isSubscribed = false;
   
   
   
   
   
   $scope.reportLink = function() {
		
   }
   var loadError = function(data, status, headers, config) {
	   var alertPopup = $ionicPopup.alert({
		   title: 'Error!',
		   template:  "Error occured while processing your request"
	   });
	   alertPopup.then(function(res) {
		  console.log("alert closed");
	   }); 
	  $ionicLoading.hide();
   }
   var rateSuccess = function(data, status) {
	  $ionicLoading.hide();
	  var isObj = data instanceof Object;
	  if(!isObj) {
			  var alertPopup = $ionicPopup.alert({
				   title: 'Validation!',
				   template: "Error occured while processing your request"
			   });
			   alertPopup.then(function(res) {
				  console.log("alert closed");
			   }); 
	  }
	  else if(data.status == 'error') {
		  var alertPopup = $ionicPopup.alert({
			   title: 'Error!',
			   template:  data.message
		   });
		   alertPopup.then(function(res) {
			  console.log("alert closed");
		   }); 
	  }
	  else {
		  var alertPopup = $ionicPopup.alert({
			   title: 'Success!',
			   template:  "Your rating has been submitted successfully"
		   });
		   alertPopup.then(function(res) {
			  console.log("alert closed");
		   }); 
	  }
   };
   var rateSuccess = function(data, status) {
	  $ionicLoading.hide();
	  var isObj = data instanceof Object;
	  if(!isObj) {
			  var alertPopup = $ionicPopup.alert({
				   title: 'Error!',
				   template: "Error occured while processing your request"
			   });
			   alertPopup.then(function(res) {
				  console.log("alert closed");
			   }); 
	  }
	  else if(data.status == 'error') {
		  var alertPopup = $ionicPopup.alert({
			   title: 'Error!',
			   template:  data.message
		   });
		   alertPopup.then(function(res) {
			  console.log("alert closed");
		   }); 
	  }
	  else {
		  $scope.isSubscribed = true;
		  var alertPopup = $ionicPopup.alert({
			   title: 'Success!',
			   template:  "Your successfully subscribed this series"
		   });
		   alertPopup.then(function(res) {
			  console.log("alert closed");
		   }); 
	  }
   };
   
    var unsubscribeSuccess = function(data, status) {
	  $ionicLoading.hide();
	  var isObj = data instanceof Object;
	  if(!isObj) {
			  var alertPopup = $ionicPopup.alert({
				   title: 'Error!',
				   template: "Error occured while processing your request"
			   });
			   alertPopup.then(function(res) {
				  console.log("alert closed");
			   }); 
	  }
	  else if(data.status == 'error') {
		  var alertPopup = $ionicPopup.alert({
			   title: 'Error!',
			   template:  data.message
		   });
		   alertPopup.then(function(res) {
			  console.log("alert closed");
		   }); 
	  }
	  else {
		  $scope.isSubscribed = false;
		  var alertPopup = $ionicPopup.alert({
			   title: 'Success!',
			   template:  "Your successfully unsubscribed this series"
		   });
		   alertPopup.then(function(res) {
			  console.log("alert closed");
		   }); 
	  }
   };
   
   
   var lsubscribeSuccess = function(data, status) {
	  var isObj = data instanceof Object;
	  if(!isObj) {
			  var alertPopup = $ionicPopup.alert({
				   title: 'Error!',
				   template: "Error occured while processing your request"
			   });
			   alertPopup.then(function(res) {
				  console.log("alert closed");
			   }); 
	  }
	  else if(data.status == 'already') {
		  $scope.isSubscribed = true;
	  }
   };

    $scope.unsubscribe = function(rate) {
	    if(localService.getLoggedIn()) {
		   var _id = $scope.Data[0].id;
		   var logged_in_info = localService.getLoggedInfo();
		   var _data = {
			   user_id: logged_in_info.userid,
			   page: $scope.Data[0].page,
			   type: $scope.Data[0].type
		   };
		   $ionicLoading.show({
			 template: 'Loading...'
	 	   });
		   var url = domain + "unsubscribe.php";
		   animeHTTP.actionProcess(url, _data)
				 .success(unsubscribeSuccess)
				 .error(loadError);
	   } else {
		   var alertPopup = $ionicPopup.alert({
			   title: 'Authorization Error!',
			   template:  "You need to login in order to use this feature"
		   });
		   alertPopup.then(function(res) {
			  console.log("alert closed");
		   }); 
	    } 
	};
	
   $scope.subscribe = function(rate) {
	  if($scope.postSubscribe) {
		   var alertPopup = $ionicPopup.alert({
			   title: 'Done!',
			   template:  "You already subscribed this series."
		   });
		   alertPopup.then(function(res) {
			  console.log("alert closed");
		   }); 
	  } else {
		  //$scope.postSubscribe = true;
		  if(localService.getLoggedIn()) {
		   var _id = $scope.Data[0].id;
		   var logged_in_info = localService.getLoggedInfo();
		   var _data = {
			   user_id: logged_in_info.userid,
			   page: $scope.Data[0].page,
			   type: $scope.Data[0].type
		   };
		   $ionicLoading.show({
			 template: 'Loading...'
	 	   });
		   var url = domain + "subscribe.php";
			animeHTTP.actionProcess(url, _data)
				 .success(rateSuccess)
				 .error(loadError);
	   } else {
		   var alertPopup = $ionicPopup.alert({
			   title: 'Authorization Error!',
			   template:  "You need to login in order to use this feature"
		   });
		   alertPopup.then(function(res) {
			  console.log("alert closed");
		   }); 
	   } 
	  }
	};
  
   
   $scope.pRate = function(rate) {
	  if($scope.postRating) {
		   var alertPopup = $ionicPopup.alert({
			   title: 'Done!',
			   template:  "You already post rating."
		   });
		   alertPopup.then(function(res) {
			  console.log("alert closed");
		   }); 
	  } else {
		  if(localService.getLoggedIn()) {
		   var _id = $scope.Data[0].id;
		   var logged_in_info = localService.getLoggedInfo();
		   console.log(logged_in_info);
		   var _data = {
			   user_id: logged_in_info.userid,
			   page_id: _id,
			   type: 0,
			   username: logged_in_info.username,
			   anime_name: $scope.Data[0].title,
			   page: $scope.Data[0].page,
			   rating: rate*2
		   };
		   $ionicLoading.show({
			 template: 'Loading...'
	 	   });
		   $scope.StartProcessing = true;
		   var url = domain + "postrating.php";
			animeHTTP.actionProcess(url, _data)
				 .success(rateSuccess)
				 .error(loadError);
	   } else {
		   var alertPopup = $ionicPopup.alert({
			   title: 'Authorization Error!',
			   template:  "You need to login in order to post rating"
		   });
		   alertPopup.then(function(res) {
			  console.log("alert closed");
		   }); 
	   } 
	  }
	};
   
   var loadSuccess = function(data, status) {
	  $ionicLoading.hide();
	  $scope.Data = data.records;
	  // check whether user already subscribed
	  if(localService.getLoggedIn()) {
		   var _id = $scope.Data[0].id;
		   var logged_in_info = localService.getLoggedInfo();
		   var _data = {
				   user_id: logged_in_info.userid,
				   page: $scope.Data[0].page,
				   type: $scope.Data[0].type
		   };
		   console.log("test..........");
		   console.log($scope.Data[0]);
		   var url = domain + "loadsubscribe.php";
		   animeHTTP.actionProcess(url, _data)
				.success(lsubscribeSuccess)
				.error(loadError);
	  }
						 
	  $scope.Series = data.series;
	  if($scope.Data[0].type == 6) {
		  // trailers
		  $scope.showTrailerOption = true;
		  $scope.showMain = false;
	   } else if($scope.Data[0].type == 3 || $scope.Data[0].type == 4) {
		   // movies
		   localService.setSeriesName($scope.Data[0].title);
		   $scope.showMain = false;
		   if($scope.Data[0].eng_lang == 1 && $scope.Data[0].jpn_lang == 1) {
				// show language
				$scope.showLanguage = true;
		   } else {
				// show quality options
				$scope.showQuality = true;
				if($scope.Data[0].eng_lang == 1)
				   $scope.selectedLanguage = 0; // english
				else
				   $scope.selectedLanguage = 1; // japani
		   }
	   }
   };
  
   
    $ionicLoading.show({
			 template: 'Loading...'
	 	  });
   var url = domain + "load_series.php?id=" + id;
   animeHTTP.httpProcess(url)
		  .success(loadSuccess)
		  .error(loadError); 
	  
	$scope.process = function(id, seriesname) {
		if($scope.Data[0].type == 6) {
			// trailer
			$scope.procQuality(0);
		}
		else {
			localService.setSeriesName(seriesname);
			$scope.selectedId = id;
			$scope.showMain = false;
			if($scope.Data[0].eng_lang == 1 && $scope.Data[0].jpn_lang == 1) {
				// show language
				$scope.showLanguage = true;
			} else {
				// show quality options
				$scope.showQuality = true;
				if($scope.Data[0].eng_lang == 1)
				   $scope.selectedLanguage = 0; // english
				else
				   $scope.selectedLanguage = 1; // japani
			}
		}
		
	};
	
	$scope.procLang = function(id) {
		
		$scope.showLanguage = false;
		$scope.showMain = false;
		$scope.showQuality = true;
		$scope.selectedLanguage = id;
	};
	$scope.procBack = function() {
		 $scope.selectedId = 0;
         $scope.selectedLanguage = 0;
		 $scope.showLoader = false;
		 $scope.showLanguage = false;
		 $scope.showMain = true;
		 $scope.showQuality = false;
	};
	
	
	var reportSuccess = function(data, status) {
	 
    };
	
	var reportSuccess02 = function(data, status) {
	   var alertPopup = $ionicPopup.alert({
			   title: 'Report Status!',
			   template:   "Broken link report sent successfully"
		});
		alertPopup.then(function(res) {
		}); 
    };
	var reportSuccess01 = function(data, status) {
	   var alertPopup = $ionicPopup.alert({
			   title: 'Report Status!',
			   template:   "Broken link report sent successfully"
		});
		alertPopup.then(function(res) {
		  $ionicHistory.nextViewOptions({
			 disableBack: true
		  });
		  $state.go("app.core");
		  return;
		}); 
    };
	
   
	var counter = 0;
	$scope.alt_url = ""; // handle lQ
	$scope.alt_url02 = ""; // handle Lq
	$scope.alt_url03 = ""; // handle lq
	$scope.alt_url04 = ""; // handles english
	$scope.alt_url05 = ""; 
	$scope.alt_url06 = ""; 
	$scope.alt_url07 = ""; 
	$scope.alt_url08 = ""; 
	
	$scope.rData = {};
	var aloadSuccess = function(data, status) {
		   // generate auto report
		  var linkInfo = data;
		  if(data.status=='success') {
			  $ionicLoading.hide();
			  // data retrieved successfully
			  localService.setVideoData(data);
			  localService.setInfoData($scope.Data[0]);
			  localService.setSeriesData($scope.Series);
			  $ionicHistory.nextViewOptions({
				 disableBack: true
			  });
			  if($scope.Data[0].type == 6)
			     $state.go("app.watch",  { "id": "trailer_" + $scope.Data[0].id});
			  else if($scope.Data[0].type == 3 || $scope.Data[0].type == 4)
			     $state.go("app.watch",  { "id": "movie_" + $scope.Data[0].id});
			  else
			     $state.go("app.watch",  { "id": "movie_" + $scope.selectedId});
		  } else {
			  if(counter == 0 && $scope.alt_url != "") {
				  counter++;
				  var url = domain + "proc_video.php?u=" + encodeURIComponent($scope.alt_url);
				  animeHTTP.httpProcess(url)
					  .success(aloadSuccess)
					  .error(loadError); 
			  }
			  else if(counter == 1 && $scope.alt_url04 != "") {
			      counter++;
				  var url = domain + "proc_video.php?u=" + encodeURIComponent($scope.alt_url04);
				  animeHTTP.httpProcess(url)
					  .success(aloadSuccess)
					  .error(loadError); 
			  }
			  else if(counter == 2 && $scope.alt_url02 != "") {
			      counter++;
				  var url = domain + "proc_video.php?u=" + encodeURIComponent($scope.alt_url02);
				  animeHTTP.httpProcess(url)
					  .success(aloadSuccess)
					  .error(loadError); 
			  } 
			  else if(counter == 3 && $scope.alt_url03 != "") {
			      counter++;
				  var url = domain + "proc_video.php?u=" + encodeURIComponent($scope.alt_url03);
				  animeHTTP.httpProcess(url)
					  .success(aloadSuccess)
					  .error(loadError); 
			  }
			  else if(counter == 4 && $scope.alt_url05 != "") {
			      counter++;
				  var url = domain + "proc_video.php?u=" + encodeURIComponent($scope.alt_url05);
				  animeHTTP.httpProcess(url)
					  .success(aloadSuccess)
					  .error(loadError); 
			  } 
			  else if(counter == 5 && $scope.alt_url06 != "") {
			      counter++;
				  var url = domain + "proc_video.php?u=" + encodeURIComponent($scope.alt_url06);
				  animeHTTP.httpProcess(url)
					  .success(aloadSuccess)
					  .error(loadError); 
			  }
			  else if(counter == 6 && $scope.alt_url07 != "") {
			      counter++;
				  var url = domain + "proc_video.php?u=" + encodeURIComponent($scope.alt_url07);
				  animeHTTP.httpProcess(url)
					  .success(aloadSuccess)
					  .error(loadError); 
			  }
			  else if(counter == 7 && $scope.alt_url08 != "") {
			      counter++;
				  var url = domain + "proc_video.php?u=" + encodeURIComponent($scope.alt_url08);
				  animeHTTP.httpProcess(url)
					  .success(aloadSuccess)
					  .error(loadError); 
			  }
			  else {
				  counter = 0;
				  $ionicLoading.hide();
				  // gather information
				  var _selectedLang = "English";
				  var _selectedQuality = "Standard";
				  if($scope.selectedLanguage == 1)
				      _selectedQuality = "GOOD DEFINITION";
				  else if($scope.selectedLanguage == 2)
				      _selectedQuality = "HIGH DEFINITION"; 

				  // generate auto report
				  var _userStatus = "Normal";
				  if( localService.isPaidMember())
				    _userStatus = "Live";
					
				  var _id = $scope.Data.id;
				  var _data = {};
				  if(localService.getLoggedIn()) {
					  // user logged in
					  var logged_in_info = localService.getLoggedInfo();
					  _data = {
						   page_id: _id,
						   user_id: logged_in_info.userid,
						   username: logged_in_info.username,
						   email: logged_in_info.info.email,
						   title: $scope.Data[0].title,
						   status: _userStatus,
						   anime_name: localService.getSeriesName(),
						   language: _selectedLang,
						   quality: _selectedQuality,
						   testurl01:  $scope.alt_url,
						   testurl02: $scope.alt_url02,
						   testurl03: $scope.alt_url03,
						   testurl04: $scope.alt_url04,
						   testurl05: $scope.alt_url05,
						   testurl06: $scope.alt_url06,
						   testurl07: $scope.alt_url07,
						   testurl08: $scope.alt_url08
					   };
				  } else {
					  // user not logged in
					  _data = {
						   page_id: _id,
						   title: $scope.Data[0].title,
						   anime_name: localService.getSeriesName(),
						   language: _selectedLang,
						   status: _userStatus,
						   quality: _selectedQuality,
						   testurl01:  $scope.alt_url,
						   testurl02: $scope.alt_url02,
						   testurl03: $scope.alt_url03,
						   testurl04: $scope.alt_url04,
						   testurl05: $scope.alt_url05,
						   testurl06: $scope.alt_url06,
						   testurl07: $scope.alt_url07,
						   testurl08: $scope.alt_url08
					   };
				  }

		           var url = domain + "submitreport.php";
				   animeHTTP.actionProcess(url, _data)
						 .success(reportSuccess)
						 .error(loadError);
				  
				 
				  if(localService.getLoggedIn()) {
					    var _subTitle = "Video not available for mobile yet or is having problems. An email has been sent to our AC Team, we will respond back to '"+ logged_in_info.info.email +"'. If you would like us to respond to another email, please include it below & hit submit.";
				 
					   $scope.rData = {
						   email: logged_in_info.info.email,
						   report: ""
					   };
		                var logged_in_info = localService.getLoggedInfo();
						var alertPopup = $ionicPopup.alert({
							   title: 'Submit Broken Link!',
							   subTitle: _subTitle, 
							   template: '<input type="width:100%;" placeholder="Enter email here" ng-model="rData.email"><hr /><textarea placeholder="Include details or comments here" style="width:100%; height:100px;" ng-model="rData.report">',
							   scope: $scope,
							   buttons: [
								  { text: 'Cancel' },
								  {
									text: '<b>Submit</b>',
									type: 'button-positive',
									onTap: function(e) {
									  if (!$scope.rData.report) {
										e.preventDefault();
									  } else {
										return $scope.rData;
									  }
									}
								  }
								]
						   });
						   alertPopup.then(function(res) {
								
							    if(typeof res != "undefined") {
									var _email = logged_in_info.info.email;
								if(res.email != "") {
									_email = res.email;
								}
								console.log(_email);
 							    var _data = {
									   user_id: logged_in_info.userid,
									   username: logged_in_info.username,
									   email: _email,
									   report: res.report,
									   status: _userStatus,
									   page_id: $scope.Data[0].id,
									   title: $scope.Data[0].title,
									   anime_name: localService.getSeriesName(),
									   language: _selectedLang,
									   quality: _selectedQuality,
									   testurl01:  $scope.alt_url,
									   testurl02: $scope.alt_url02,
									   testurl03: $scope.alt_url03,
									   testurl04: $scope.alt_url04,
									   testurl05: $scope.alt_url05,
									   testurl06: $scope.alt_url06,
									   testurl07: $scope.alt_url07,
									   testurl08: $scope.alt_url08
								  };
								  console.log(_data);
								  var url = domain + "submitreport.php";
								  animeHTTP.actionProcess(url, _data)
									 .success(reportSuccess01)
									 .error(loadError);
								 }
						   }); 
				   }
				    else {
						console.log("entered in non logged in area");
						// if not logged in
					    $scope.rData = {
						   email: "Enter email here",
						   report: ""
					   };
						var alertPopup = $ionicPopup.alert({
							   title: 'Submit Broken Link!',
							   subTitle:   "<p>Video not available for mobile yet or is having problems. If you would like us to respond to you by email, please include it below with any additional information you may have & hit submit.</p>",
							   template: '<input type="width:100%;" placeholder="Enter email here" ng-model="rData.email"><hr /><textarea placeholder="Include details or comments here" style="width:100%; height:100px;" ng-model="rData.report">',
							   scope: $scope,
							   buttons: [
								  { text: 'Cancel' },
								  {
									text: '<b>Submit</b>',
									type: 'button-positive',
									onTap: function(e) {
									  if (!$scope.rData.report) {
										e.preventDefault();
									  } else {
										return $scope.rData;
									  }
									}
								  }
								]
						   });
						
					    alertPopup.then(function(res) {
							
							 if(typeof res != "undefined") {
								var _email = "";
								   if(res.email != "") {
									   _email = res.email;
							       }
							       if(_email == "Enter your email address") {
								     _email = "";
							       }
								   
							  var _data = {
								   page_id: $scope.Data[0].id,
								   title: $scope.Data[0].title,
								   report: res.report,
								   email: _email,
								   anime_name: localService.getSeriesName(),
								   language: _selectedLang,
								   quality: _selectedQuality,
								   status: _userStatus,
								   testurl01: $scope.alt_url,
								   testurl02: $scope.alt_url02,
								   testurl03: $scope.alt_url03,
								   testurl04: $scope.alt_url04,
								   testurl05: $scope.alt_url05,
								   testurl06: $scope.alt_url06,
								   testurl07: $scope.alt_url07,
								   testurl08: $scope.alt_url08
							  };
							  var url = domain + "submitreport.php";
							  animeHTTP.actionProcess(url, _data)
								 .success(reportSuccess01)
								 .error(loadError);
							  return;
							 }

					    }); 
						
				   }
			  }
			  $scope.videoProcessing = false;
		  }
		  //console.log(data);
	};
	
		
	$scope.procQuality = function(id) {
		$ionicLoading.show({
		   template: 'Loading...'
	 	});
		if(typeof player != "undefined")
		{
			console.log("player available");
			player.dispose();
		}
		$scope.videoProcessing = true;
	    var selected_quality = id;
		
		var url = ""; // LQ
		var alt_url = ""; // lQ
		var alt_url02 = ""; // Lq
		var alt_url03 = ""; // lq
		var alt_url04 = ""; // english_LQ
		var alt_url05 = ""; // english
		var alt_url06 = ""; // japanese
		var alt_url07 = "" // japanese_LQ
		var alt_url08 = ""; // no additional query
		var alt_url09 = ""; // remove underscore
		if($scope.Data[0].type == 6) {
			// trailer
			url = "http://animecrave.com/index.php?page=" + $scope.Data[0].page;
			console.log("series url " + url);
		} 
		else {
			// load normal url section
			if($scope.Data[0].type == 3  || $scope.Data[0].type == 4) {
				// movies
				url = "http://animecrave.com/index.php?page=" + $scope.Data[0].page + "/";
			}
			else {
				for (var i=0; i<= $scope.Series.length - 1; i++)
				{
					if($scope.Series[i].id == $scope.selectedId) { 
					   url = $scope.Series[i].series_url;
					}
				}
			}
			
			if($scope.Data[0].eng_lang == 1 && $scope.Data[0].jpn_lang == 1) {
				var separator = "_";
				if($scope.Data[0].type == 3)
				  separator = "";
				if($scope.selectedLanguage == 0) {
					console.log(url);
					if (!url.endsWith("/")) 
					   url = url + separator + "english";
					else
					   url = url + "english";
				} else {
					console.log(url);
					if (!url.endsWith("/")) 
					   url = url + separator + "japanese";
					else
					   url = url + "japanese";
				}
				alt_url = url;
				alt_url02 = url; // Lq
				alt_url03 = url; // lq
				alt_url04 = url; // english_lq
			    alt_url05 = url + "english"; // english
				alt_url06 = url + "japanese";
				alt_url07 = url;
				alt_url08 = url;
				switch(selected_quality)
				{
					case 0: // lq
						url = url + "_LQ";
						alt_url = alt_url + "_lQ"; 
						alt_url02 = alt_url02 + "_Lq"; 
						alt_url03 = alt_url03 + "_lq";
						alt_url04 = alt_url04 + "english_LQ"; 
						alt_url07 = alt_url07 + "japanese_LQ"; 
						break;
					case 1: // hd
						url = url + "_HQ";
						alt_url = alt_url + "_hQ"; 
						alt_url02 = alt_url02 + "_Hq"; 
						alt_url03 = alt_url03 + "_hq"; 
						alt_url04 = alt_url04 + "english_HQ"; 
						alt_url07 = alt_url07 + "japanese_HQ"; 
						break;
					case 2: // hd
						url = url + "_HD";
						alt_url = alt_url + "_hD"; 
						alt_url02 = alt_url02 + "_Hd"; 
						alt_url03 = alt_url03 + "_hd"; 
						alt_url04 = alt_url04 + "english_HD"; 
						alt_url07 = alt_url07 + "japanese_HD"; 
						break;
				}
			} else {
				alt_url = url;
				alt_url02 = url; // Lq
				alt_url03 = url; // lq
				alt_url04 = url; // english
			    alt_url05 = url + "english"; // english
				alt_url06 = url + "japanese";
				alt_url07 = url;
				alt_url08 = url;
				switch(selected_quality)
				{
					case 0: // lq
						url = url + "_LQ";
						alt_url = alt_url + "_lQ"; 
						alt_url02 = alt_url02 + "_Lq"; 
						alt_url03 = alt_url03 + "_lq"; 
						alt_url04 = alt_url04 + "english_LQ"; 
						alt_url07 = alt_url07 + "japanese_LQ";
						break;
					case 1: // hd
						url = url + "_HQ";
						alt_url = alt_url + "_hQ"; 
						alt_url02 = alt_url02 + "_Hq"; 
						alt_url03 = alt_url03 + "_hq";
						alt_url04 = alt_url04 + "english_HQ"; 
						alt_url07 = alt_url07 + "japanese_HQ";
						break;
					case 2: // hd
						url = url + "_HD";
						alt_url = alt_url + "_hD"; 
						alt_url02 = alt_url02 + "_Hd"; 
						alt_url03 = alt_url03 + "_hd"; 
						alt_url04 = alt_url04 + "english_HD";
						alt_url07 = alt_url07 + "japanese_HD"; 
						break;
				}
			}
			$scope.alt_url = alt_url; // handle lQ
			$scope.alt_url02 = alt_url02; 
			$scope.alt_url03 = alt_url03; 
			$scope.alt_url04 = alt_url04;
			$scope.alt_url05 = alt_url05; 
			$scope.alt_url06 = alt_url06; 
			$scope.alt_url07 = alt_url07;
			$scope.alt_url08 = alt_url08;
			
			console.log(url);
			console.log($scope.alt_url);
			console.log($scope.alt_url02);
			console.log($scope.alt_url03);
			console.log($scope.alt_url04);
			console.log($scope.alt_url05);
			console.log($scope.alt_url06);
			console.log($scope.alt_url07);
			console.log($scope.alt_url08);
			// close normal url section
		}
		
		 String.prototype.endsWith = function(str) 
         {return (this.match(str+"$")==str)}
		 
		var vurl = domain + "proc_video.php?u=" + encodeURIComponent(url);
		console.log(vurl);
		//console.log(url);
        animeHTTP.httpProcess(vurl)
			  .success(aloadSuccess)
			  .error(loadError); 
		};
})
.controller('watchController', function($scope, $timeout, $ionicHistory, $state, $sce, $stateParams, animeHTTP, localService, $ionicLoading, $ionicPopup) {
   $ionicLoading.show({
			template: 'Loading...'
	 	});
   $scope.Data = localService.getInfoData();
   $scope.SeriesData = localService.getSeriesData();
   $scope.VideoInfo = localService.getVideoData();
   $scope.postRating = false;
   $scope.postBookmark = false;
   $scope.isPaid = false;
   if($scope.Data.length == 0) {
	  $ionicHistory.nextViewOptions({
		 disableBack: true
	  });
	  $state.go("app.core");
	  return;
   }
   $scope.title = $scope.Data.title;
   
   var _bandwidth = 0;
   var _vtoken = "";
   $scope.message = "";
   if ($scope.VideoInfo.bandwidthinfo.length > 1) {
	   if(typeof $scope.VideoInfo.bandwidthinfo[1].bandwidth != "undefined")
		  _bandwidth = $scope.VideoInfo.bandwidthinfo[1].bandwidth;
	   else
		  _bandwidth = $scope.VideoInfo.bandwidthinfo[0].bandwidth;
	   
	   $scope.bandwidth = _bandwidth;
	
	   if(typeof $scope.VideoInfo.tokeninfo[1].token != "undefined")
		  _vtoken = $scope.VideoInfo.tokeninfo[1].token;
	   else
		  _vtoken = $scope.VideoInfo.tokeninfo[0].token;
		  
		  
	   $scope.bandwidth = $scope.VideoInfo.bandwidthinfo[1].bandwidth;
	   $scope.page = $scope.VideoInfo.urlinfo[1].url;
	   if(localService.isPaidMember())
	   {
		  $scope.Bandwidth = $scope.Bandwidth * 2;
		  $scope.isPaid = true;
	   }
		var introUrl = "http://animecrave.net/engineip.ashx?md=0&page=multimedia/ac&max=" + $scope.bandwidth + "&tk=" +  $scope.VideoInfo.tokeninfo[0].token + "";
		var videoUrl = $scope.VideoInfo.domaininfo[1].domain + ".ashx?md=0&page=" + $scope.page + "&max=" + $scope.bandwidth + "&tk=" +  _vtoken + "";
		$scope.videoUrl = $sce.trustAsResourceUrl(videoUrl);
		$scope.introUrl = $sce.trustAsResourceUrl(introUrl);
		$scope.ads = $scope.VideoInfo.ads;
		$scope.posterUrl = "";
   } else {
	   var alertPopup = $ionicPopup.alert({
			 title: 'Error!',
			 template: "Problem in processing video info"
	   });
	   alertPopup.then(function(res) {
		  $ionicHistory.nextViewOptions({
			 disableBack: true
		  });
		  $state.go("app.core");
		  return;
	   });
   }
   
    var rateSuccess = function(data, status) {
	  $ionicLoading.hide();
	  var isObj = data instanceof Object;
	  if(!isObj) {
			  var alertPopup = $ionicPopup.alert({
				   title: 'Error!',
				   template: "Error occured while processing your request"
			   });
			   alertPopup.then(function(res) {
				  console.log("alert closed");
			   }); 
	  }
	  else if(data.status == 'error') {
		  var alertPopup = $ionicPopup.alert({
			   title: 'Error!',
			   template:  data.message
		   });
		   alertPopup.then(function(res) {
			  console.log("alert closed");
		   }); 
	  }
	  else {
		  var alertPopup = $ionicPopup.alert({
			   title: 'Success!',
			   template:  "Your rating has been submitted successfully"
		   });
		   alertPopup.then(function(res) {
			  console.log("alert closed");
		   }); 
	  }
   };
   
   var favoriteSuccess = function(data, status) {
	  $ionicLoading.hide();
	  var isObj = data instanceof Object;
	  if(!isObj) {
			  var alertPopup = $ionicPopup.alert({
				   title: 'Error!',
				   template: "Error occured while processing your request"
			   });
			   alertPopup.then(function(res) {
				  console.log("alert closed");
			   }); 
	  }
	  else if(data.status == 'error') {
		  var alertPopup = $ionicPopup.alert({
			   title: 'Validation!',
			   template:  data.message
		   });
		   alertPopup.then(function(res) {
			  console.log("alert closed");
		   }); 
	  }
	  else {
		  var alertPopup = $ionicPopup.alert({
			   title: 'Success!',
			   template:  "Item added in your favorite list successfully"
		   });
		   alertPopup.then(function(res) {
			  console.log("alert closed");
		   }); 
	  }
   };
   
  
   
   $scope.bookmark = function() {
	   if($scope.postBookmark) {
		   var alertPopup = $ionicPopup.alert({
			   title: 'Done!',
			   template:  "You already mark this item as favorite."
		   });
		   alertPopup.then(function(res) {
			  console.log("alert closed");
		   }); 
	   } else {
		   $scope.postBookmark = true;
		   var _id = $scope.Data.id;
		   var logged_in_info = localService.getLoggedInfo();
		   var _data = {
			   member_id: logged_in_info.userid,
			   id: _id,
               item: $scope.Data.page,
			   title: localService.getSeriesName()
		   };
		   $ionicLoading.show({
			 template: 'Loading...'
	 	   });
		   var url = domain + "addtofavorite.php";
			animeHTTP.actionProcess(url, _data)
				 .success(favoriteSuccess)
				 .error(loadError);
	   }
   }
   
   $scope.pRate = function(rate) {
	  if($scope.postRating) {
		   var alertPopup = $ionicPopup.alert({
			   title: 'Done!',
			   template:  "You already post rating."
		   });
		   alertPopup.then(function(res) {
			  console.log("alert closed");
		   }); 
	  } else {
		  if(localService.getLoggedIn()) {
		   var _id = $scope.Data.id;
		   var logged_in_info = localService.getLoggedInfo();
		   console.log(logged_in_info);
		   var _data = {
			   user_id: logged_in_info.userid,
			   page_id: _id,
			   type: 0,
			   username: logged_in_info.username,
			   anime_name: localService.getSeriesName(),
			   page: $scope.Data.page,
			   rating: rate*2
		   };
		   console.log(_data);
		   $ionicLoading.show({
			 template: 'Loading...'
	 	   });
		   $scope.StartProcessing = true;
		   var url = domain + "postrating.php";
			animeHTTP.actionProcess(url, _data)
				 .success(rateSuccess)
				 .error(loadError);
	   } else {
		   var alertPopup = $ionicPopup.alert({
			   title: 'Authorization Error!',
			   template:  "You need to login in order to post rating"
		   });
		   alertPopup.then(function(res) {
			  console.log("alert closed");
		   }); 
	   } 
	  }
	};
	
   var reportSuccess = function(data, status) {
	  // background processing
   };
   
   var reportSuccess02 = function(data, status) {
	   var alertPopup = $ionicPopup.alert({
			   title: 'Report Status!',
			   template:   "Broken link report sent successfully"
		});
		alertPopup.then(function(res) {
		}); 
    };
	
   
   var reportSuccess01 = function(data, status) {
	   var alertPopup = $ionicPopup.alert({
			   title: 'Report Status!',
			   template:   "Broken link report sent successfully"
		});
		alertPopup.then(function(res) {
		  $ionicHistory.nextViewOptions({
			 disableBack: true
		  });
		  $state.go("app.core");
		  return;
		}); 
    };
 
    $ionicLoading.hide();
	$scope.showLanguage = false;
    $scope.showMain = true;
    $scope.showQuality = false;
    $scope.selectedId = 0;
    $scope.selectedLanguage = 0;
    $scope.videoProcessing = false;
  
    $scope.isPaid = localService.isPaidMember();
    $scope.series_name = localService.getSeriesName();
    if($scope.Data.type == 6 || $scope.Data.type == 3  || $scope.Data.type == 4) {
		// trailer or movie
		$scope.showMain = false;
	}
	$scope.process = function(id, seriesname) {
		localService.setSeriesName(seriesname);
		$scope.Data.series_name = seriesname;
		$scope.selectedId = id;
		$scope.showMain = false;
		if($scope.Data.eng_lang == 1 && $scope.Data.jpn_lang == 1) {
			// show language
			$scope.showLanguage = true;
		} else {
			// show quality options
			$scope.showQuality = true;
			if($scope.Data.eng_lang == 1)
			   $scope.selectedLanguage = 0; // english
			else
			   $scope.selectedLanguage = 1; // japani
		}
	};
	
	$scope.procLang = function(id) {
		$scope.showLanguage = false;
		$scope.showMain = false;
		$scope.showQuality = true;
		$scope.selectedLanguage = id;
	};
	
	$scope.procBack = function() {
		 $scope.selectedId = 0;
         $scope.selectedLanguage = 0;
		 $scope.showLoader = false;
		 $scope.showLanguage = false;
		 $scope.showMain = true;
		 $scope.showQuality = false;
	};
		
    var counter = 0;
	$scope.alt_url = ""; // handle lQ
	$scope.alt_url02 = ""; // handle Lq
	$scope.alt_url03 = ""; // handle lq
	$scope.alt_url04 = ""; // handles english
	$scope.alt_url05 = ""; 
	$scope.alt_url06 = ""; 
	$scope.alt_url07 = ""; 
	$scope.alt_url08 = ""; 
	
	var logged_in_info = localService.getLoggedInfo();
	 
	var loadError = function(data, status, headers, config) {
	  $scope.message = "Error occured";
	  $scope.showLoader = false;
    }
	
	var aloadSuccess = function(data, status) {
		  var linkInfo = data;
		  if(data.status=='success') {
			  localService.setVideoData(data);
			  localService.setInfoData($scope.Data);
			  localService.setSeriesData($scope.SeriesData);
			  $scope.showMain = true;
              $scope.showQuality = false;
			  $ionicHistory.nextViewOptions({
				 disableBack: true
			  });
			  $state.go("app.watch",  { "id": $scope.selectedId});
		  } else {
			  if(counter == 0 && $scope.alt_url != "") {
				  counter++;
				  var url = domain + "proc_video.php?u=" + encodeURIComponent($scope.alt_url);
				  animeHTTP.httpProcess(url)
					  .success(aloadSuccess)
					  .error(loadError); 
			  }
			  else if(counter == 1 && $scope.alt_url04 != "") {
			      counter++;
				  var url = domain + "proc_video.php?u=" + encodeURIComponent($scope.alt_url04);
				  animeHTTP.httpProcess(url)
					  .success(aloadSuccess)
					  .error(loadError); 
			  }
			  else if(counter == 2 && $scope.alt_url02 != "") {
			      counter++;
				  var url = domain + "proc_video.php?u=" + encodeURIComponent($scope.alt_url02);
				  animeHTTP.httpProcess(url)
					  .success(aloadSuccess)
					  .error(loadError); 
			  } else if(counter == 3 && $scope.alt_url03 != "") {
			      counter++;
				  var url = domain + "proc_video.php?u=" + encodeURIComponent($scope.alt_url03);
				  animeHTTP.httpProcess(url)
					  .success(aloadSuccess)
					  .error(loadError); 
			  } else if(counter == 4 && $scope.alt_url05 != "") {
			      counter++;
				  var url = domain + "proc_video.php?u=" + encodeURIComponent($scope.alt_url05);
				  animeHTTP.httpProcess(url)
					  .success(aloadSuccess)
					  .error(loadError); 
			  } 
			  else if(counter == 5 && $scope.alt_url06 != "") {
			      counter++;
				  var url = domain + "proc_video.php?u=" + encodeURIComponent($scope.alt_url06);
				  animeHTTP.httpProcess(url)
					  .success(aloadSuccess)
					  .error(loadError); 
			  }
			  else if(counter == 6 && $scope.alt_url07 != "") {
			      counter++;
				  var url = domain + "proc_video.php?u=" + encodeURIComponent($scope.alt_url07);
				  animeHTTP.httpProcess(url)
					  .success(aloadSuccess)
					  .error(loadError); 
			  }
			  else if(counter == 7 && $scope.alt_url08 != "") {
			      counter++;
				  var url = domain + "proc_video.php?u=" + encodeURIComponent($scope.alt_url08);
				  animeHTTP.httpProcess(url)
					  .success(aloadSuccess)
					  .error(loadError); 
			  }
			  else {
				  counter = 0;
				  // generate auto report
				  var _selectedLang = "English";
				  var _selectedQuality = "Standard";
				  if($scope.selectedLanguage == 1)
				      _selectedQuality = "GOOD DEFINITION";
				  else if($scope.selectedLanguage == 2)
				      _selectedQuality = "HIGH DEFINITION"; 
					  
                 
				  // generate auto report
				  var _id = $scope.Data.id;
				  var _data = {};
				  if(localService.getLoggedIn()) {
					  var _userStatus = "Normal";
					  if( localService.isPaidMember())
						_userStatus = "Live";
					  console.log("you are logged in");
					  // user logged in
					  var logged_in_info = localService.getLoggedInfo();
					  _data = {
						   page_id: _id,
						   user_id: logged_in_info.userid,
						   username: logged_in_info.username,
						   email: logged_in_info.info.email,
						   title: $scope.Data.title,
						   status: _userStatus,
						   anime_name: localService.getSeriesName(),
						   language: _selectedLang,
						   quality: _selectedQuality,
						   testurl01:  $scope.alt_url,
						   testurl02: $scope.alt_url02,
						   testurl03: $scope.alt_url03,
						   testurl04: $scope.alt_url04,
						   testurl05: $scope.alt_url05,
						   testurl06: $scope.alt_url06,
						   testurl07: $scope.alt_url07,
						   testurl08: $scope.alt_url08,
						   isauto: true
					   };
				  } else {
					  // user not logged in
					  console.log("you are not logged in");
					  _data = {
						   page_id: _id,
						   title: $scope.Data.title,
						   anime_name: localService.getSeriesName(),
						   language: _selectedLang,
						   quality: _selectedQuality,
						   status: "",
						   testurl01:  $scope.alt_url,
						   testurl02: $scope.alt_url02,
						   testurl03: $scope.alt_url03,
						   testurl04: $scope.alt_url04,
						   testurl05: $scope.alt_url05,
						   testurl06: $scope.alt_url06,
						   testurl07: $scope.alt_url07,
						   testurl08: $scope.alt_url08,
						   isauto: true
					   };
				  }

		           var url = domain + "submitreport.php";
				   animeHTTP.actionProcess(url, _data)
						 .success(reportSuccess)
						 .error(loadError);
				  
				 
				  
				  if(localService.getLoggedIn()) {
					  
					   $scope.rData = {
						   email: logged_in_info.info.email,
						   report: ""
					   };
		                var logged_in_info = localService.getLoggedInfo();
						var _subTitle = "Video not available for mobile yet or is having problems. An email has been sent to our AC Team, we will respond back to '"+ logged_in_info.info.email +"'. If you would like us to respond to another email, please include it below & hit submit.";
						var alertPopup = $ionicPopup.alert({
							   title: 'Submit Broken Link!',
							   subTitle: _subTitle, 
							   template: '<input type="width:100%;" ng-model="rData.email"><hr /><textarea placeholder="Include details or comments here" style="width:100%; height:100px;" ng-model="rData.report">',
							   scope: $scope,
							   buttons: [
								  { text: 'Cancel' },
								  {
									text: '<b>Submit</b>',
									type: 'button-positive',
									onTap: function(e) {
									  if (!$scope.rData.report) {
										e.preventDefault();
									  } else {
										return $scope.rData;
									  }
									}
								  }
								]
						   });
						   alertPopup.then(function(res) {
								
							    if(typeof res != "undefined") {
									var _email = logged_in_info.info.email;
								if(res.email != "") {
									_email = res.email;
								}
								console.log(_email);
 							    var _data = {
									   user_id: logged_in_info.userid,
									   username: logged_in_info.username,
									   email: _email,
									   report: res.report,
									   status: _userStatus,
									   page_id: $scope.Data.id,
									   title: $scope.Data.title,
									   anime_name: localService.getSeriesName(),
									   language: _selectedLang,
									   quality: _selectedQuality,
									   testurl01:  $scope.alt_url,
									   testurl02: $scope.alt_url02,
									   testurl03: $scope.alt_url03,
									   testurl04: $scope.alt_url04,
									   testurl05: $scope.alt_url05,
									   testurl06: $scope.alt_url06,
									   testurl07: $scope.alt_url07,
									   testurl08: $scope.alt_url08
								  };
								  console.log(_data);
								  var url = domain + "submitreport.php";
								  animeHTTP.actionProcess(url, _data)
									 .success(reportSuccess01)
									 .error(loadError);
								 }
						   }); 
				   }
				    else {
						// if not logged in
					    $scope.rData = {
						   email: "Enter email here",
						   report: ""
					   };
						var alertPopup = $ionicPopup.alert({
							   title: 'Submit Broken Link!',
							   subTitle:   "<p>Video not available for mobile yet or is having problems. If you would like us to respond to you by email, please include it below with any additional information you may have & hit submit.</p>",
							   template: '<input type="width:100%;" placeholder="Enter email here" ng-model="rData.email"><hr /><textarea placeholder="Include details or comments here" style="width:100%; height:100px;" ng-model="rData.report">',
							   scope: $scope,
							   buttons: [
								  { text: 'Cancel' },
								  {
									text: '<b>Submit</b>',
									type: 'button-positive',
									onTap: function(e) {
									  if (!$scope.rData.report) {
										e.preventDefault();
									  } else {
										return $scope.rData;
									  }
									}
								  }
								]
						   });
						
					    alertPopup.then(function(res) {
							 
							 if(typeof res != "undefined") {
								 var _email = "";
								if(res.email != "") {
									_email = res.email;
							 }
							 if(_email == "Enter your email address") {
								 _email = "";
							 }
							  var _data = {
								   page_id: $scope.Data.id,
								   title: $scope.Data.title,
								   report: res.report,
								   email: _email,
								   anime_name: localService.getSeriesName(),
								   language: _selectedLang,
								   quality: _selectedQuality,
								   status: "",
								   testurl01:  $scope.alt_url,
								   testurl02: $scope.alt_url02,
								   testurl03: $scope.alt_url03,
								   testurl04: $scope.alt_url04,
								   testurl05: $scope.alt_url05,
								   testurl06: $scope.alt_url06,
								   testurl07: $scope.alt_url07,
								   testurl08: $scope.alt_url08
							  };
							  var url = domain + "submitreport.php";
							  animeHTTP.actionProcess(url, _data)
								 .success(reportSuccess01)
								 .error(loadError);
							  return;
							 }

					    }); 
						
				   }
				   
			  }
			  $scope.videoProcessing = false;
		  }
		  //console.log(data);
	};
	
	$scope.reportlink = function() {
        
				  var logged_in_info = localService.getLoggedInfo();

				  if(localService.getLoggedIn()) {
					  var _userStatus = "Normal";
					  if( localService.isPaidMember())
						_userStatus = "Live";
					   var _subTitle = "Provide details of the problem in the Text field below. We will respond back to '"+ logged_in_info.info.email +"'. If you would like us to respond to another email, please include it below & hit submit.";
					   $scope.rData = {
						   email: logged_in_info.info.email,
						   report: ""
					   };
		               
						var alertPopup = $ionicPopup.alert({
							   title: 'Submit Broken Link!',
							   subTitle: _subTitle, 
							   template: '<input type="width:100%;" ng-model="rData.email"><hr /><textarea placeholder="Include details or comments here" style="width:100%; height:100px;" ng-model="rData.report">',
							   scope: $scope,
							   buttons: [
								  { text: 'Cancel' },
								  {
									text: '<b>Submit</b>',
									type: 'button-positive',
									onTap: function(e) {
									  if (!$scope.rData.report) {
										e.preventDefault();
									  } else {
										return $scope.rData;
									  }
									}
								  }
								]
						   });
						   alertPopup.then(function(res) {
							    if(typeof res != "undefined") {
								var _email = logged_in_info.info.email;
								if(res.email != "") {
									_email = res.email;
								}
								console.log(_email);
 							    var _data = {
									   user_id: logged_in_info.userid,
									   username: logged_in_info.username,
									   email: _email,
									   report: res.report,
									   status: _userStatus,
									   page_id: $scope.Data.id,
									   title: $scope.Data.title,
									   anime_name: localService.getSeriesName(),
									   language: "",
									   quality: "",
									   testurl01:  videoUrl
								  };
								  console.log(_data);
								  var url = domain + "submitreport.php";
								  animeHTTP.actionProcess(url, _data)
									 .success(reportSuccess02)
									 .error(loadError);
								 }
						   }); 
				   }
				    else {
						// if not logged in
						console.log("entered in non logged in area");
					    $scope.rData = {
						   email: "",
						   report: ""
					   };
						var alertPopup = $ionicPopup.alert({
							   title: 'Submit Broken Link!',
							   subTitle:   "<p>Provide details of the problem in the Text field below.</p>",
							   template: '<input type="width:100%;" placeholder="Enter email here" ng-model="rData.email"><hr /><textarea placeholder="Include details or comments here" style="width:100%; height:100px;" ng-model="rData.report">',
							   scope: $scope,
							   buttons: [
								  { text: 'Cancel' },
								  {
									text: '<b>Submit</b>',
									type: 'button-positive',
									onTap: function(e) {
									  if (!$scope.rData.report) {
										e.preventDefault();
									  } else {
										return $scope.rData;
									  }
									}
								  }
								]
						   });
						
					    alertPopup.then(function(res) {
							
							 if(typeof res != "undefined") {
							   var _email = "";
									if(res.email != "") {
										_email = res.email;
								 }
								 if(_email == "Enter your email address") {
									 _email = "";
								 }
							  var _mdata = {
								   page_id: $scope.Data.id,
								   title: $scope.Data.title,
								   report: res.report,
								   email: _email,
								   anime_name: localService.getSeriesName(),
								   language: "",
								   quality: "",
								   status: "",
								   testurl01:  videoUrl
							  };
							  console.log("reached here");
							  console.log(_mdata);
							  var url = domain + "submitreport.php";
							  animeHTTP.actionProcess(url, _mdata)
								 .success(reportSuccess02)
								 .error(loadError);
							  return;
							 }

					    }); 
						
				   }
				  
    }

	$scope.procQuality = function(id) {
		if(typeof player != "undefined")
		{
			console.log("player available");
			player.dispose();
		}
		$scope.videoProcessing = true;
		var selected_quality = id;
		var url = "";
		var alt_url = ""; // lQ
		var alt_url02 = ""; // Lq
		var alt_url03 = ""; // lq
		var alt_url04 = ""; // english_LQ
		var alt_url05 = ""; // english
		var alt_url06 = ""; // japanese
		var alt_url07 = "" // japanese_LQ
		var alt_url08 = ""
		for (var i=0; i<= $scope.SeriesData.length - 1; i++)
		{
			if($scope.SeriesData[i].id == $scope.selectedId) { 
			   url = $scope.SeriesData[i].series_url;
			}
		}
		if($scope.Data.eng_lang == 1 && $scope.Data.jpn_lang == 1) {
			var separator = "_";
			if($scope.selectedLanguage == 0) {
				console.log(url);
				if (!url.endsWith("/")) 
				   url = url + separator + "english";
				else
				   url = url + "english";
			} else {
				console.log(url);
				if (!url.endsWith("/")) 
				   url = url + separator + "japanese";
				else
				   url = url + "japanese";
			}
			alt_url = url;
			alt_url02 = url; // Lq
		    alt_url03 = url; // lq
			alt_url04 = url; // lq
			alt_url05 = url + "english"; // english
			alt_url06 = url + "japanese";
			alt_url07 = url;
			alt_url08 = url;
			switch(selected_quality)
			{
				case 0: // lq
					url = url + "_LQ";
					alt_url = alt_url + "_lQ"; 
					alt_url02 = alt_url02 + "_Lq"; 
					alt_url03 = alt_url02 + "_lq"; 
					alt_url04 = alt_url04 + "english_LQ"; 
					alt_url07 = alt_url07 + "japanese_LQ"; 
					break;
				case 1: // hd
					url = url + "_HQ";
					alt_url = alt_url + "_hQ"; 
					alt_url02 = alt_url02 + "_Hq"; 
					alt_url03 = alt_url02 + "_hq"; 
					alt_url04 = alt_url04 + "english_HQ"; 
					alt_url07 = alt_url07 + "japanese_HQ"; 
					break;
				case 2: // hd
					url = url + "_HD";
					alt_url = alt_url + "_hD"; 
					alt_url02 = alt_url02 + "_Hd"; 
					alt_url03 = alt_url02 + "_hd"; 
					alt_url04 = alt_url04 + "english_HD"; 
					alt_url07 = alt_url07 + "japanese_HD"; 
					break;
			}
		} else {
			alt_url = url;
			alt_url02 = url; // Lq
		    alt_url03 = url; // lq
			alt_url04 = url; // lq
			alt_url05 = url + "english"; // english
			alt_url06 = url + "japanese";
			alt_url07 = url;
			alt_url08 = url;
			switch(selected_quality)
			{
				case 0: // lq
					url = url + "_LQ";
					alt_url = alt_url + "_lQ"; 
					alt_url02 = alt_url02 + "_Lq"; 
					alt_url03 = alt_url02 + "_lq"; 
					alt_url04 = alt_url04 + "english_LQ"; 
					alt_url07 = alt_url07 + "japanese_LQ"; 
					break;
				case 1: // hd
					url = url + "_HQ";
					alt_url = alt_url + "_hQ"; 
					alt_url02 = alt_url02 + "_Hq"; 
					alt_url03 = alt_url02 + "_hq";
					alt_url04 = alt_url04 + "english_HQ"; 
					alt_url07 = alt_url07 + "japanese_HQ"; 
					break;
				case 2: // hd
					url = url + "_HD";
					alt_url = alt_url + "_hD"; 
					alt_url02 = alt_url02 + "_Hd"; 
					alt_url03 = alt_url02 + "_hd"; 
					alt_url04 = alt_url04 + "english_HD"; 
					alt_url07 = alt_url07 + "japanese_HD"; 
					break;
			}
		}
		$scope.alt_url = alt_url; // handle lQ
	    $scope.alt_url02 = alt_url02; // handle Lq
	    $scope.alt_url03 = alt_url03; // handle lq
		$scope.alt_url04 = alt_url04; // handle english
		$scope.alt_url05 = alt_url05; 
		$scope.alt_url06 = alt_url06; 
		$scope.alt_url07 = alt_url07;
		$scope.alt_url08 = alt_url08;  
		
		var url = domain + "proc_video.php?u=" + encodeURIComponent(url);
		console.log(url);
        animeHTTP.httpProcess(url)
			  .success(aloadSuccess)
			  .error(loadError);
		};
		
	   String.prototype.endsWith = function(str) 
         {return (this.match(str+"$")==str)}
		
		
})
/*.controller('ActionSheetCtrl', function($scope, $location, $mdBottomSheet, localService, $cookies, $cookieStore) {
  $scope.items = [];
  if(localService.getLoggedIn()) {
	  $scope.items = [
		//{ name: 'My Anime', icon: 'fa-share', redirect: '/myanime' },
		//{ name: 'My Points', icon: 'fa-upload', redirect: '/mypoints'},
		//{ name: 'My Profile', icon: 'fa-copy', redirect: '/myprofile' },
		{ name: 'Signout', icon: 'fa-sign-out', redirect: '/' }
	  ];
  } else {
	  $scope.items = [
		{ name: 'Login', icon: 'fa-share', redirect: '/login' },
		{ name: 'Register', icon: 'fa-upload', redirect: '/register'}
	  ];
  }

  $scope.listItemClick = function($index) {
	var clickedItem = $scope.items[$index];
	 $mdBottomSheet.hide(clickedItem);
	 if(clickedItem.name == "Signout") {
		 $cookieStore.remove("auth")
		 $location.path("/");
	 } else {
		  $location.path(clickedItem.redirect);
	 }
  };
})

.controller('filterController', function($scope, $timeout, $mdSidenav, localService) {
	 $scope.filterOptions = localService.getFilterOptions();
	 $scope.jumpOptions = localService.getCharacters();
	 $scope.Genre = localService.getGenre();
	 $scope.sortOption = "all";

	 $scope.close = function() {
		$mdSidenav('filter').close();
	 };

}).controller('browseController', function($scope, $timeout, $mdSidenav, localService) {
	 $scope.close = function() {
		$mdSidenav('browse').close();
	 };
})


.controller('animeFansubsController', function($scope, $timeout, $mdSidenav, $mdBottomSheet, $location, $routeParams, animeHTTP, localService) {
   // initialize filter data from routeparams
   var sortOrder = "all";
   var char = "all";
   var genre = "all";
   if(typeof $routeParams != 'undefined') {
	  if(typeof $routeParams.genre != 'undefined')
		 genre = $routeParams.genre;
	  if(typeof $routeParams.char != 'undefined')	 
		 char = $routeParams.char;
	  if(typeof $routeParams.sort != 'undefined')	
		 sortOrder = $routeParams.sort;
   }
   // store filter option in local server
   var opt = localService.getFilterOptions();
   opt.char = char;
   opt.sort = sortOrder;
   opt.genre = genre;
   opt.page = 'animeseries';
     
   localService.setFilterOptions(opt);
   // load templates
   $scope.top_toolbar = localService.getTopToolbar();
   $scope.search_nav = localService.getSearchNav();
   $scope.browse_nav = localService.getBrowseNav();
   $scope.filter_options = localService.getFilterNav();
   
   $scope.Data = [];
   $scope.Page = 0;
   $scope.message = "";
   $scope.showLoader = false;
	   var loadSuccess = function(data, status) {
		  $scope.showLoader = false;
		  var isObj = data instanceof Object;
		  if(!isObj) { 
			 $scope.message = "Error occured while processing your request";
		  }
		  else if(data.status == 'error') {
			 $scope.message = data.message;
		  }
		  else {
			  $scope.Data = $scope.Data.concat(data.records);
		  }
	  };
	  var loadError = function(data, status, headers, config) {
		  $scope.message = "Error occured";
		  $scope.showLoader = false;
	  }
	
	  //loadData();
	  $scope.loadMore = function() {
		  loadData();	
	  };

	  function loadData() {
		  $scope.showLoader = true;
		  $scope.Page++;
		  var url = domain + "load_anime_fansubs.php?p=" + $scope.Page + "&genre=" + genre + "&char=" + char + "&sort=" + sortOrder;
		  animeHTTP.httpProcess(url)
			  .success(loadSuccess)
			  .error(loadError); 
	 }
	 	  
	 $scope.filterList = function() {
          $mdSidenav('filter').toggle();
     };
})
.controller('animemoviesController', function($scope, $timeout, $mdSidenav, $mdBottomSheet, $location, $routeParams, animeHTTP, localService) {
  // initialize filter data from routeparams
   var sortOrder = "all";
   var char = "all";
   var genre = "all";
   if(typeof $routeParams != 'undefined') {
	  if(typeof $routeParams.genre != 'undefined')
		 genre = $routeParams.genre;
	  if(typeof $routeParams.char != 'undefined')	 
		 char = $routeParams.char;
	  if(typeof $routeParams.sort != 'undefined')	
		 sortOrder = $routeParams.sort;
   }
   // store filter option in local server
   var opt = localService.getFilterOptions();
   opt.char = char;
   opt.sort = sortOrder;
   opt.genre = genre;
   opt.page = 'animeseries';
   localService.setFilterOptions(opt);
   // load templates
   $scope.top_toolbar = localService.getTopToolbar();
   $scope.search_nav = localService.getSearchNav();
   $scope.browse_nav = localService.getBrowseNav();
   $scope.filter_options = localService.getFilterNav();
   
   $scope.Data = [];
   $scope.Page = 0;
   $scope.message = "";
   $scope.showLoader = false;
	   var loadSuccess = function(data, status) {
		  $scope.showLoader = false;
		  var isObj = data instanceof Object;
		  if(!isObj) { 
			 $scope.message = "Error occured while processing your request";
		  }
		  else if(data.status == 'error') {
			 $scope.message = data.message;
		  }
		  else {
			  $scope.Data = $scope.Data.concat(data.records);
		  }
	  };
	  var loadError = function(data, status, headers, config) {
		  $scope.message = "Error occured";
		  $scope.showLoader = false;
	  }

	  $scope.loadMore = function() {
		  loadData();	
	  };
	  	  
	  function loadData() {
		  $scope.showLoader = true;
		  $scope.Page++;
		  var url = domain + "load_anime_movies.php?p=" + $scope.Page + "&genre=" + genre + "&char=" + char + "&sort=" + sortOrder;
		  animeHTTP.httpProcess(url)
			  .success(loadSuccess)
			  .error(loadError); 
	 }
	 	  
	 $scope.filterList = function() {
          $mdSidenav('filter').toggle();
     };
})
.controller('animeovaController', function($scope, $timeout, $mdSidenav, $mdBottomSheet, $location, $routeParams, animeHTTP, localService) {
   // initialize filter data from routeparams
   var sortOrder = "all";
   var char = "all";
   var genre = "all";
   if(typeof $routeParams != 'undefined') {
	  if(typeof $routeParams.genre != 'undefined')
		 genre = $routeParams.genre;
	  if(typeof $routeParams.char != 'undefined')	 
		 char = $routeParams.char;
	  if(typeof $routeParams.sort != 'undefined')	
		 sortOrder = $routeParams.sort;
   }
   // store filter option in local server
   var opt = localService.getFilterOptions();
   opt.char = char;
   opt.sort = sortOrder;
   opt.genre = genre;
   opt.page = 'animeseries';
   localService.setFilterOptions(opt);
   // load templates
   $scope.top_toolbar = localService.getTopToolbar();
   $scope.search_nav = localService.getSearchNav();
   $scope.browse_nav = localService.getBrowseNav();
   $scope.filter_options = localService.getFilterNav();
   
   $scope.Data = [];
   $scope.Page = 0;
   $scope.message = "";
   $scope.showLoader = false;
	   var loadSuccess = function(data, status) {
		  $scope.showLoader = false;
		  var isObj = data instanceof Object;
		  if(!isObj) { 
			 $scope.message = "Error occured while processing your request";
		  }
		  else if(data.status == 'error') {
			 $scope.message = data.message;
		  }
		  else {
			  $scope.Data = $scope.Data.concat(data.records);
		  }
	  };
	  var loadError = function(data, status, headers, config) {
		  $scope.message = "Error occured";
		  $scope.showLoader = false;
	  }

	  $scope.loadMore = function() {
		  loadData();	
	  };
	  
	 	  
	  function loadData() {
		  $scope.showLoader = true;
		  $scope.Page++;
		  var url = domain + "load_anime_ova.php?p=" + $scope.Page + "&genre=" + genre + "&char=" + char + "&sort=" + sortOrder;
		  animeHTTP.httpProcess(url)
			  .success(loadSuccess)
			  .error(loadError); 
	 }
	 	  
	 $scope.filterList = function() {
          $mdSidenav('filter').toggle();
     };
})
.controller('liveactionsController', function($scope, $timeout, $mdSidenav, $mdBottomSheet, $location, $routeParams, animeHTTP, localService) {
   // initialize filter data from routeparams
   var sortOrder = "all";
   var char = "all";
   var genre = "all";
   if(typeof $routeParams != 'undefined') {
	  if(typeof $routeParams.genre != 'undefined')
		 genre = $routeParams.genre;
	  if(typeof $routeParams.char != 'undefined')	 
		 char = $routeParams.char;
	  if(typeof $routeParams.sort != 'undefined')	
		 sortOrder = $routeParams.sort;
   }
   // store filter option in local server
   var opt = localService.getFilterOptions();
   opt.char = char;
   opt.sort = sortOrder;
   opt.genre = genre;
   opt.page = 'animeseries';
   localService.setFilterOptions(opt);
   // load templates
   $scope.top_toolbar = localService.getTopToolbar();
   $scope.search_nav = localService.getSearchNav();
   $scope.browse_nav = localService.getBrowseNav();
   $scope.filter_options = localService.getFilterNav();
   
   $scope.Data = [];
   $scope.Page = 0;
   $scope.showLoader = false;
   $scope.message = "";
	   var loadSuccess = function(data, status) {
		  $scope.showLoader = false;
		  var isObj = data instanceof Object;
		  if(!isObj) { 
			 $scope.message = "Error occured while processing your request";
		  }
		  else if(data.status == 'error') {
			 $scope.message = data.message;
		  }
		  else {
			  $scope.Data = $scope.Data.concat(data.records);
		  }
	  };
	  var loadError = function(data, status, headers, config) {
		  $scope.message = "Error occured";
		  $scope.showLoader = false;
	  }

	  $scope.loadMore = function() {
		  loadData();	
	  };

	  function loadData() {
		  $scope.showLoader = true;
		  $scope.Page++;
		  var url = domain + "load_live_actions.php?p=" + $scope.Page + "&genre=" + genre + "&char=" + char + "&sort=" + sortOrder;
		  animeHTTP.httpProcess(url)
			  .success(loadSuccess)
			  .error(loadError); 
	 }
	 	  
	 $scope.filterList = function() {
          $mdSidenav('filter').toggle();
     };
})
.controller('animetrailersController', function($scope, $timeout, $mdSidenav, $mdBottomSheet, $location, $routeParams, animeHTTP, localService) {
   // initialize filter data from routeparams
   var sortOrder = "all";
   var char = "all";
   var genre = "all";
   
   if(typeof $routeParams != 'undefined') {
	  if(typeof $routeParams.genre != 'undefined')
		 genre = $routeParams.genre;
	  if(typeof $routeParams.char != 'undefined')	 
		 char = $routeParams.char;
	  if(typeof $routeParams.sort != 'undefined')	
		 sortOrder = $routeParams.sort;
   }
   // store filter option in local server
   var opt = localService.getFilterOptions();
   opt.char = char;
   opt.sort = sortOrder;
   opt.genre = genre;
   opt.page = 'animeseries';
   localService.setFilterOptions(opt);
   // load templates
   $scope.top_toolbar = localService.getTopToolbar();
   $scope.search_nav = localService.getSearchNav();
   $scope.browse_nav = localService.getBrowseNav();
   $scope.filter_options = localService.getFilterNav();
   
   $scope.Data = [];
   $scope.Page = 0;
   $scope.message = "";
   $scope.showLoader = false;
	  var loadSuccess = function(data, status) {
		  $scope.showLoader = false;
		  var isObj = data instanceof Object;
		  if(!isObj) { 
			 $scope.message = "Error occured while processing your request";
		  }
		  else if(data.status == 'error') {
			 $scope.message = data.message;
		  }
		  else {
			  $scope.Data = $scope.Data.concat(data.records);
		  }
	  };
	  var loadError = function(data, status, headers, config) {
		  $scope.message = "Error occured";
		  $scope.showLoader = false;
	  }
	
	  //loadData();
	  $scope.loadMore = function() {
		  loadData();	
	  };
	 	  
	  function loadData() {
		  $scope.showLoader = true;
		  $scope.Page++;
		  var url = domain + "load_anime_trailers.php?p=" + $scope.Page + "&genre=" + genre + "&char=" + char + "&sort=" + sortOrder;
		  animeHTTP.httpProcess(url)
			  .success(loadSuccess)
			  .error(loadError); 
	 }
})
.controller('topratedController', function($scope, $timeout, $mdSidenav, $mdBottomSheet, $location, $routeParams, animeHTTP, localService) {
   // load templates
   $scope.top_toolbar = localService.getTopToolbar();
   $scope.search_nav = localService.getSearchNav();
   $scope.browse_nav = localService.getBrowseNav();
   
   $scope.Data = [];
   $scope.Page = 0;
   $scope.message = "";
   $scope.showLoader = false;
	  var loadSuccess = function(data, status) {
		  $scope.showLoader = false;
		  var isObj = data instanceof Object;
		  if(!isObj) { 
			 $scope.message = "Error occured while processing your request";
		  }
		  else if(data.status == 'error') {
			 $scope.message = data.message;
		  }
		  else {
			  $scope.Data = $scope.Data.concat(data.records);
		  }
	  };
	  var loadError = function(data, status, headers, config) {
		  $scope.message = "Error occured";
		  $scope.showLoader = false;
	  }
	
	  //loadData();
	  $scope.loadMore = function() {
		  loadData();	
	  };
	 	  
	  function loadData() {
		  $scope.showLoader = true;
		  $scope.Page++;
		  var url = domain + "toprated.php?p=" + $scope.Page;
		  animeHTTP.httpProcess(url)
			  .success(loadSuccess)
			  .error(loadError); 
	 }
})
*/
.controller('CoreCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
});