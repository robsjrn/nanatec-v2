


var LoginMngt;

LoginMngt= angular.module('RentmngtAppLogin', [] ); 

LoginMngt.controller('loginCtrl', ['$scope','$http','$window', function($scope,$http,$window){

       $scope.Userlogin=function(){
            $scope.showSpinner=true;
                $http.post('web/Login',$scope.user)
				 		 .success(function(data) {
								     $scope.invalidcredential=false;
									 $window.sessionStorage.token = data.token;
									 $window.sessionStorage.role = data.role;
									 $window.sessionStorage.allowedpath = data.allowedpath;
									 $window.sessionStorage.names = data.names;
								     $window.location.href=data.homepage;
									   
							 }) 
						 .error(function(data) {
							   $scope.invalidcredential=true;
							    $scope.showSpinner=false;
							    delete $window.sessionStorage.token;
							    delete $window.sessionStorage.role 
								delete $window.sessionStorage.allowedpath ;
							 });	
      };


        $scope.forgotPassword=function(){
             $http.post('web/sendmail',$scope.user)
				 .success(function(data) {
					 })
				.error(function(data) {
						  })
	  
	  };
    
	}]);


