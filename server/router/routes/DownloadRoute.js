var express = require('express');
var router = express.Router();
var jwt = require('jwt-simple');
var DatabaseConn = require('../../database/Database');
var tokenSecret='1234567890QWERTY';
 var downloadDir= './Client/Downloads/';

router.get('/pdf/:fname',function(req,res){
	console.log("Downloading ..");
  var filename =req.params.fname+'.pdf';
	res.download(downloadDir+filename);
});


module.exports = router;