propertymanager.controller('unitSettingsCtrl', ['$scope','ngDialog','propertyManagerSrv','$location','$route', function($scope,ngDialog,propertyManagerSrv,$location,$route){

  $scope.deposit={};
  $scope.settings={};

           $scope.unitid=$route.current.params.unitid;
           $scope.unitname=$route.current.params.unitname;
           $scope.rentamount=Number($route.current.params.amount);
 
    $scope.calcRentDeposit= function(value) {
    	if (value==='depositamount'){$scope.deposit.amount=$scope.rentamount;}
    	else if (value==='depositrentpercentage'){
        		$scope.deposit.amount=($scope.percentage * $scope.rentamount)/100;
    	}
    	else if(value==='depositfixedamount'){$scope.deposit.amount=$scope.fixedamount;}
      
      
    };

        $scope.calcCheckinAmount = function(value) {
			     if (value==='rentonly'){$scope.settings.checkinamount=$scope.rentamount;}
			     else if (value==='rentanddeposit'){$scope.settings.checkinamount=$scope.deposit.amount + $scope.rentamount;}
			     else if (value==='checkinfixedamount'){$scope.settings.checkinamount=$scope.tenantcheckinfixedamount ;}
			   };

      $scope.update=function(){
      	$scope.update={};
      	$scope.update.settings=$scope.settings;
        $scope.update._id=$scope.unitid;
        propertyManagerSrv.UpdateUnitSettings($scope.update) 

                      .success(function (data) {
                            
                                var temp ='<p>Unit  Settings Successfully Created </p>';
                                ngDialog.open({
                                  template: temp,
                                  plain: true
                                }); 
                                
                            })
                            .error(function (error) {
                                var temp ='<p>Error Creating Unit  Settings (kindly Inform the Administrator) </p>';
                                ngDialog.open({
                                  template: temp,
                                  plain: true
                                }); 
                            });    
      };
    

		}]);