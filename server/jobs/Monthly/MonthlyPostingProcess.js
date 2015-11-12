 var MongoClient = require('mongodb').MongoClient,
      db,Databal;
   var async =require('async');
   var documents = [];
  


   MongoClient.connect("mongodb://localhost:27017/RentalDB", function(err, database) {
		  if(err) throw err;
			    db=database;
				 console.log("DB started Waiting for jobs..");
								
           });

 //instead of connecting to db here pull it from other


exports.ProccessRequest=function(plotname,month,fn){
	var trxdate=new Date().toISOString();
    db.collection('House', function(err, collection) {
	  cursor  =collection.find({$and:[{"plot.Plotname":plotname},{"status":"rented"}]},{amount:1,tenantid:1,_id:0,number:1});
       cursor.toArray(function (err,items){
		    Databal=items;
			console.log("Items Length " + items.length);
			BalanceUpdate(plotname,month,trxdate, function (err,status){
				if (status)	{
					ProcessTransaction(function (err,status){
						if (err){db.close();fn(err,null);}
						else{
                            RentPosted(plotname,month);
							
							fn(null,'ok');
							};
					});
					
					}
		        else{ db.close(); fn(null,null);}  
			   });
	   });
       
    });
};


var BalanceUpdate= function (plotname,month,trxdate,fn){
async.each(Databal,
  function(item, callback){
   db.collection('user', function(err, collection) {
		collection.update({"_id" : item.tenantid},{$inc:{balance:item.amount}},{safe:true}, function(err, tenant) {
		     if(err){callback('error');}
		      else{
				  addtoDocument(item,plotname,month,trxdate);
				  callback();
				  }
		     });
	   });
  },

  function(err){
	console.log(" Done posting Balance...");
    if (err) {fn(err,null) ;}
	fn(null,'ok')
  } 
);

};

function addtoDocument(item,plotname,month,trxdate){
  var doc={};
               doc.receiptno=plotname+"_"+month
			   doc.transactiontype="Posting";
			   doc.transactiondate=trxdate;
			   doc.posteddate=trxdate;
               doc.tranAmount=item.amount;
			   doc.tenantid=item.tenantid;
			   doc.housenumber=item.number;
               doc.Description="Rent for " +month
               documents.push(doc);

}


 function ProcessTransaction(callback){
   var mydocuments = db.collection('Transaction');
        mydocuments.insert(documents, function(err, result) {
                     if (err){
						 callback(err,null);
					 }
					 else{
						 
						 console.log("Transaction Done .");	
						 callback(null,'ok');
						  };
           });
		  
    }

function RentPosted(plot,month){
 db.collection('MonthlyPosting', function(err, collection) {
  collection.insert({"plotname":plot,"Month":month}, function(err, item) {
     if(err){console.log("Error Inserting doc for Monthly posting" + err);}
	 else {
		 console.log("Rent Posted and Record Updated..");
	    db.close(); 
	 };
      });
   }); 
};


 


