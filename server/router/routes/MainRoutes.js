var express = require('express')
, router = express.Router()
, jwt = require('jwt-simple')
, DatabaseConn = require('../../database/Database')
,userRoles = require('../../config/routingConfig.js').userRoles
, tokenSecret='1234567890QWERTY';




   
	       function ensureAuthenticated(req, res, next) {
				  try
					  {
						var decoded = jwt.decode(req.headers.token, tokenSecret);
						  req.user={};
						  req.user._id=decoded.username;
						  //req.user.landlordid=decoded.landlordif;
						  return next();
					  }
					  catch (e)
					  {
						   console.error(e);
						   res.json(401,{error: "Server Error"});
					 }
					  
			}

  
           router.post('/Login',   function(req, res) {
   				DatabaseConn.getCredentials(req.body.username,req.body.password, function(err, user) {
				 if (err)  {  res.send(401);  }
				 if (!user) {res.send(401); } 
				 if (user !==null)
				 {
				 	
				   var token = jwt.encode({user: user, accessrole:user.userrole.role}, tokenSecret);
					          res.json({token : token,
						             role:user.userrole.role	,
							         homepage:user.Homepage,
							         allowedpath:user.allowedPath,
							         names:user.names
						       });	
						 }
				});
				   
			  });


            router.get('/logout',DatabaseConn.logout);
          
      




 ///do delete
         router.post('/propertyAccount',DatabaseConn.CreateAccount);//create property manager account
         router.post('/serviceAccount',DatabaseConn.CreateAccount);//create service Provider account
         router.get('/user/:userid',DatabaseConn.checkuser);  //Check user name


        //Service that dont Require Login
          router.post('/ServiceRegistration',DatabaseConn.ServiceRegistration); 
          router.post('/ServiceListing',DatabaseConn.ServiceListing);
		  router.post('/VacantRentalListing',DatabaseConn.VacantRentalListing);
		  router.post('/CreateLandlord',DatabaseConn.CreateLandlord);
          router.post('/Recoverpwd',DatabaseConn.Recoverpwd);
          router.post('/CheckidExists',DatabaseConn.idExists);
         // router.post('/CheckPlotExist',DatabaseConn.CheckPlotExist);      moved to landlord routes
		 // router.post('/CheckHseNoExists',DatabaseConn.CheckHseNoExists);
          router.post('/CheckPhonenumberExists',DatabaseConn.phonenumber);
          router.get('/Viewmail',ensureAuthenticated,DatabaseConn.Viewmail);
          router.post('/Mail',ensureAuthenticated,DatabaseConn.CreateMail);
		  router.post('/CheckPwd',ensureAuthenticated,DatabaseConn.CheckPwd);
		  router.post('/ChangePwd',ensureAuthenticated,DatabaseConn.ChangePwd);


module.exports = router