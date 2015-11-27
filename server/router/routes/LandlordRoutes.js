var express = require('express'),
         _ =  require('underscore'),
    router = express.Router(),
    DatabaseConn = require('../../database/Database'),
    jwt = require('jwt-simple'),
    Monthlyposting = require('../../jobs/producer'),
	config=require('../../config/Config.js'),
     userRoles = require('../../config/routingConfig.js').userRoles,
     accessLevels = require('../../config/routingConfig.js').accessLevels;


	tokenSecret='1234567890QWERTY';  //move this to  config
 var routesConfig = [
           {
			path: '/GetLandlordNotice',
			httpMethod: 'POST',
			accessLevel: accessLevels.admin
            },
             {
			path: '/GetLandlordNotice',
			httpMethod: 'GET',
			accessLevel: accessLevels.admin
            },

             {
			path: '/GetLandlordme',
			httpMethod: 'GET',
			accessLevel: accessLevels.public
            }
		 ];

          function ensureAuthenticated(req, res, next) {
				  try
					  {
						var decoded = jwt.decode(req.headers.token, tokenSecret);

						   req.user=decoded.user;
            
						  return next();
					  }
					  catch (e)
					  {
						   console.error(e);
						   res.json(401,{error: "User not Authenticated "});
					 }
					  
			};

			 function postrequest(req, res, next) {

                     if (req.user.userrole.role==='admin'){
                     	req.body.createdby=req.user.names;
                     	req.body.datecreated=new Date();
                     	req.body.verifiedby=req.user.names;
                     	req.body.dateverified=new Date();
                     	req.body.verifiedstatus='verified';
                     	req.body.propertymanagerid=req.user._id;

                     }else {
                     	req.body.createdby=req.user.names;
                     	req.body.datecreated=new Date();
                     	req.body.verifiedstatus='pending';
                     	req.body.propertymanagerid=req.user.propertymanagerid;

                     };

			 	return next();
			 };

           
			 function getrequest(req, res, next) {


                     if (req.user.userrole.role==='admin'){
                     	req.body.propertymanagerid=req.user._id;

                     }else {   
                     	req.body.propertymanagerid=req.user.propertymanagerid;

                     }

			 	return next();
			 };



  /* New Api design */
/* 1   Property */
   router.post('/property',ensureAuthenticated,postrequest,DatabaseConn.AddProperty); //create property
   router.get('/property/check/:plotname',ensureAuthenticated,DatabaseConn.Getplot);  // Check  property Exist
   router.get('/property/:plotname',ensureAuthenticated,DatabaseConn.GetplotDetails);  // Get propperty details
   router.get('/property',ensureAuthenticated,getrequest,DatabaseConn.GetAllProperty);
   router.put('/property',ensureAuthenticated,DatabaseConn.Updateproperty);  // update property
   router.delete('/property/:plotname',ensureAuthenticated,DatabaseConn.Deleteproperty);  // delete property

/* 2   Unit Management */

   router.get('/Unit/check/:data',DatabaseConn.CheckHseExists);  // Check  unit no Exist
   router.post('/Unit',ensureAuthenticated,postrequest,DatabaseConn.createunit);   // create a unit
    router.put('/Unit',ensureAuthenticated,DatabaseConn.UpdateUnit);  // update a unit
   router.put('/UpdateUnitSettings',ensureAuthenticated,DatabaseConn.UpdateUnitSettings);  // update a unit Settings
   router.get('/Unit/:propertyid',ensureAuthenticated,DatabaseConn.PropertyUnits); 
   router.get('/Unit/All',ensureAuthenticated,DatabaseConn.GetLandlordUnits); 
   router.delete('/Unit/:unit',ensureAuthenticated,DatabaseConn.deleteHse);


   router.get('/vacantUnits',ensureAuthenticated,getrequest,DatabaseConn.vacantunits);  // Check  unit no Exist

 /* 3   Tenant Management */

   router.get('/Tenant/id/:idnumber',ensureAuthenticated,DatabaseConn.CheckTenantid);  //check tenant id
   router.get('/Tenant/contact/:contactnumber',ensureAuthenticated,DatabaseConn.checkTenantContact);   //check tenant contact
   router.post('/Tenant',ensureAuthenticated,postrequest,DatabaseConn.CreateTenant);   // create a Tenant
   router.get('/Tenant/lookup',ensureAuthenticated,DatabaseConn.Tenantlookup);  //check details
   router.put('/Tenant',ensureAuthenticated,DatabaseConn.updateTenant);  //update
   router.get('/Tenant',ensureAuthenticated,DatabaseConn.TenantList);  //List of All Tenants
   router.delete('/Tenant/:tenantid',ensureAuthenticated,DatabaseConn.deleteTenant);




			
module.exports = router;