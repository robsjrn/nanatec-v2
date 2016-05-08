propertymanager.controller('checkoutCtrl', ['$scope','ngDialog','propertyManagerSrv','$location','$route', function($scope,ngDialog,propertyManagerSrv,$location,$route){

                $scope.tenantid=$route.current.params.tenantid;

                    propertyManagerSrv.getTenantDetails($scope.tenantid)
                       .success(function (data) {
                       	    if (data.exist){
                              $scope.tenantsdetails=data.tenantdetails;
                              $scope.units=data.tenantdetails.units;
                            }
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

                    $scope.checkout=function(unit,indx){

                           var unitdet ={};
                       $scope.numberofunits=$scope.units.length;
                              if ($scope.numberofunits != 1){
                                   unitdet.setvacant=false;
                              }
                              else {
                                unitdet.setvacant=true;
                              }
                   
                               unitdet.unit=unit;
                               unitdet.numberofunit=$scope.numberofunits;
                               unitdet.tenantid=$scope.tenantid;



                      propertyManagerSrv.checkout(unitdet)
                          .success(function (data) {
                                var temp ='<p>Tenant Checked Out </p>';
                                ngDialog.open({
                                  template: temp,
                                  plain: true
                                }); 

                            })
                            .error(function (error) {
                                var temp ='<p>Error Checking-Out The Client (kindly Inform the Administrator) </p>';
                                ngDialog.open({
                                  template: temp,
                                  plain: true
                                }); 
                   }); 
                               

                       
                        

                        
                     

                    };  

                            

                

		}]);