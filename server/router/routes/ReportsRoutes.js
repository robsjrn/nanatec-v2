var express = require('express');
var router = express.Router();
var jwt = require('jwt-simple');
var DatabaseConn = require('../../database/Database');
var reports = require('../../reports/landlord/LandlordReports');
var tokenSecret='1234567890QWERTY';

   

   	      function ensureAuthenticated(req, res, next) {
				  try
					  {
						var decoded = jwt.decode(req.headers.token, tokenSecret);
						  req.user={};
						  req.user._id=decoded.username;
						  return next();
					  }
					  catch (e)
					  {
						   console.error(e);
						   res.json(401,{error: "Server Error"});
					 }
					  
			}
   
 router.post('/TenantList',reports.ViewReport);
 router.post('/TenantUnpaid',reports.TenantUnpaidReport);
  router.post('/TenantOverpaid',reports.TenantOverPaidReport);
 router.post('/Tenantpaid',reports.TenantpaidReport);
  router.post('/OccupiedHouses',reports.OccupiedHouses);
  router.post('/VacantHouses',reports.VacantHouses);
  router.post('/TransactionReport',reports.TransactionReport);
router.post('/AllHouses',reports.AllHouses);

module.exports = router;