
propertymanager.controller('singletrxnCtrl', ['$scope','ngDialog','$window','propertyManagerSrv','$timeout', function($scope,ngDialog,$window,propertyManagerSrv,$timeout){
                  propertyManagerSrv.tenantList()
                       .success(function (data) {
                               $scope.tenants=data.tenants;
                               //console.log(data);
                            })
                            .error(function (error) {
                            
                            }); 
              $scope.name="";
              $scope.onItemSelected=function(){
		          console.log('selected='+$scope.name);
	            }  


	       $scope.handleSelection=function(selectedItem){
				 $scope.model=selectedItem;
				 $scope.current=0;
				 $scope.selected=true;        
				
	       };
			  $scope.current=0;
			  $scope.selected=true;
			  $scope.isCurrent=function(index){
				 return $scope.current==index;
			  };
			  $scope.setCurrent=function(index){
				 $scope.current=index;
			  };            
    
	}]);
