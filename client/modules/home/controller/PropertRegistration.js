Rentmngt.controller('PropertyRegistration', ['$scope','$http','$window','CreateAcctService', function($scope,$http,$window,CreateAcctService){

      $scope.Registration={};
 $scope.Registration="";
 $scope.submitted = false;
  $scope.noFullyConfigured=false;
  $scope.showSpinner=false;
  $scope.disableComponents=false;
   $scope.interacted = function(field) {
      return $scope.submitted || field.$dirty;
    };
	    
    $scope.submit = function() {
      $scope.submitted = true;
    };


       $scope.Userlogin=function(){
               $scope.showSpinner=true;
                 CreateAcctService.userLogin($scope.user)
				 		 .success(function(data) {
								     $scope.invalidcredential=false;
									$window.sessionStorage.token = data.token;
									  $window.location.href=data.homepage;
									   
							 }) 
						 .error(function(data) {
							   $scope.invalidcredential=true;
							    $scope.showSpinner=false;
							    delete $window.sessionStorage.token;
							 });	
      };

     
		 $scope.Save=function(){
           
           if (typeof $scope.Registration.Registrationtype === "undefined")
			{   alert("Kindly choose a Registration Type"); }
            else {
             $scope.Registration.AccessStatus=1;
              $scope.Registration.datecreated=new Date().toISOString();
			   CreateAcctService.CreatePropertyOwner($scope.Registration)
						 .success(function(data) {
                                 $scope.SuccessStatus=true; 
								 $scope.ErrorStatus=false;
								 $scope.disableComponents=true;
							 }) 
						 .error(function(data) {
								 $scope.ErrorStatus=true;
								 $scope.SuccessStatus=false; 
								 $scope.disableComponents=true;
								
							 });
			}

			 
		 }

    
	}]);