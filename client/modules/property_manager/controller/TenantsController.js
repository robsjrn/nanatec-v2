propertymanager.controller('tenantsCtrl', ['$scope','ngDialog','$window','propertyManagerSrv', function($scope,ngDialog,$window,propertyManagerSrv){
   $scope.tenants=[];


                   propertyManagerSrv.tenantList()
                       .success(function (data) {
                               $scope.tenants=data.tenants;
                              // console.log(data);
                            })
                            .error(function (error) {
                                var temp ='<p>Error Listing Your Units (kindly Inform the Administrator) </p>';
                                ngDialog.open({
                                  template: temp,
                                  plain: true
                                }); 
                   }); 


    $scope.addTenant=function(){

    	   ngDialog.openConfirm({
                    template: 'AddTenant.html',
                    className: 'ngdialog-theme-default',
                    scope: $scope
                }).then(function (value) {
                    $scope.ten=value;
                    $scope.ten.amountdue=0;
                	propertyManagerSrv.createTenant($scope.ten) 
                	  .success(function (data) {
                	  	      $scope.tenants.push($scope.ten);
				                var temp ='<p>Tenant  Successfully Created </p>';
                                ngDialog.open({
		                          template: temp,
		                          plain: true
                                }); 
				                
				            })
				            .error(function (error) {
				                var temp ='<p>Error Saving Tenant  Details (kindly Inform the Administrator) </p>';
                                ngDialog.open({
		                          template: temp,
		                          plain: true
                                }); 
				            });                           	
                		      

                   }, function (reason) {
                    
                     });

    };
    
	}]);