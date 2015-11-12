var moment = require("moment");
var DatabaseConn = require('../../Database/Database');
var JobProducer = require('../producer');

exports.sendReminder = function(agenda) {
 
  agenda.define('process', function(job, done) {
	    var now = moment(new Date());
		 var date = parseInt(now.format("D"));
		 console.log(date);

         
			DatabaseConn.ChekJobs(date,function(err,data){
                if (data) {
					 JobProducer.RunInternalJobProcess(data);
					  done();
					}
				else{
					 console.log("No job for this Day"); 
					 done();
					}
		          });
		  
	    
     });
}



