Rentmngt.directive('checkUsername', ['CreateAcctService', function ( CreateAcctService ) {
             
             return {
				    require : 'ngModel',
				    link : function($scope, element, attrs, ngModel) {
				      ngModel.$asyncValidators.usernameAvailable = function(username) {
				        return CreateAcctService.checkusername(username);
				      };
				    }
				  }



			}]);