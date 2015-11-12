var express = require('express'),
 multer  = require('multer'),
 router = express.Router(),
 jwt = require('jwt-simple'),

 tokenSecret='1234567890QWERTY',
 DatabaseConn = require('../../Database/Database');






            function ensureAuthenticated(req, res, next) {
				  try
					  {
						var decoded = jwt.decode(req.headers.token, tokenSecret);
						  req.user={};
						  req.user.username=decoded.username._id;
						  req.user._id=decoded.username._id;
						  req.user.landlordid=decoded.username.landlordid;
						  return next();
					  }
					  catch (e)
					  {
						   console.error(e);
						   res.json(401,{error: "Server Error"});
					 }
					  
			}

			/* 1   Property Master  -where admin registers new property */
                router.get('/AdminDetails',ensureAuthenticated,DatabaseConn.userDetails); 

                router.post('/properytMaster',ensureAuthenticated,DatabaseConn.CreatePropertyMaster);
                router.get('/properytMaster',ensureAuthenticated,DatabaseConn.getPropertyMaster);
                router.put('/properytMaster',ensureAuthenticated,DatabaseConn.updatepropertyMaster);
                router.delete('/properytMaster',ensureAuthenticated,DatabaseConn.deletePropertyMaster);
			/* end of propert Master */

            /* 2  Property User  -where admin registers new property system users */
              

                router.post('/properytUser',ensureAuthenticated,DatabaseConn.CreateproperytUser);
                router.get('/properytUser',ensureAuthenticated,DatabaseConn.getproperytUser);
                router.put('/properytUser',ensureAuthenticated,DatabaseConn.updateproperytUser);
                router.delete('/properytUser',ensureAuthenticated,DatabaseConn.deleteproperytUser);

                router.get('/properytUnassignedUser',ensureAuthenticated,DatabaseConn.getunassignedproperytUser);
                router.get('/configurations',ensureAuthenticated,DatabaseConn.LandLordConfiguration);
                
			
			/* end of propert Master users*/

			   /* 2  Property mANAGER  -where admin registers new property system users */

			     router.get('/propertyPortfolio',ensureAuthenticated,DatabaseConn.propertyPortfolio);
                 router.post('/createunit',ensureAuthenticated,DatabaseConn.createunit);
                 router.get('/PropertyList',ensureAuthenticated,DatabaseConn.listproperty);
			     router.post('/CreateTenant',ensureAuthenticated,DatabaseConn.CreateTenant);
			     router.post('/GrantTenantAccess',ensureAuthenticated,DatabaseConn.GrantAccess);
			     router.get('/TenantAccessRequest',ensureAuthenticated,DatabaseConn.Accessrequest);

                 router.get('/listofUnbookedtenant',ensureAuthenticated,DatabaseConn.listofUnbookedtenant); 
	         	 router.get('/VacanthouseList',ensureAuthenticated,DatabaseConn.listofVacantHouse);
	         	 router.get('/OccupiedTenantList',ensureAuthenticated,DatabaseConn.OccupiedTenantList);
	             router.get('/listtenant',ensureAuthenticated,DatabaseConn.listtenant);


	         	router.post('/checkin',ensureAuthenticated,DatabaseConn.checkin);
	         	router.post('/vacateUnit',ensureAuthenticated,DatabaseConn.vacate);

	         	

               /* end of propertY mANAGER*/
            /* from home page */

          //router.post('/property',[multer({ dest: './Client/uploads/property'}),DatabaseConn.RegisterProperty]); //create property
          router.get('/property',DatabaseConn.listAllproperty);
          router.post('/PropertyBooking',DatabaseConn.PropertyBooking);
          
             /* end home page */

		  router.post('/CreatePropertyOwner',DatabaseConn.CreatePropertyOwner);
		  router.post('/PropertyOwnerProfile',ensureAuthenticated,DatabaseConn.PropertyOwnerProfile);
		  router.get('/PropertyOwnerDetails',ensureAuthenticated,DatabaseConn.PropertyOwnerDetails);
		  router.post('/ContactExists',DatabaseConn.ContactExists);
		  router.post('/UsernameExists',DatabaseConn.UsernameExists);
		  router.post('/PropertyListing',ensureAuthenticated,DatabaseConn.PropertyListing); 
		  router.post('/PropertyRegistration',ensureAuthenticated,DatabaseConn.PropertyRegistration);
         router.post('/GetProperty',ensureAuthenticated,DatabaseConn.GetProperty);
          router.post('/PropertyPhotoUpload',ensureAuthenticated,DatabaseConn.PropertyPhotoUpload);


    

		  router.post('/login',function(req,res){
			  DatabaseConn.PropertyOwnerCredentials(req.body.username,req.body.password, function(err, user) {
				 if (err)  {  res.send(401);  }
				 if (!user) {res.send(401); } 
				 if (user !==null)
				 {
				   var token = jwt.encode({username: user.username}, tokenSecret);
					  res.json({token : token,homepage:user.Homepage});	
						 }
				});
				   
		  });

		 router.get('/logout',DatabaseConn.logout);

module.exports = router;