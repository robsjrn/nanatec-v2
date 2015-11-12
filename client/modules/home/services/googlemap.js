   Rentmngt.service('GoogleMapApi', ['$window', '$q', function ( $window, $q ) {
        var deferred = $q.defer();
        function loadScript() {  
		
            var script = document.createElement('script');
            script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&signed_in=true&libraries=places&callback=initMap';
            document.body.appendChild(script);
        }

        // Script loaded callback, send resolve
        $window.initMap = function () {
		
            deferred.resolve();
        }
        loadScript();

        return deferred.promise;
    }]);