
propertymanager.controller('PropertyCtrl', ['$scope','ngDialog','propertyManagerSrv','$location', function($scope,ngDialog,propertyManagerSrv,$location){

  

          propertyManagerSrv.getMyProperties()
                       .success(function (data) {
				               $scope.properties=data.properties;
				               console.log();
				            })
				            .error(function (error) {
				                var temp ='<p>Error Listing Your Properties (kindly Inform the Administrator) </p>';
                                ngDialog.open({
		                          template: temp,
		                          plain: true
                                }); 
				   });   
           $scope.editproperty=function(property){
           
                  var det=btoa(angular.toJson(property));

         	    $location.path('/edit-property/'+det);
           };


         $scope.viewProperty=function(property){
         	  $scope.viewproperty=property;
                 ngDialog.openConfirm({
                    template: 'Viewproperty.html',
                    className: 'ngdialog-theme-default',
                    scope: $scope
                }).then(function (value) {

                   }, function (reason) {
                    
                     });
         };

           $scope.addProperty=function(){

               ngDialog.openConfirm({
                    template: 'Addproperty.html',
                    className: 'ngdialog-theme-default',
                    scope: $scope
                }).then(function (value) {

                    $scope.prop=value;
                	propertyManagerSrv.addProperty($scope.prop) 
                	  .success(function (data) {
                	  	      $scope.properties.push($scope.prop);
				                var temp ='<p>Property  Successfully Created </p>';
                                ngDialog.open({
		                          template: temp,
		                          plain: true
                                }); 
				                
				            })
				            .error(function (error) {
				                var temp ='<p>Error Creating Property (kindly Inform the Administrator) </p>';
                                ngDialog.open({
		                          template: temp,
		                          plain: true
                                }); 
				            });                           	
                		      

                   }, function (reason) {
                    
                     });
              };

          $scope.saveproperty = function() {


          }
                          
    
	}]);
