   Rentmngt.service('CreateAcctService', ['$http','$q', function ( $http,$q) {
     var transaction={};
    var url='/web';
      this.checkusername = function (username) {
            var deferred = $q.defer();
         $http.get(url + '/user/'+  username)
         .success(function(data) { 
          deferred.reject(data);
        }).error(function(data) {    
          deferred.resolve(data);
       });
     return deferred.promise;
    };

      this.CreatePropertyOwner = function (data) {
        return  $http.post('/web/propertyAccount', data);
    };
      this.userLogin = function (user) {
        return  $http.post('web/Login',user);

      

    };
    }]);