var domain = "http://animecrave.com/restapi/";
var dirPath = "/anime";
var player;
angular.module('animeApp', ['ionic', 'animeApp.controllers', 'animeApp.services', 'animeApp.directives', 'ngCookies'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  $stateProvider

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    controller: 'AppCtrl'
  })
  .state('app.core', {
      url: "/core",
      views: {
        'menuContent': {
          templateUrl: "templates/core.html",
          controller: 'animeCtrl'
        }
      }
  })
  .state('app.anime', {
	  url: "/anime/:name",
      views: {
        'menuContent': {
          templateUrl: "templates/category/series.html",
          controller: 'animeCategoryController'
        }
      }
  })
  
  
  .state('app.series', {
      url: "/series/:id",
	  cache: false,
      views: {
        'menuContent': {
          templateUrl: "templates/series.html",
          controller: 'seriesController'
        }
      }
  })
  .state('app.watch', {
      url: "/watch/:id",
	  cache: false,
      views: {
        'menuContent': {
          templateUrl: "templates/watch.html",
          controller: 'watchController'
        }
      }
  })
  .state('app.search', {
    url: "/search/:query/:guide",
	cache: false,
    views: {
      'menuContent': {
        templateUrl: "templates/search.html",
		controller: 'searchListController'
      }
    }
  })
  .state('app.advance', {
    url: "/advance",
	cache: false,
    views: {
      'menuContent': {
        templateUrl: "templates/advance.html",
		controller: 'asearchListController'
      }
    }
  })
  .state('app.advsearch', {
    url: "/advsearch",
	cache: false,
    views: {
      'menuContent': {
        templateUrl: "templates/asearch.html",
		controller: 'advsearchListController'
      }
    }
  })
  .state('app.forgotpass', {
    url: "/forgotpass",
    views: {
      'menuContent': {
        templateUrl: "templates/forgot.html",
		controller: 'ForgotCtrl'
      }
    }
  })
  .state('app.login', {
    url: "/login",
    views: {
      'menuContent': {
        templateUrl: "templates/plogin.html",
		controller: 'LoginCtrl'
      }
    }
  })
  .state('app.register', {
    url: "/register",
    views: {
      'menuContent': {
        templateUrl: "templates/register.html",
		controller: 'RegisterCtrl'
      }
    }
  })
  .state('app.myaccount', {
    url: "/myaccount",
	cache: false,
    views: {
      'menuContent': {
        templateUrl: "templates/myaccount.html",
		controller: 'myaccountController'
      }
    }
  })
  .state('app.signout', {
    url: "/signout",
    views: {
      'menuContent': {
        templateUrl: "templates/signout.html",
		controller: 'signoutController'
      }
    }
  })
  .state('app.myprofile', {
    url: "/myprofile",
	cache: false,
    views: {
      'menuContent': {
        templateUrl: "templates/myprofile.html",
		controller: 'myprofileController'
      }
    }
  })
  .state('app.mypoints', {
    url: "/mypoints",
	cache: false,
    views: {
      'menuContent': {
        templateUrl: "templates/mypoints.html",
		controller: 'mypointsController'
      }
    }
  })
  .state('app.mywatchlist', {
    url: "/watchedlist",
	cache: false,
    views: {
      'menuContent': {
        templateUrl: "templates/watchedlist.html",
		controller: 'watchedlistController'
      }
    }
  })
  .state('app.myanime', {
    url: "/myanime",
	cache: false,
    views: {
      'menuContent': {
        templateUrl: "templates/myanime.html",
		controller: 'myanimeController'
      }
    }
  })
  .state('app.mysubscription', {
    url: "/mysubscription",
	cache: false,
    views: {
      'menuContent': {
        templateUrl: "templates/mysubscription.html",
		controller: 'mysubscriptionController'
      }
    }
  })
  .state('app.myanimecurrently', {
    url: "/myanimecurrently",
	cache: false,
    views: {
      'menuContent': {
        templateUrl: "templates/myanimecurrently.html",
		controller: 'myanimecurrentlyController'
      }
    }
  })
  .state('app.addmyanimecurrently', {
    url: "/addmyanimecurrently",
	cache: false,
    views: {
      'menuContent': {
        templateUrl: "templates/addmyanimecurrently.html",
		controller: 'addmyanimecurrentlyController'
      }
    }
  })
  .state('app.myanimelibrary', {
    url: "/myanimelibrary",
	cache: false,
    views: {
      'menuContent': {
        templateUrl: "templates/myanimelibrary.html",
		controller: 'myanimelibraryController'
      }
    }
  })
  .state('app.addmyanimelibrary', {
    url: "/addmyanimelibrary",
	cache: false,
    views: {
      'menuContent': {
        templateUrl: "templates/addmyanimelibrary.html",
		controller: 'addmyanimelibraryController'
      }
    }
  })
  .state('app.myanimewant', {
    url: "/myanimewant",
	cache: false,
    views: {
      'menuContent': {
        templateUrl: "templates/myanimewant.html",
		controller: 'myanimewantController'
      }
    }
  })
  .state('app.addmyanimewant', {
    url: "/addmyanimewant",
	cache: false,
    views: {
      'menuContent': {
        templateUrl: "templates/addmyanimewant.html",
		controller: 'addmyanimewantController'
      }
    }
  })
  .state('app.myanimenotseen', {
    url: "/myanimenotseen",
	cache: false,
    views: {
      'menuContent': {
        templateUrl: "templates/myanimenotseen.html",
		controller: 'myanimenotseenController'
      }
    }
  })
  .state('app.upgradeaccount', {
    url: "/upgradeaccount",
	cache: false,
    views: {
      'menuContent': {
        templateUrl: "templates/upgradeaccount.html",
		controller: 'upgradeaccountController'
      }
    }
  })
  .state('app.browse', {
    url: "/browse",
    views: {
      'menuContent': {
        templateUrl: "templates/browse.html"
      }
    }
  })
  .state('app.single', {
    url: "/playlists/:playlistId",
    views: {
      'menuContent': {
        templateUrl: "templates/core.html",
        controller: 'CoreCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/core');
  //$ionicConfigProvider.views.maxCache(0);
});


/*animeApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: dirPath + "/assets/ng/template/core.html",
        controller: 'animeCtrl'
      }).
      when('/login', {
        templateUrl: dirPath + "/assets/ng/template/login.html",
        controller: 'LoginCtrl'
      }).
	  when('/register', {
        templateUrl: dirPath + "/assets/ng/template/register.html",
        controller: 'RegisterCtrl'
      }).
	  when('/forgotpass', {
        templateUrl: dirPath + "/assets/ng/template/forgot.html",
        controller: 'ForgotCtrl'
      }).
	  when('/myaccount', {
        templateUrl: dirPath + "/assets/ng/template/myaccount.html",
        controller: 'myaccountController'
      }).
	  when('/animeseries', {
        templateUrl: dirPath + "/assets/ng/template/category/animeseries.html",
        controller: 'animeSeriesController'
      }).
	  when('/animeseries/:genre/:char/:sort', {
        templateUrl: dirPath + "/assets/ng/template/category/animeseries.html",
        controller: 'animeSeriesController'
      }).
	  when('/animefansubs', {
        templateUrl: dirPath + "/assets/ng/template/category/animefansubs.html",
        controller: 'animeFansubsController'
      }).
	  when('/animefansubs/:genre/:char/:sort', {
        templateUrl: dirPath + "/assets/ng/template/category/animefansubs.html",
        controller: 'animeSeriesController'
      }).
	  when('/animemovies', {
        templateUrl: dirPath + "/assets/ng/template/category/animemovies.html",
        controller: 'animemoviesController'
      }).
	  when('/animemovies/:genre/:char/:sort', {
        templateUrl: dirPath + "/assets/ng/template/category/animemovies.html",
        controller: 'animeSeriesController'
      }).
	  when('/animeova', {
        templateUrl: dirPath + "/assets/ng/template/category/animeova.html",
        controller: 'animeovaController'
      }).
	  when('/animeova/:genre/:char/:sort', {
        templateUrl: dirPath + "/assets/ng/template/category/animeova.html",
        controller: 'animeSeriesController'
      }).
	  when('/liveactions', {
        templateUrl: dirPath + "/assets/ng/template/category/liveactions.html",
        controller: 'liveactionsController'
      }).
	  when('/liveactions/:genre/:char/:sort', {
        templateUrl: dirPath + "/assets/ng/template/category/liveactions.html",
        controller: 'animeSeriesController'
      }).
	  when('/animetrailers', {
        templateUrl: dirPath + "/assets/ng/template/category/animetrailers.html",
        controller: 'animetrailersController'
      }).
	  when('/animetrailers/:genre/:char/:sort', {
        templateUrl: dirPath + "/assets/ng/template/category/animetrailers.html",
        controller: 'animeSeriesController'
      }).
	  when('/series/:id', {
        templateUrl: dirPath + "/assets/ng/template/series/main.html",
        controller: 'seriesController'
      }).
	  when('/watch/:id', {
        templateUrl: dirPath + "/assets/ng/template/watch.html",
        controller: 'watchController'
      }).
	  when('/search/:query', {
        templateUrl: dirPath + "/assets/ng/template/category/searchList.html",
        controller: 'searchListController'
      }).
	  when('/advsearch', {
        templateUrl: dirPath + "/assets/ng/template/category/advsearch.html",
        controller: 'asearchListController'
      }).
	  when('/toprated', {
        templateUrl: dirPath + "/assets/ng/template/category/toprated.html",
        controller: 'topratedController'
      }).
      otherwise({
        redirectTo: '/'
      });
}]); */