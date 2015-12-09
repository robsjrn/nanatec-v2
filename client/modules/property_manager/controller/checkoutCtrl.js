propertymanager.controller('checkoutCtrl', ['$scope','ngDialog','propertyManagerSrv','$location','$route', function($scope,ngDialog,propertyManagerSrv,$location,$route){

                $scope.tenantid=$route.current.params.tenantid;

                    propertyManagerSrv.getTenantDetails($scope.tenantid)
                       .success(function (data) {
                       	    if (data.exist){$scope.tenantsdetails=data.tenantdetails;}
                       	    else  {
                       	    	 var temp ='<p> Tenant Does Not Exist </p>';
                                ngDialog.open({
                                  template: temp,
                                  plain: true
                                }); 
                       	    }	
                               
                              

                            })
                            .error(function (error) {
                                var temp ='<p>Error Fetching Tenant Details (kindly Inform the Administrator) </p>';
                                ngDialog.open({
                                  template: temp,
                                  plain: true
                                }); 
                            });

                

		}]);