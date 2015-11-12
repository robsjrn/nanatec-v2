var express = require('express'),
 router = express.Router(),
  twilio = require('twilio'),

 DatabaseConn = require('../../database/Database');
var client = new twilio.RestClient('AC5dabe402352ad3b7eadad650dccd3c8c', '4ffa6f3ff6fb7f461996e4a992e24b93');

  
 router.get('/test', function(req, res){
	 res.send("Sms Server Up and Running..");
	 ;});



 router.get('/getMsg', function(req, res){
  client.sms.messages("").get(function(err, sms) {
	if (sms){res.send(sms);	}
	  else{res.send("oooppps");	}
 });
});

 router.get('/getUsage', function(req, res){
  client.sms.messages("").get(function(err, sms) {
	if (sms){res.send(sms);	}
	  else{res.send("oooppps");	}
 });
});



router.post('/inboundVoice', function(request, response) {
  

       var resp = new twilio.TwimlResponse();
    resp.say({voice:'woman'}, 'Welcome to Nana !');
    resp.gather({ timeout:30 }, function() {
 
         this.say('For balance inquiry, press 1. For support, press 2.');
 
    });
	 response.writeHead(200, {
        'Content-Type':'text/xml'
    });
    response.end(resp.toString());

});

router.post('/inboundSMS', function(request, response) {
	var body = request.param('Body').trim();
   console.log("got sms  a request from "+request.param('From'));
   DatabaseConn.findPhoneNumber(request.param('From'),function(err,status){
		if (status){

			if (status.role=="tenant")
			{
				 console.log("balance is  "+status.balance);
		          var msg="<Response><Sms>Hello "+status.names+" Your House Balance is "+ status.balance +"</Sms></Response>";
                 response.send(msg); 
			}
			else{
			     var msg="<Response><Sms>Hello "+status.names+" Your Expected Monthly Income is "+ status.expcMonthlyIncome+"</Sms></Response>";
                 response.send(msg); 
			}
		  
		}
		else{
            var msg="<Response><Sms>Sorry You Are not Registered</Sms></Response>"
           response.send(msg);
		}
		 
	});
   
});



module.exports = router;