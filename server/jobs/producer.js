var kue = require('kue')
 , jobs = kue.createQueue() ;
  var async =require('async');
var DatabaseConn = require('../Database/Database');

function newJob (job){
 job = job || 'Unknown job';
 var job = jobs.create(job.name, {
   title:job.title,
   name: job.name,
   plotname:job.plotname,
   month:job.month
 });
job
   .on('complete', function (){
     console.log('Job', job.id, 'with name', job.data.name, 'is    done');
   })
   .on('failed', function (){
     console.log('Job', job.id, 'with name', job.data.name, 'has  failed');
   });
 job.save();
}



exports.processJob=function(req,res){
    
	 DatabaseConn.CheckIfMonthPosted(req.body.plotName,req.body.Month,function(status,det){
	               if (det) {
					    res.json(500,{error: "Month Already Posted"});
	               }
				   else{
                         var job={};
						job.name='Monthly Posting Process';
						job.plotname=req.body.plotName;
						job.title='Monthly Posting For '+req.body.plotName;
						job.month=req.body.Month;
						newJob(job);
						 res.json(200,{Status: "Job Submitted"});
				   }
	               });
            
 
 
};


exports.RunInternalJobProcess=function(data){
	 var job={};
	async.each(data, function(item, callback){
		  job.name=item.ProcessName;
          job.plotname=item.ProcessDetails.plotname;
          job.title=item.ProcessDetails.title;
		  job.month=item.ProcessDetails.month;
          newJob(job);
		   callback();
			});
};


