var express = require('express');
var router = express.Router();
var jwt = require('jwt-simple');
var DatabaseConn = require('../../database/Database');
var tokenSecret='1234567890QWERTY';

   

   	      function ensureAuthenticated(req, res, next) {
				  try
					  {
						var decoded = jwt.decode(req.headers.token, tokenSecret);
						  req.user={};
						  req.user._id=decoded.username._id;
						  return next();
					  }
					  catch (e)
					  {
						   console.error(e);
						   res.json(401,{error: "Server Error"});
					 }
					  
			}
   



		router.post('/createTenant',DatabaseConn.CreateTenant);
		router.get('/tenantList/:plot',DatabaseConn.listoftenant);

		router.get('/tenantDetails',ensureAuthenticated,DatabaseConn.tenantDetails); 
		router.get('/tenantStatement',ensureAuthenticated,DatabaseConn.tenantStatement);
		router.post('/updateTenantData',ensureAuthenticated,DatabaseConn.updateTenantData); 
           
        router.get('/Findneighbours',ensureAuthenticated,DatabaseConn.Findneighbours);
       
		router.get('/TenantInfo',ensureAuthenticated,DatabaseConn.TenantInfo);
	    router.get('/GetDocument',ensureAuthenticated,DatabaseConn.GetDocument);
		router.get('/UpdateTenantAgreement',ensureAuthenticated,DatabaseConn.UpdateTenantAgreement);
		router.post('/VacateNotice',ensureAuthenticated,DatabaseConn.VacateNotice);
     
	    router.get('/EvictionNotice',ensureAuthenticated,DatabaseConn.GetTenantVacateNotice);
         router.post('/Mail',ensureAuthenticated,DatabaseConn.CreateMail);

 router.post('/photoupload',ensureAuthenticated,DatabaseConn.photoupload);

 router.post('/addPost',ensureAuthenticated,DatabaseConn.addPost);
 router.get('/getPost',ensureAuthenticated,DatabaseConn.getPost);

module.exports = router;