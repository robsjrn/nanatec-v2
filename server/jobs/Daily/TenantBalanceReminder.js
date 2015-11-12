 var MongoClient = require('mongodb').MongoClient,
      db,data;
   var async =require('async'),
       documents = [];
   var SMS = require('../../Sms/Sendsms'),
      DB=require('../../Database/Database');


 MongoClient.connect("mongodb://localhost:27017/RentalDB", function(err, database) {
		  if(err) throw err;
			    db=database;
				 console.log("DB started Waiting for jobs..");
								
           });



exports.MailProcess=function(plotname,fn){
    
    db.collection('user', function(err, collection) {
	  cursor  =collection.find({$and:[{"plot.Plotname":plotname},{"hsestatus":1},{"balance": { $gt: 0 }} ]},{balance:1,contact:1,_id:0,names:1,housename:1});
       cursor.toArray(function (err,items){
		    data=items;
			SendEmail(function (err,status){
				if (status)	{
					db.close(); fn(null,'ok');
					}
		        else{ db.close(); fn(null,null);
				}  
	           });
	       });
	   });
};

var SendEmail= function (fn){
async.each(data,
  function(item, callback){
   //send mail here

  SMS.BalanceNotificationSMS(item.names,item.contact,item.housename,item.balance,function(msg){
	DB.SaveMsg(msg) ;
	callback();
  });
  
  },

  function(err){
	console.log(" Done Sending Mail.");
    if (err) {fn(err,null) ;}
	fn(null,'ok')
  } 
);

};