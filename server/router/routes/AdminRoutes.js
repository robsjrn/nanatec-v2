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


     


           router.get('/logout',DatabaseConn.logout);
		  router.get('/AccessRequest',ensureAuthenticated,DatabaseConn.Accessrequest);
		  router.post('/GrantAccess',ensureAuthenticated,DatabaseConn.GrantAccess);
		 router.post('/HseTypeConfiguration',ensureAuthenticated,DatabaseConn.HseTypeConfiguration);
		router.post('/PaymentmethodConfiguration',ensureAuthenticated,DatabaseConn.PaymentmethodConfiguration);
		router.post('/TransactiontypeConfiguration',ensureAuthenticated,DatabaseConn.TransactiontypeConfiguration);
		router.post('/ExpenseTypeConfiguration',ensureAuthenticated,DatabaseConn.ExpenseTypeConfiguration);


        //Service that dont Require Login
  



module.exports = router