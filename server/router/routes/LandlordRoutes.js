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
                     	req.body.ownerid=req.user._id;

                     }else {
                     	req.body.createdby=req.user.names;
                     	req.body.datecreated=new Date();
                     	req.body.verifiedstatus='pending';
                     	req.body.ownerid=req.user.propertymanagerid;

                     }

			 	return next();
			 };

           
			 function getrequest(req, res, next) {

			 	console.error("the user role is  " + req.user.userrole.role);
                     if (req.user.userrole.role==='admin'){
                     	req.body.ownerid=req.user._id;

                     }else {   
                     	req.body.ownerid=req.user.propertymanagerid;

                     }

			 	return next();
			 };



  /* New Api design */
/* 1   Property */
   router.post('/property',ensureAuthenticated,postrequest,DatabaseConn.AddProperty); //create property
   router.get('/property/check/:plotname',ensureAuthenticated,DatabaseConn.Getplot);  // Check  plot Exist
   router.get('/property/:plotname',ensureAuthenticated,DatabaseConn.GetplotDetails);  // Get plot details
   router.get('/property',ensureAuthenticated,getrequest,DatabaseConn.GetAllProperty);
   router.put('/property',ensureAuthenticated,DatabaseConn.Updateproperty);  // update plot
   router.delete('/property/:plotname',ensureAuthenticated,DatabaseConn.Deleteproperty);  // delete plot

/* 2   House Management */

   router.get('/House/check/:data',DatabaseConn.CheckHseExists);  // Check  House no Exist
   router.post('/House',ensureAuthenticated,DatabaseConn.CreateHouse);   // create a house
   router.put('/House',ensureAuthenticated,DatabaseConn.Updatehse);  // update House
   router.get('/House',ensureAuthenticated,DatabaseConn.GetLandlordHouse); 
   router.delete('/House/:hsename',ensureAuthenticated,DatabaseConn.deleteHse);

 /* 3   Tenant Management */

   router.get('/Tenant/id/:idnumber',ensureAuthenticated,DatabaseConn.CheckTenantid);  //check tenant id
   router.get('/Tenant/contact/:contactnumber',ensureAuthenticated,DatabaseConn.checkTenantContact);   //check tenant contact
   router.post('/Tenant',ensureAuthenticated,DatabaseConn.CreateTenant);   // create a Tenant
   router.get('/Tenant/lookup',ensureAuthenticated,DatabaseConn.Tenantlookup);  //check details
   router.put('/Tenant',ensureAuthenticated,DatabaseConn.updateTenant);  //update
   router.get('/Tenant',ensureAuthenticated,DatabaseConn.TenantList);  //List of All Tenants
   router.delete('/Tenant/:tenantid',ensureAuthenticated,DatabaseConn.deleteTenant);



router.post('/CreateLandlord',DatabaseConn.CreateLandlord);
router.get('/LandLordDetails',ensureAuthenticated,DatabaseConn.userDetails); 
router.get('/LandLordConfiguration',DatabaseConn.LandLordConfiguration);
router.get('/LandlordTenants',ensureAuthenticated,DatabaseConn.LandlordTenants);
router.post('/createTenant',ensureAuthenticated,DatabaseConn.CreateTenant);




router.post('/hseLookup',ensureAuthenticated,DatabaseConn.hseLookup);
router.post('/updateHsedetails',ensureAuthenticated,DatabaseConn.updateHsedetails);


	router.post('/LandlordAddPlots',ensureAuthenticated,DatabaseConn.LandlordAddPlots);
	router.post('/Landlordphotoupload',ensureAuthenticated,DatabaseConn.Landlordphotoupload);
	router.post('/MonthlyRentPosting',ensureAuthenticated,Monthlyposting.processJob);
	/*  notice have to be authorised */
	router.get('/GetLandlordNotice',ensureAuthenticated,DatabaseConn.GetLandlordNotice);
	router.post('/LandlordNoticeUpdate',ensureAuthenticated,DatabaseConn.LandlordNoticeUpdate);

		  router.get('/tenantList/:plot',ensureAuthenticated,DatabaseConn.listoftenant);
		  router.get('/houseList/:plot',ensureAuthenticated,DatabaseConn.listofHouse);
//admin Transactions
		   router.post('/RentalPayment',ensureAuthenticated,DatabaseConn.postTransaction);
           router.post('/BatchRentalPayment',ensureAuthenticated,DatabaseConn.BatchRentalPayment);
  
  
  // maker Transactons
  		   router.post('/makerRentalPayment',ensureAuthenticated,DatabaseConn.makerpostTransaction);
           router.post('/makerBatchRentalPayment',ensureAuthenticated,DatabaseConn.makerBatchRentalPayment);


		 //router.get('/bookedtenantList/:plot',ensureAuthenticated,DatabaseConn.listofbookedtenant);
		 
		



		
		router.post('/SaveDocument',ensureAuthenticated,DatabaseConn.Documents);
//to delete this not used *************
        router.post('/tenantDataID',ensureAuthenticated,DatabaseConn.tenantDataID);
        router.post('/tenantDataHseName',ensureAuthenticated,DatabaseConn.tenantDataHseName);
//********************

        router.post('/ServeEvictionNotice',ensureAuthenticated,DatabaseConn.EvictionNotice);
         router.post('/Mail',ensureAuthenticated,DatabaseConn.CreateMail);
         router.post('/CreateNotification',ensureAuthenticated,DatabaseConn.NotificationScheduling);



            router.post('/SearchReceipt',ensureAuthenticated,DatabaseConn.SearchReceipt);
			router.post('/GeneralSearch',ensureAuthenticated,DatabaseConn.GeneralSearch);
			router.post('/statement',ensureAuthenticated,DatabaseConn.statement);
			
            router.get('/TotalUnpaid',ensureAuthenticated,DatabaseConn.TotalUnpaid);

             router.get('/UnverifiedTransactions',ensureAuthenticated,DatabaseConn.UnverifiedTransactions);
			
            router.get('/PaymentDateAggregation',ensureAuthenticated,DatabaseConn.PaymentDateAggregation);
            router.post('/DeleteReceipt',ensureAuthenticated,DatabaseConn.DeleteReceipt);
			router.post('/LandlordSendSms',ensureAuthenticated,DatabaseConn.LandlordSendSms); 

    router.get('/ViewMessages',ensureAuthenticated,DatabaseConn.ViewMessages);
	

	router.post('/LandlordCreateUser',ensureAuthenticated,DatabaseConn.LandlordCreateUser); 
			
module.exports = router;