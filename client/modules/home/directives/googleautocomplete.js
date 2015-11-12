

 	 Rentmngt.directive('googleautocomplete', ['GoogleMapApi', function ( GoogleMapApi ) {
			
             var link = function(scope, element, attrs,model) {
				 var map,autocomplete;
                 function initMap() {
                    if (map === void 0) {
                         var options = {
                                    types : [],
                                    componentRestrictions: {}
                                  };

                        autocomplete=  new google.maps.places.Autocomplete(element[0],options);
						 google.maps.event.addListener(autocomplete, 'place_changed', onPlaceChanged);                         
		        	    }
				      }
                 GoogleMapApi.then(function () {
					 
                      initMap();
					 
                    }, function () {
                        console.log("promise Rejected map not initialised");
                    });

					function onPlaceChanged(){
							  if (autocomplete.getPlace().geometry) {
								  scope.$apply(function() {
                                           model.$setViewValue(element.val());
                                      });

							  } else {
								document.getElementById('autocomplete').placeholder = 'Enter a location';
							  }
					      }					
                      
                  };
    
						return {
							require : 'ngModel',
							link: link
						};



			}]);