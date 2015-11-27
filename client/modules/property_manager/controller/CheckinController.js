

propertymanager.controller('checkinCtrl', ['$scope','ngDialog','propertyManagerSrv','$location','$route', function($scope,ngDialog,propertyManagerSrv,$location,$route){

   $scope.tenantid=$route.current.params.tenantid;


   


    propertyManagerSrv.vacantUnits()
                       .success(function (data) {
                               $scope.vacantunits=data.vacantunits;
                              console.log(data);
                            })
                            .error(function (error) {
                                var temp ='<p>Error Listing Your Vacant Units (kindly Inform the Administrator) </p>';
                                ngDialog.open({
                                  template: temp,
                                  plain: true
                                }); 
                   }); 

	}]);