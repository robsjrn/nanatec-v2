
var propertymanager;

propertymanager= angular.module('propertymanagerApp', ['ngRoute','angularUtils.directives.dirPagination','ngDialog','templates','xeditable'] ); 



    propertymanager.factory('authInterceptor',['$window','$location',function ( $window,$location) {
      return {
      request: function (config) {
        
        config.headers = config.headers || {};
        if ($window.sessionStorage.token) {
        config.headers.token=  $window.sessionStorage.token;
        }
         else{
           // no token in Store
                    $location.path('/unathorised');
        }
        return config;
      },
      response: function (response) {
        if (response.status === 401) {
        // handle the case where the user is not authenticated
        $location.path('/unathorised');
        }
        
        return response || $q.when(response);
      }
      };
    }]);


propertymanager.config(['$routeProvider', '$locationProvider','$httpProvider', function($routeProvider, $locationProvider,$httpProvider){
  
$httpProvider.interceptors.push('authInterceptor');

  $routeProvider
      .when('/', {
         templateUrl : 'property_manager/views/dashboard.html',
          controller  : 'dashboardCtrl'
        })  
      .when('/properties', {
         templateUrl : 'property_manager/views/properties.html',
          controller  : 'PropertyCtrl'
        })
      .when('/edit-property/:property', {
         templateUrl : 'Editproperty.html',
          controller  : 'EditPropertyCtrl'
        })
       .when('/units', {
         templateUrl : 'property_manager/views/units.html',
          controller  : 'unitCtrl'
        })
       .when('/singletrxn', {
         templateUrl : 'property_manager/views/singletrxn.html',
          controller  : 'singletrxnCtrl'
        })
       .when('/batchtrxn', {
         templateUrl : 'property_manager/views/batchtrxn.html',
          controller  : 'batchtrxnCtrl'
        })
        .when('/unathorised', {
         templateUrl : '401.html'
        })
        .when('/not-found', {
         templateUrl : '404.html'
        })
       
 
    .otherwise({ redirectTo : '/not-found' });

  //$locationProvider.html5Mode(true);
    

}]);


propertymanager.run(['$rootScope', '$location', '$window','$route','editableOptions', function($rootScope, $location,$window,$route,editableOptions){
   editableOptions.theme = 'bs3'; 

  $rootScope.$on("$locationChangeStart", function(event, next, current){


   var paths= JSON.parse($window.sessionStorage.allowedpath);
  // console.log("next " + next);

  // console.log("paths " + paths);
   var nextPath = $location.path();
 //  console.log("next path  " + nextPath);
           function findById(source, id) {
                      for (var i = 0; i < source.length; i++) {
                        if (source[i] === id) {
                          return true;
                        }
                      }
                      return false;
                    };

  
      if (findById(paths,nextPath )){
          }
      else{
          $location.path('/unathorised');
        //  event.preventDefault();
      }
   
  



   
  });
  

}]);






