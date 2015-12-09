propertymanager.factory('propertyManagerSrv', ['$http', function($http) {

 var url='/web/propertymanager';
	var data = {

		/*  Property */
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

		 /*  Units  */

		ListAllUnits: function() {
			var promise = $http.get(url+ '/Unit/All')
			return promise;
		 },
        ListPropertyUnits: function(propertyid) {
			var promise = $http.get(url+ '/Unit/'+propertyid)
			return promise;
		 },


		 UnitExist: function(unitname) {
			var promise = $http.get(url+ '/Unit/check/'+unitname)
			return promise;
		 },
	
         addUnit: function(details) {
			var promise =  $http.post(url + '/Unit',details); 
			return promise;
		 },
         getUnitDetails: function(details) {
			var promise =  $http.get(url + '/Unit'+details); 
			return promise;
		 },
         updateUnit: function(details) {
			var promise =  $http.put(url + '/Unit',details); 
			return promise;
		 },
         UpdateUnitSettings: function(details) {
			var promise =  $http.put(url + '/UpdateUnitSettings',details); 
			return promise;
		 },
		 
         deleteUnit: function(unitname) {
			var promise =  $http.delete(url + '/Unit'+unitname); 
			return promise;
		 },
		  vacantUnits: function() {
			var promise =  $http.get(url + '/vacantUnits'); 
			return promise;
		 },

	        getTenantDetails:function (tenantid) {
		     return $http.get(url + '/Tenant/id/'+ tenantid);
            },

            checkTenantContact:function (contact) {
		     return $http.get(url + '/Tenant/contact/'+ contact);
            },
            createTenant:function (tenant) {
            	console.log(tenant)
		     return $http.post(url + '/Tenant',tenant); 
            },
             tenantLookup:function (searchid,lookup) {
		     return $http.get(url + '/Tenant/lookup/?searchid='+searchid+'&lookup='+lookup);
            },
            tenantUpdate:function (details) {
		     return $http.put(url + '/Tenant',details); 
            },
           tenantList:function () {
		     return $http.get(url + '/Tenant'); 
            },
            DeleteTenant:function (tenantid) {
		     return $http.delete(url + '/Tenant/'+tenantid); 
            },


            checkin: function(details) {
			var promise =  $http.post(url + '/checkin',details); 
			return promise;
		    },

              }
	return data;
}]);
