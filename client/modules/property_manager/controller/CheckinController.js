

propertymanager.controller('checkinCtrl', ['$scope','ngDialog','propertyManagerSrv','$location','$route', function($scope,ngDialog,propertyManagerSrv,$location,$route){

   $scope.tenantid=$route.current.params.tenantid;
                 
  $scope.assignedunits=[];
 $scope.dueAmount=0;
   


    propertyManagerSrv.vacantUnits()
                       .success(function (data) {
                               $scope.vacantunits=data.vacantunits;

                            })
                            .error(function (error) {
                                var temp ='<p>Error Listing Your Vacant Units (kindly Inform the Administrator) </p>';
                                ngDialog.open({
                                  template: temp,
                                  plain: true
                                }); 
                   }); 

        $scope.assignunit=function(prop){
          $scope.assignedunits.push(prop);
          $scope.dueAmount=$scope.dueAmount+prop.amount;

        } ;   

        $scope.removeassigment=function(selection,index){
           $scope.assignedunits.splice(index,1)
           $scope.dueAmount=$scope.dueAmount-selection.amount;

        } ;  

        $scope.checkin=function(){


             var details={};
                 details.units= $scope.assignedunits;
                 details.amountdue=$scope.dueAmount;
                 details.tenantid=$scope.tenantid;


                 propertyManagerSrv.checkin(details)
                          .success(function (data) {
                                var temp ='<p>Tenant Checked In </p>';
                                ngDialog.open({
                                  template: temp,
                                  plain: true
                                }); 

                            })
                            .error(function (error) {
                                var temp ='<p>Error Checking in The Client (kindly Inform the Administrator) </p>';
                                ngDialog.open({
                                  template: temp,
                                  plain: true
                                }); 
                   }); 


        } ;            

	}]);