propertymanager.controller('unitCtrl', ['$scope','ngDialog','propertyManagerSrv','$location','$route', function($scope,ngDialog,propertyManagerSrv,$location,$route){

           $scope.propertyid=$route.current.params.propertyid;
           $scope.property=$route.current.params.propertyname;
            $scope.units=[];
                propertyManagerSrv.ListPropertyUnits($scope.propertyid)
                       .success(function (data) {
                               $scope.units=data.units;
                              // console.log(data.units);
                            })
                            .error(function (error) {
                                var temp ='<p>Error Listing Your Units (kindly Inform the Administrator) </p>';
                                ngDialog.open({
                                  template: temp,
                                  plain: true
                                }); 
                   }); 

              $scope.addUnit=function(){

               ngDialog.openConfirm({
                    template: 'AddUnit.html',
                    className: 'ngdialog-theme-default',
                    scope: $scope
                }).then(function (value) {

                    $scope.unt=value;
                    $scope.unt.propertyid=$scope.propertyid;
                    $scope.unt.propertyname=$scope.property;
                    $scope.unt.occupationStatus="vacant";

                    propertyManagerSrv.addUnit($scope.unt) 

                      .success(function (data) {
                             $scope.units.push($scope.unt);
                                var temp ='<p>Unit  Successfully Created </p>';
                                ngDialog.open({
                                  template: temp,
                                  plain: true
                                }); 
                                
                            })
                            .error(function (error) {
                                var temp ='<p>Error Creating Unit (kindly Inform the Administrator) </p>';
                                ngDialog.open({
                                  template: temp,
                                  plain: true
                                }); 
                            });                             
                              

                   }, function (reason) {
                    
                     });
              };

       
               
	}]);