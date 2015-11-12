propertymanager.factory('propertyManagerSrv', ['$http', function($http) {

 var url='/web/propertymanager';
	var data = {
         propertyExist: function(plotname) {
			var promise = $http.get(url+ '/property/check/'+plotname)
			return promise;
		 },
		 getMyProperties: function() {
			var promise = $http.get(url+ '/property')
			return promise;
		 },

		 

         addProperty: function(details) {
			var promise =  $http.post(url + '/property',details); 
			return promise;
		 },
         getPropertyDetails: function(details) {
			var promise =  $http.get(url + '/property/'+details); 
			return promise;
		 },
         updateProperty: function(details) {
			var promise =  $http.put(url + '/property',details); 
			return promise;
		 },
         deleteProperty: function(property) {
			var promise =  $http.delete(url + '/property/'+property); 
			return promise;
		 },

              }
	return data;
}]);
