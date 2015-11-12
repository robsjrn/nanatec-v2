propertymanager.controller('EditPropertyCtrl', ['$scope','ngDialog','propertyManagerSrv','$location','$route', function($scope,ngDialog,propertyManagerSrv,$location,$route){

            $scope.property=angular.fromJson(atob($route.current.params.property));

            $scope.update=function(prop){

            	propertyManagerSrv.updateProperty(prop)

                            .success(function (data) {
				               var temp ='<p>Property Successfully Updated </p>';
                                ngDialog.open({
		                          template: temp,
		                          plain: true
                                }); 
				            })
				            .error(function (error) {
				                var temp ='<p>Error Updating Property (kindly Inform the Administrator) </p>';
                                ngDialog.open({
		                          template: temp,
		                          plain: true
                                }); 
                          });
                };

                $scope.cancel=function(){
                	$location.path('/properties');


                };
               
	}]);