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

                router.get('/Booking',ensureAuthenticated,DatabaseConn.ListBookings); 
                router.put('/Booking',ensureAuthenticated,DatabaseConn.updatebooking);

                 router.get('/reservation',ensureAuthenticated,DatabaseConn.Listreservation); 
                 router.put('/reservation',ensureAuthenticated,DatabaseConn.updatereservation);  
                

  module.exports = router;              