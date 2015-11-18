var config=require('../config/Config.js')
, mail=require('../email/mail.js')
, sms=require('../sms/Sendsms.js')
, fs = require('fs')
, util     = require('util')
, path     = require('path')
, async =require('async')
, bcrypt = require('bcryptjs')
, jwt = require('jwt-simple')
, tokenSecret=config.tokenSecret
, MongoClient = require('mongodb').MongoClient
, ObjectID = require('mongodb').ObjectID
 ,logger = require("../logging/logger");
var db;
var S = require('string');

MongoClient.connect(config.DatabaseUrl, function(err, database) {
  if(err) throw err;
  
  db=database;
  
  
	 db.collection('counters',{strict:true}, function(err, collection) {
      if (err) { 
		   console.error('counters Collection Does not Exists: %s', err);
		   configureCounters();
	   }
	   });
      

          db.collection('property').ensureIndex({loc: "2d"}, { w:1}, function(err, result) {
           if(err) { console.dir(err);}
          });
		  db.collection('units').ensureIndex({"plot.loc": "2d"}, { w:1}, function(err, result) {
           if(err) { console.dir(err);}
		  });
        
	   db.collection('Configuration',{strict:true}, function(err, collection) {
	   if (err) { 
		   console.error('Configuration Collection Does not Exists: %s', err);
		   configureDB();
		   }
	   else{
		   console.log("Everything Configured DB up..."); 
		       }

		  });

});

function DbError(res){
	
	res.status(404).json({error: "database Error"}) ;
}

function Success(res){
    res.status(200).json({success: "Succesfull"});
}



exports.getCredentials=function(userid,pwd,fn){	
 db.collection('user', function(err, collection) { 
     collection.findOne({$and: [ {"_id":userid},{"AccessStatus" : 1}]},{_id:1,password:1,Landlordid:1,userrole:1,Homepage:1,allowedPath:1,names:1,ownerid:1},function(err, item) {
	   if(item){
		 bcrypt.compare(pwd, item.password, function(err, res) {
              if (res) { return fn(null,item); }
			  else{
			  	
			  	return fn(null,item);}
         });  	   
	   }else{return fn(null,item);}
});
	  
 
});		
};



/* plot stuff */

 var addLandlordPlots=function (uid,plot ,callback){
	var propertydet={"Plotname":plot.Plotname,"loc":plot.loc};
    db.collection('user', function(err, collection) {
     collection.update({"_id":uid},{$addToSet:{plots : propertydet},  $inc:{noplots:1}},{safe:true}, function(err, item) {
        if (item) {
			InsertMonthlyPosting(plot.Plotname);
			callback(null,true); 
			}
		else{callback(err,null)}
		 
      }); 
    });
  }

   var removeLandlordPlots=function (uid,plotname ,callback){
	var propertydet={"Plotname":plotname};
    db.collection('user', function(err, collection) {
     collection.update({"_id":uid},{$pull:{plots : propertydet},  $inc:{noplots:-1}},{safe:true}, function(err, item) {
        if (item) {
			callback(null,true); 
			}
		else{callback(err,null)}
		 
      }); 
    });
  }


exports.AddProperty = function(req, res) {
  db.collection('property', function(err, collection) {
  collection.insert(req.body, function(err, item) {
      if (err) {
      	DbError(res) ;
      	console.log(err);
      }
     else{  addLandlordPlots(req.user._id,req.body,function(err,success){
		         if (success){Success(res);}
		         else{DbError(res) ;
		         console.log(err);}      	
                });
	       }
        });
      });
};




exports.Getplot = function(req, res) {
   db.collection('property', function(err, collection) {
    collection.findOne({"Plotname":req.params.plotname},function(err, item){
  if(item){ res.status(200).json({exist: true});}
  else { res.status(200).json({exist: false}) };
  if (err) {DbError(res);}
    });
   });
};


exports.GetAllProperty = function(req, res) {

   db.collection('property', function(err, collection) {
    collection.find({"ownerid":req.body.ownerid}).toArray(function(err, item){
  if(item){ res.status(200).json({'properties': item});}
  if (err) {DbError(res);}
    });
   });
};



exports.Updateproperty = function(req, res) {
            console.log(req.body);
     var id =req.body._id;
            delete req.body["_id"];

   db.collection('property', function(err, collection) {
    collection.update({"_id":ObjectID(id)},{$set:req.body},{safe:true}, function(err, item) {
     if(err){
     	  console.log(err)
		  res.status(501).json({error: "Database Error"})
			  //impliment to delete landlord array
		 }
	  else{  res.status(200).json({success: "Succesfull"})}
      });
   });


};


//Guyz who have not signed in
exports.RegisterProperty = function(req, res) {
	var data={};
	
	data=JSON.parse(req.body.property);
    data.propertyimg='/uploads/property/'+req.files.file.name;
    db.collection('property', function(err, collection) {
  collection.insert(data, function(err, item) {
      if (err) {
			  DbError(res) ;}
      else {Success(res);}
        });
   });
};


exports.Deleteproperty = function(req, res) {
  db.collection('property', function(err, collection) {
    collection.remove({"Plotname" : req.params.plotname}, function(err, item) {
     if(err){
		  res.status(501).json({status: "Database Error"});
		 }
	  else{  
		  removeLandlordPlots(req.user._id,req.params.plotname,function(err,success){
		         if (success){res.status(200).json({status: "Record Deleted"});}
		         else{res.status(501).json({status: "Database Error"}) ;}      	
                });
		  
	     }
      });
   });


};

exports.listproperty = function(req, res) {
   db.collection('properties', function(err, collection) {
     collection.find({"Owner.landlordid":req.user.landlordid},{_id:0}).toArray(function(err, item){
  if(item){ res.status(200).json(item);}
  else { res.status(404).json({exist: false}) };
  if (err) {DbError(res);}
    });
   });
};

exports.listAllproperty = function(req, res) {
   db.collection('properties', function(err, collection) {
     collection.find({"occupationStatus" : "vacant"},{_id:0}).toArray(function(err, item){
  if(item){ res.status(200).json(item);}
  else { res.status(404).json({exist: false}) };
  if (err) {DbError(res);}
    });
   });
};


exports.ListBookings = function(req, res) {
   db.collection('sales', function(err, collection) {
     collection.find({$and: [ {"Owner.landlordid":req.user.landlordid},{"stage" : "booking"}]},{_id:0}).toArray(function(err, item){
  if(item){ res.status(200).json(item);}
  else { res.status(404).json({exist: false}) };
  if (err) {DbError(res);}
    });
   });
};


	exports.updatebooking= function(req, res) {
		db.collection('sales', function(err, collection) {
		collection.update({$and: [ {"Owner.landlordid":req.user.landlordid},{"client.id" : req.body.clientid}]},{$set:{"stage":"reservation"}}, function(err, item) {
		   if (err) {console.log(err);DbError(res) ;}
			else{res.status(200).json({update:"success"});}	
			});
		});
	};




exports.Listreservation = function(req, res) {
   db.collection('sales', function(err, collection) {
     collection.find({$and: [ {"Owner.landlordid":req.user.landlordid},{"stage" : "reservation"}]},{_id:0}).toArray(function(err, item){
  if(item){ res.status(200).json(item);}
  else { res.status(404).json({exist: false}) };
  if (err) {DbError(res);}
    });
   });
};

	exports.updatereservation= function(req, res) {
		db.collection('sales', function(err, collection) {
		collection.update({$and: [ {"Owner.landlordid":req.user.landlordid},{"client.id" : req.body.clientid}]},{$set:{"stage":"deposit","Reservationchecklist":req.body.checklist}}, function(err, item) {
		   if (err) {console.log(err);DbError(res) ;}
			else{res.status(200).json({update:"success"});}	
			});
		});
	};






exports.PropertyBooking = function(req, res) {
 db.collection('sales', function(err, collection) {
  collection.insert(req.body, function(err, item) {
      if (err) {
      	console.log(err);
			  DbError(res) ;}
      else {Success(res);}
        });
   });
};


               

exports.GetplotDetails = function(req, res) {
   db.collection('property', function(err, collection) {
    collection.findOne({"Plotname":req.params.plotname},{_id:0},function(err, item){
  if(item){ res.status(200).json(item);}
  else { res.status(404).json({exist: false}) };
  if (err) {DbError(res);}
    });
   });
};


/*End of  plot stuff */



/* Unit Stuff Begin */


var updatenohse=function (landlordid,no,Amount ,callback){
   db.collection('user', function(err, collection) {
    collection.update({"_id" : landlordid},{ $inc:{expcMonthlyIncome:Amount,nohse:no}},{safe:true}, function(err, item) {
     if(err){console.log(err);return callback(false,err);}
	  else{ return callback(true,null);}
      });
   });
};

exports.CheckHseExists = function(req, res) {
   db.collection('units', function(err, collection) {
  collection.findOne({$and: [ {"number":req.query.hsename},{"plot.Plotname" : req.query.plotname}]},{_id:0},function(err, item){
  if(item){ res.status(200).json({exist: true,data:item});  }
   else { res.status(200).json({exist: false}); };
    });
   });
};




exports.PropertyUnits = function(req, res) {
 db.collection('units', function(err, collection) {
     collection.find({"propertyid":req.params.propertyid}).toArray(function(err, item) {
	   if(item){
	  // 	console.log(item);
	   	res.status(200).json({'units':item});

	   }else{DbError(res) ;}
});
});
};


	exports.createunit = function(req, res) {
	db.collection('units', function(err, collection) {
	collection.insert(req.body, function(err, item) {
	   if (err) {DbError(res) ;}
	   else{updatenohse(req.user.ownerid,1,req.body.amount,function(ok,status)
		   {if (ok){
		      res.status(200).json({success: "Succesfull"});
	       }	
	   });}

	});
	});
	};

exports.Updatehse= function(req, res) {
db.collection('units', function(err, collection) {
collection.update({$and: [ {"number":req.body.number},{"plot.Plotname" : req.body.plot.Plotname}]},{$set:req.body}, function(err, item) {
   if (err) {console.log(err);DbError(res) ;}
   else{updatenohse(req.user._id,-1,-req.body.amount,function(ok,status)
	   {if (ok){
	      res.status(200).json({success: "Succesfull"});
       }else{DbError(res) ;}	
   });}

});
});
};



exports.GetLandlordUnits = function(req, res) {
 db.collection('units', function(err, collection) {
     collection.find({"landlordid":req.user._id},{_id:0}).toArray(function(err, item) {
	   if(item){res.status(200).json(item);;
	   }else{DbError(res) ;}
});
});
};


 exports.deleteHse = function(req, res) {
  db.collection('units', function(err, collection) {
   collection.remove({$and:[{"landlordid":req.user._id},{"number" : req.params.hsename}]}, function(err, item) {
   if (err) {DbError(res) ;}
   else{updatenohse(req.user._id,-1,-req.body.amount,function(ok,status)
	   {if (ok){
	      res.status(200).json({success: "Succesfull"});
        }else{DbError(res) ;}	
   });}

});
});
};





/* End of  House Stuff Begin */


/* Tenant Stuff */

		exports.CheckTenantid=function(req, res) {
		 db.collection('user', function(err, collection) {
		  collection.findOne({$and:[{"_id":req.params.idnumber},{"role" : "tenant"}]},{password:0},function(err, item){
		  if(item){ res.json(200,{exist: true,data:item}); }
		   else { res.json(200,{exist: false}); };
		  if (err) {DbError(res);}
		});
		});
		};


		     exports.checkTenantContact=function(req, res) {
				 db.collection('user', function(err, collection) {
				  collection.findOne({$and:[{"contact":req.params.contactnumber},{"role" : "tenant"}]},{password:0},function(err, item){
				  if(item){ res.json(200,{exist: true,data:item}); }
				   else { res.json(200,{exist: false}); };
				  if (err) {DbError(res);}
				});
				});
				};


 


				exports.CreateTenant = function(req, res) {

				req.body.contact="+254"+req.body.contact;
				req.body.userrole=config.Tenant.userrole;
				req.body.Homepage=config.Tenant.Homepage;
				req.body.allowedPath=config.Tenant.allowedPath;
				req.body.usercategory=config.Tenant.usercategory;
				 bcrypt.hash(req.body._id, 10, function(err, hash) {
					req.body.password=hash;

						db.collection('user', function(err, collection) {
						collection.insert(req.body, function(err, item) {
						   if (err) {		 
							   DbError(res) ;
							   }
						   else{	   
							   Success(res) ;
							   }
							});
							});

				 });

				};

               exports.Tenantlookup = function(req, res) {

               var querry ;
			       

					if (req.query.searchid==1)	{ querry={"_id":req.query.lookup};}
					if (req.query.searchid==2)	{ querry={"housename":req.query.lookup};}
					if (req.query.searchid==3)	{ querry={"contact":"+254"+ S(req.query.lookup).right(9).s};}
					if (req.query.searchid==4)	{ querry={"email":req.query.lookup};}
						db.collection('user', function(err, collection) {
						 collection.findOne({ $and:[querry,{"Landlordid":req.user._id},{"role" :"tenant"}]},{_id:0} , function(err, item){
						  if(item){res.status(200).json({exist:true,data:item});}
						  else(res.status(200).json({exist:false}))
						  if (err) {DbError(res) ;}

						});
						});
                  
                 };

    
	exports.updateTenant= function(req, res) {
		db.collection('user', function(err, collection) {
		collection.update({$and: [ {"Landlordid":req.user._id},{"_id" : req.body.tid}]},{$set:req.body}, function(err, item) {
		   if (err) {console.log(err);DbError(res) ;}
			else{res.status(200).json({update:"success"});}	
			});
		});
	};




		exports.TenantList = function(req, res) {

		 db.collection('user', function(err, collection) {
		 collection.find({$and: [ {"propertymanagerid":req.user._id},{"userrole.role" : "tenant"}]}).toArray( function(err, item){
		  if(item){res.status(200).json({'tenants':item});}
		  if (err) {DbError(res) ;}

		});
		});
		};






		exports.deleteTenant = function(req, res) {
		  db.collection('user', function(err, collection) {
		   collection.remove({$and:[{"propertymanagerid":req.user._id},{"_id" : req.params.tenantid}]}, function(err, item) {
		   if (err) {DbError(res) ;}
		   else{ res.status(200).json({success: "Succesfull"}) ;}	
		   });
		});
		};

/* end of tenant */



/* Property Registration Stuff */

		exports.CreateAccount = function(req, res) {
       
		   req.body.contacts="+254"+req.body.contacts;
		   req.body._id=req.body.username;
		   var pw=req.body.password;

		      if (req.body.Registrationtype=="PL"){
				  req.body.allowedPath=config.PL.allowedPath;
		          req.body.Homepage=config.PL.Homepage;
				  req.body.userrole=config.PL.userrole;
				  req.body.usercategory=config.PL.usercategory;
				  }
              if (req.body.Registrationtype=="PM")
              {
				   req.body.allowedPath=config.PM.allowedPath;
		           req.body.Homepage=config.PM.Homepage;
				   req.body.userrole=config.PM.userrole;
				   req.body.usercategory=config.PM.usercategory;
              }
		   
		   bcrypt.hash(req.body.password, 10, function(err, hash) {
			req.body.password=hash;
			db.collection('user', function(err, collection) {
			collection.insert(req.body,{safe:true}, function(err, item) {
		   if (err) {
			   DbError(res);}
		   else{	
					   /*
					   sms.LandlordWelcomeSMS(req.body,function(message){
						   SaveMessage(message);
						});*/
                        var user={};
                           user.email=req.body.email;
                           user.password=pw;
                           user.name=req.body.names;
                           user.id=req.body.username;
                           user.role= req.body.role;
						mail.sendWelcomeMail(user);


				 Success(res);   
			   }	
		   });
		  }); 
		}); 
		};


		exports.checkuser=function(req, res) {		
			 db.collection('user', function(err, collection) {
			  collection.findOne({"_id":req.params.userid},function(err, item){
			  if(item){ res.json(200,{exist: true}); }
			   else { res.json(404,{exist: false}); };
			  if (err) {DbError(res);}
			});
			});
			};





		exports.CreatePropertyMaster = function(req, res) {
		db.collection('propertyMaster', function(err, collection) {
		collection.insert(req.body, function(err, item) {
		   if (err) {DbError(res) ;}
		   else{
			      res.status(200).json({success: "Succesfull"});   	
		   }
		});
		});
		};
/*
       	exports.createunit = function(req, res) {
		db.collection('properties', function(err, collection) {
		collection.insert(req.body, function(err, item) {
		   if (err) {DbError(res) ;}
		   else{
			      res.status(200).json({success: "Succesfull"});   	
		   }
		});
		});
		};

	*/	

    
	exports.updatepropertyMaster= function(req, res) {
		db.collection('propertyMaster', function(err, collection) {
		collection.update({$and: [ {"Landlordid":req.user._id},{"_id" : req.body.tid}]},{$set:req.body}, function(err, item) {
		   if (err) {console.log(err);DbError(res) ;}
			else{res.status(200).json({update:"success"});}	
			});
		});
	};



		exports.deletePropertyMaster = function(req, res) {
		  db.collection('propertyMaster', function(err, collection) {
		   collection.remove({$and:[{"Landlordid":req.user._id},{"_id" : req.params._id}]}, function(err, item) {
		   if (err) {DbError(res) ;}
		   else{ res.status(200).json({success: "Succesfull"}) ;}	
		   });
		});
		};

    exports.getPropertyMaster = function(req, res) {
      console.log(req.user._id);
		 db.collection('propertyMaster', function(err, collection) {
		 collection.find({"landlordid":req.user._id}).toArray( function(err, item){
		  if(item){res.send(item);}
		  if (err) {DbError(res) ;}

		});
		});
		};

    exports.propertyPortfolio = function(req, res) {
		 db.collection('propertyMaster', function(err, collection) {
		 collection.find({"landlordid":req.user.landlordid}).toArray( function(err, item){
		  if(item){res.send(item);}
		  if (err) {DbError(res) ;}

		});
		});
		};





/* End of Property Registration */



/* property User Details  */


	exports.CreateproperytUser = function(req, res) {
	 bcrypt.hash(req.body.password, 10, function(err, hash) {
	   req.body.password=hash;	
		db.collection('user', function(err, collection) {
		collection.insert(req.body, function(err, item) {
		   if (err) {DbError(res) ;}
		   else{
			      res.status(200).json({success: "Succesfull"});   	
		   }
		});
		});
		});
		};

    
	exports.updateproperytUser= function(req, res) {
		db.collection('user', function(err, collection) {
		collection.update({$and: [ {"landlordid":req.user._id},{"_id" : req.body.id}]},{$set:req.body}, function(err, item) {
		   if (err) {console.log(err);DbError(res) ;}
			else{res.status(200).json({update:"success"});}	
			});
		});
	};


		exports.deleteproperytUser = function(req, res) {
		  db.collection('user', function(err, collection) {
		   collection.remove({$and:[{"landlordid":req.user._id},{"_id" : req.params._id}]}, function(err, item) {
		   if (err) {DbError(res) ;}
		   else{ res.status(200).json({success: "Succesfull"}) ;}	
		   });
		});
		};

    exports.getproperytUser = function(req, res) {
		 db.collection('user', function(err, collection) {
		 collection.find({"landlordid":req.user._id}).toArray( function(err, item){
		  if(item){res.send(item);}
		  if (err) {DbError(res) ;}

		});
		});
		};

		    exports.getunassignedproperytUser = function(req, res) {
				 db.collection('user', function(err, collection) {
				 collection.find({$and:[{"landlordid":req.user._id},{"assignedStatus" : 0}]}).toArray( function(err, item){
				  if(item){res.send(item);}
				  if (err) {DbError(res) ;}

				});
				});
				};

		


/* end of Property User */



exports.listoftenant = function(req, res) {

 db.collection('user', function(err, collection) {
 collection.find({"plot.Plotname":req.params.plot}).toArray( function(err, item){
  if(item){res.send(item);}
  if (err) {DbError(res) ;}

});
});
};

exports.tenantDataID = function(req, res) {

 db.collection('user', function(err, collection) {
     collection.findOne({$and:[{"_id":req.body.tenantid},{"hsestatus" : 1},{"Landlordid":req.user._id}]},{names:1,_id:1,housename:1,plot:1,balance:1,contact:1},function(err, item) {
	   if(item){res.send(item);
	   }else{DbError(res) ;}
});
});
};


exports.tenantDataHseName = function(req, res) {

 db.collection('user', function(err, collection) {
     collection.findOne({$and:[{"housename":req.body.housename},{"hsestatus" : 1},{"Landlordid":req.user._id}]},{names:1,_id:1,housename:1,plot:1,balance:1,contact:1},function(err, item) {
	   if(item){res.send(item);
	   }else{DbError(res);}
});
});
};

exports.GeneralSearch = function(req, res) {
	var querry ;
	if (req.body.id==1)	{ querry={"_id":req.body.detail};}
	if (req.body.id==2)	{ querry={"housename":req.body.detail};}
	if (req.body.id==3)	{ querry={"contact":"+254"+ S(req.body.detail).right(9).s};}
	if (req.body.id==4)	{ querry={"email":req.body.detail};}
 db.collection('user', function(err, collection) {
     collection.findOne({$and:[querry,{"hsestatus" : 1},{"Landlordid":req.user.Landlordid}]},{names:1,_id:1,housename:1,plot:1,balance:1,contact:1},function(err, item) {
	   if(item){res.send(item);
	   }else{
		   console.log(err);
		   DbError(res) ;
		   }
});
});
};

exports.statement = function(req, res) {
	var querry ;
	if (req.body.id==1)	{ querry={"tenantid":req.body.detail};}
	if (req.body.id==2)	{ querry={"housenumber":req.body.detail};}
	if (req.body.id==3)	{ querry={"contact":"+254"+ S(req.body.detail).right(9).s};}


 db.collection('Transaction', function(err, collection) {
      collection.find({$and:[querry,{"Landlordid":req.user.Landlordid}]}).toArray( function(err, item) {
	   if(item){
		   res.send(item);
	   }else{
		   DbError(res) ;
		   }
});
});
};



exports.listofHouse = function(req, res) {
 db.collection('House', function(err, collection) {
 collection.find({"plot.Plotname":req.params.plot}).toArray( function(err, item){
  if(item){res.send(item);}
  if (err) {DbError(res) ;}

});
});
};



exports.listofUnbookedtenant = function(req, res) {
	
 db.collection('user', function(err, collection) {
 collection.find({$and: [{"Landlordid":req.user.landlordid}, {"role":"tenant"},{"hsestatus" : 0}]}).toArray( function(err, item){
  if(item){res.send(item);}
  if (err) {DbError(res) ;}

});
});
};



exports.listofVacantHouse = function(req, res) {
 db.collection('properties', function(err, collection) {
 collection.find({$and: [{"Owner.landlordid":req.user.landlordid},{"occupationStatus":"vacant"}]}).toArray( function(err, item){
  if(item){res.send(item);}
  if (err) {DbError(res) ;}

});
});
};

exports.listtenant = function(req, res) {
	
 db.collection('user', function(err, collection) {
 collection.find({$and: [{"Landlordid":req.user.landlordid}, {"role":"tenant"}]}).toArray( function(err, item){
  if(item){res.send(item);}
  if (err) {DbError(res) ;}

});
});
};





exports.OccupiedTenantList = function(req, res) {
 db.collection('user', function(err, collection) {
 collection.find({$and: [{"Landlordid":req.user.landlordid}, {"hsestatus":1}]}).toArray( function(err, item){
  if(item){res.send(item);}
  if (err) {DbError(res) ;}

});
});
};

exports.ViewMessages = function(req, res) {
 db.collection('Messages', function(err, collection) {
 collection.find({"Details.from":"+17746332190"},{"Details.to":1,"Details.date_created":1,"Details.body":1}).toArray( function(err, item){
  if(item){
	  res.send(item);
	  }
  if (err) {DbError(res) ;}

});
});
};






exports.checkin = function(req, res) {
var update=req.body.update;
var houseupdate=update.houseUpdate;
var tenantupdate= update.tenantupdate;
var Trxn =update.Trxn;
var details= update.details;

console.log(update);

 updateHouse(req,houseupdate,details.number,houseupdate.property,function(ok,status){ 
	   if(ok){ updateTenant (tenantupdate,details._id,function(ok,status)
		       { if(ok){ CreateTrxn(Trxn,function(ok,status){
                 if(ok){ Success(res); }
				  });
	            }	           
			   });
	         }
   });

};


var updateHouse=function (req,housedetails ,hsenumber,plotname,callback){
   db.collection('properties', function(err, collection) {
 
   	var prop={};

   	   prop.occupationStatus="rented";
   	   prop.tenantid=housedetails.tenantid;
   	   prop.dateOccupied=housedetails.dateOccupied;
   
    collection.update({"property.Unitid":hsenumber},{$set:prop},{safe:true}, function(err, item) {
     if(err){
		 
		 return callback(false,err);
		 }
	  else{ return callback(true,null);}
      });
   });
};

var updateTenant=function (tenantdetails,tenantid ,callback){

   db.collection('user', function(err, collection) {
    collection.update({"_id" : tenantid},{$set:tenantdetails},{safe:true}, function(err, item) {
     if(err){return callback(false,err);}
	  else{ return callback(true,null);}
      });
   });
};


var updateAccessStatus=function (userid ,callback){
   db.collection('user', function(err, collection) {
    collection.update({"_id" : userid},{$set:{"AccessStatus" : 1}},{safe:true}, function(err, item) {
     if(err){return callback(false,err);}
	  else{ return callback(true,null);}
      });
   });
};


var CreateTrxn=function (Trxn,callback){
db.collection('Transaction', function(err, collection) {
collection.insert(Trxn, function(err, item) {
     if(err){return callback(false,err);}
	  else{ return callback(true,null);}
      });
   }); 
};

var postCharges=function(data,callback){
   postTran(data,function(ok,status) {
	    if (ok) {
			// proceed now to post normal transaction
            callback("ok",null);
		     }
		else{
			//error occured
			callback(null,null);
		   }
	});
	    
}

exports.BatchRentalPayment=function(req, res) {
sendSMS(req.body, TransactionPosting, function (err) {
    res.status(200).json({Status: "Ok"});
});

};

exports.LandlordSendSms=function(req, res) {
  sms.sendSMS(req.body.phonenumber,req.body.message,function(message){
	 SaveMessage(message);   
     });
  res.status(200).json({Status: "Ok"});

};

var sendSMS =function(phoneNumber,msg,fn){
  sms.sendSMS(phoneNumber,msg,function(message){
	  if (message) {fn("ok",null);  }
	  else { SaveMessage(message); fn(null,null);}
  });
}

exports.postTransaction = function(req, res) {
   TransactionPosting(req.body,function(status,err){
       if (status) {   res.status(200).json({Status: "Ok"});}
	   else {DbError(res) };
   });


};


exports.makerpostTransaction = function(req, res) {
db.collection('TransactionStaging', function(err, collection) {
collection.insert(req.body, function(err, item) {
     if(err){DbError(res);}
	  else{ res.status(200).json({Status: "Ok"});}
      });
   }); 

};

exports.makerBatchRentalPayment = function(req, res) {
db.collection('TransactionStaging', function(err, collection) {
collection.insert(req.body, function(err, item) {
     if(err){DbError(res);}
	  else{ res.status(200).json({Status: "Ok"});}
      });
   }); 

};

 var TransactionPosting= function(req,fn){

       if (req.Charges.ApplyCharge)
  {
	 postCharges (req.Charges,function(status,data){
		      if (status)
		      {
				   req.Charges=null; 
				  postTran(req,function(ok,status) {
						if (ok) {		 
							 sms.TenantTransactionSMS(req.names,req.contact,req.tranAmount,req.housenumber,req.balcf,function(message){
								   message.Landlordid=req.Landlordid;
								   SaveMessage(message);
								});  
							fn(ok,null)
							}
						else{fn(null,null) ;}
					});   
		      }
			  else{
				  // charges not posted 

                fn(null,null) ;
			  }
	       }) 
  }
  else{ 
	  req.Charges=null; 
	postTran(req,function(ok,status) {
	    if (ok) {
			
			 
			 sms.TenantTransactionSMS(req.names,req.contact,req.tranAmount,req.housenumber,req.balcf,function(message){
			       message.Landlordid=req.Landlordid;
				   SaveMessage(message);
		        });  
			
			
			fn(true,null) ;
			}
		else{fn(null,null) ;}
	});
  };
 }

var postTran=function(req,callback){

if (req.receiptno==null || typeof req.receiptno =="undefined" )
{  //no receipt so get receipt
	getNextSequenceValue("transactionid",function(err,receiptnumber){
	 if(receiptnumber){
       req.receiptno=receiptnumber;
		db.collection('Transaction', function(err, collection) {
		collection.save(req,{safe:true}, function(err, item) {
		   if (err) {return callback(false,err);}
		   else{
			   updateTenantBal(req.tranAmount,req.tenantid,function(ok,status) {if (ok){return callback(true,null); }	
		   });}
		   });
		   });
	     }
      });
}else{
    console.log("the landlordid "+req.Landlordid);

	db.collection('Transaction', function(err, collection) {
		collection.save(req,{safe:true}, function(err, item) {
		   if (err) {return callback(false,err);}
		   else{
			   updateTenantBal(req.tranAmount,req.tenantid,function(ok,status) {if (ok){return callback(true,null); }	
	 });}
	});
	});

}
 
};

var updateTenantBal=function (tenantbal,tenantid ,callback){
   db.collection('user', function(err, collection) {
    collection.update({"_id" : tenantid},{$inc:{balance:-tenantbal}},{safe:true}, function(err, item) {
     if(err){return callback(false,err);}
	  else{ return callback(true,null);}
      });
   });
};






exports.tenantStatement = function(req, res) {
 db.collection('Transaction', function(err, collection) {
 collection.find({"tenantid":req.user._id}).toArray( function(err, item){
  if(item){res.send(item);}
  if (err) {DbError(res) ;}

});
});
};



exports.tenantDetails = function(req, res) {
    db.collection('user', function(err, collection) {
     collection.findOne({"_id":req.user._id},function(err, item) {
	   if(item){res.send(item);
	   }else{res.send(401);}
});
});

};


exports.vacate = function(req, res) {
var update=req.body.update;
var houseupdate=update.houseUpdate;
var tenantupdate= update.tenantupdate;
var details= update.details;


updateHouseVacate(req,houseupdate,details.number,function(ok,status){ 
	   if(ok){ updateTenant (tenantupdate,details._id,function(ok,status)
		       { if(ok){ res.json(200,{sucess:"successfull" }); }           
			  });
	         }
   });
};


var updateHouseVacate=function (req,housedetails ,hsenumber,callback){
   db.collection('properties', function(err, collection) {
 
   	var prop={};

   	   prop.occupationStatus="vacant";
   	   prop.tenantid=null;
   	   prop.dateVacated=housedetails.dateVacated;
   
    collection.update({"property.Unitid":hsenumber},{$set:prop},{safe:true}, function(err, item) {
     if(err){
		 
		 return callback(false,err);
		 }
	  else{ return callback(true,null);}
      });
   });
};





exports.userDetails = function(req, res) {
    db.collection('user', function(err, collection) {
     collection.findOne({"_id":req.user._id},{password:0,datecreated:0},function(err, item) {
	   if(item){res.send(item);
	   }else{res.send(401);}
});
});

};




exports.Accessrequest = function(req, res) {
	console.log(req.user.landlordid);
 db.collection('user', function(err, collection) {
 collection.find({$and: [{"AccessStatus" : 0}, {"Landlordid":req.user.landlordid},{"role" : "tenant"}]},{names:1,email:1,contact:1,_id:1,housename:1}).toArray( function(err, item){
  if(item){res.send(item);}
  if (err) {DbError(res) ;}

});
});
};



exports.GrantAccess = function(req, res) {
    updateAccessStatus(req.body._id,function(ok,status) {

      if (ok){
               var token = jwt.encode({username: req.body._id}, tokenSecret);
               sms.TenantWelcomeSMS(req.body,config.TenantWelcomeMsg,function(message){
			       SaveMessage(message);
		        });     
		   Success(res);  
	   }	

	});
};


exports.LandLordConfiguration = function(req, res) {
 db.collection('Configuration', function(err, collection) {
 collection.findOne({"_id":"RentalConfiguration"},function(err, item) {
  if(item){res.send(item);}
  if (err) {DbError(res) ;}

});
});
};

exports.HseTypeConfiguration = function(req, res) {
 db.collection('Configuration', function(err, collection) {
 collection.update({"_id":"RentalConfiguration"},{$addToSet:{hsetype : req.body}},{safe:true}, function(err, item) {
   if (err) {DbError(res);}
   else{Success(res);}
});
});
};

exports.PaymentmethodConfiguration = function(req, res) {
 db.collection('Configuration', function(err, collection) {
 collection.update({"_id":"RentalConfiguration"},{$addToSet:{paymentmethod : req.body}},{safe:true}, function(err, item) {
   if (err) {DbError(res);}
   else{Success(res);}
});
});
};


exports.TransactiontypeConfiguration = function(req, res) {
 db.collection('Configuration', function(err, collection) {
 collection.update({"_id":"RentalConfiguration"},{$addToSet:{transactiontype : req.body}},{safe:true}, function(err, item) {
   if (err) {DbError(res);}
   else{Success(res);}
});
});
};


exports.ExpenseTypeConfiguration = function(req, res) {
 db.collection('Configuration', function(err, collection) {
 collection.update({"_id":"RentalConfiguration"},{$addToSet:{expenseType : req.body}},{safe:true}, function(err, item) {
   if (err) {DbError(res);}
   else{Success(res);}
});
});
};


exports.LandlordAddPlots = function(req, res) {
 db.collection('user', function(err, collection) {
 collection.update({"_id":req.user._id},{$addToSet:{plots : req.body},  $inc:{noplots:1}},{safe:true}, function(err, item) {
   if (err) {DbError(res);}
   else{
	   InsertMonthlyPosting(req.body.Plotname);
	   Success(res);}
});
});
};



exports.CreateLandlord = function(req, res) {

   req.body.LandlordDet.contact="+254"+req.body.LandlordDet.contact;
   req.body.LandlordDet.role="landlord";
   bcrypt.hash(req.body.LandlordDet.password, 10, function(err, hash) {
	req.body.LandlordDet.password=hash;
    db.collection('user', function(err, collection) {
    collection.insert(req.body.LandlordDet,{safe:true}, function(err, item) {
   if (err) {
	   DbError(res);}
   else{	
			   sms.LandlordWelcomeSMS(req.body.LandlordDet,function(message){
			       SaveMessage(message);
		        });      
	     Success(res);   
	   }	
   });
  }); 
}); 
};


exports.CreatePropertyOwner = function(req, res) {
   req.body.PropertyDet.contact="+254"+req.body.PropertyDet.contact;
     bcrypt.hash(req.body.PropertyDet.password, 10, function(err, hash) {
	      req.body.PropertyDet.password=hash;
      db.collection('property', function(err, collection) {
    collection.insert(req.body.PropertyDet,{safe:true}, function(err, item) {
   if (err) {DbError(res);}
   else{
	    sms.PropertyWelcomeSMS(req.body.PropertyDet,function(message){
			       SaveMessage(message);
		        }); 
	   Success(res);   
	   }	
   });
  }); 
}); 
};


exports.PropertyOwnerCredentials=function(userid,pwd,fn){	
 db.collection('user', function(err, collection) { 
     collection.findOne({$and: [ {"username":userid},{"AccessStatus" : 1}]},function(err, item) {
	   if(item){
		 bcrypt.compare(pwd, item.password, function(err, res) {
              if (res) { return fn(null,item); }
			  else{return fn(null,null);}
         });  	   
	   }else{return fn(null,null);}
});
	  
 
});		
};


var GrantLandlordAccess=function (CredentialDet ,callback){
   db.collection('Credential', function(err, collection) {
    collection.insert(CredentialDet,{safe:true}, function(err, item) {
     if(err){return callback(false,err);}
	  else{
		  // send welcome sms to landlord
		  getUser(CredentialDet.identifier,function(no,landlord){
                  if (no)
                  {
		               var msg ="Hi "+landlord.names +" Welcome to Nana use Your id as your Username and Password Change after Login.. enjoy "
					   sms.LandlordWelcmeSMS(landlord.contact,msg,function(ok,status){
			           if (ok){console.log("Landlord Welcome sms not sent ..."); }
				         else{console.log("Landlord Welcome sms sent ...");}
		                  });
				  }
				  });
		  return callback(true,null);}
      });
   });
};







exports.UpdateTenantAgreement=function (req, res){
   db.collection('user', function(err, collection) {
    collection.update({"_id" : req.user._id},{$set:{"AgreementStatus" : false}},{safe:true}, function(err, item) {
   if (err) {console.log(err);DbError(res);}
   else{Success(res);}
});
});
};



exports.updateTenantData=function (req, res){
   db.collection('user', function(err, collection) {
    collection.update({"_id" : req.user._id},{$set:{"Details" : req.body.details}}, {}, function(err, item) {
   if (err) {console.log(err);DbError(res);}
   else{Success(res);}
});
});
};



exports.TenantInfo=function(req, res) {

 db.collection('user', function(err, collection) {
  collection.findOne({"_id":req.query.tenant_id},{Details:1,name:1,email:1,contact:1,occupation:1},function(err, item){
  if(item){res.send(item); }
  if (err) {DbError(res);}

});
});
};


exports.CreateMail=function(req, res) {
	console.log("update detials" + req.body.update);
       var update=req.body.update,
	   senderDetails=update.senderDetails,
	    ReceiverDetails =update.ReceiverDetails,
	    ReceiverID =update.ReceiverId;

     UpdateSenderInbox(req.user._id ,senderDetails,function(ok,status){
             if (ok){
				 	 UpdateReceiverInbox(ReceiverID,ReceiverDetails,function(ok,status){
                          if (ok){Success(res)}; 		
						   if(status){DbError(res)};
	                  });		
			 }; 
			 if(status){DbError(res)};		
	      });	 
};




var UpdateReceiverInbox=function (id,ReceiverDet ,callback){
    db.collection('Inbox', function(err, collection) {
     collection.update({"_id" : id},{$addToSet: {"Received":ReceiverDet}}, { upsert: true }, function(err, item) {
     if(err){return callback(false,err);}
	  else{ return callback(true,null);}
      });
   });
};


var UpdateSenderInbox=function (id,SenderDet,callback){
   db.collection('Inbox', function(err, collection) {
    collection.update({"_id" :id},{$addToSet: {"Sent":SenderDet}}, { upsert: true }, function(err, item) {
     if(err){return callback(false,err);}
	  else{return callback(true,null);}
      });
   });
	
};


exports.Viewmail=function(req, res) {
	console.log( req.user._id._id);
 db.collection('Inbox', function(err, collection) {
  collection.findOne({"_id":req.user._id._id}, function(err, item){
  if(item){
	   res.status(200).json(item);
	  }
  else { 

	   res.status(200).json();
	  }

});
});
};







exports.LandlordTenants=function(req, res) {
 db.collection('user', function(err, collection) {
 collection.find({"Landlordid":req.user._id},{names:1,contact:1}).toArray( function(err, item){
  if(item){res.send(item);}
  if (err) {DbError(res);}

});
});
};




exports.CheckPwd= function(req, res) {
    db.collection('user', function(err, collection) {
     collection.findOne({"_id":req.user._id},function(err, item) {
	   if(item){
		        bcrypt.compare(req.body.currentpassword, item.password, function(err, result) {
                       if (result){ res.status(200).json({status: true}) ;}
					   else { res.status(200).json({status: false}) ;}
                    });
		   
	   }else{DbError(res);}
});
});

};


exports.ChangePwd=function(req, res) {
   bcrypt.hash(req.body.newPwd, 10, function(err, hash) {
		db.collection('user', function(err, collection) {
		collection.update({"_id":req.user._id},{$set:{"password" : hash}},{safe:true}, function(err, item) {
		   if (err) {
			   DbError(res);
			   }
		   else{
			   res.status(200).json({status: true}) ;
			   }
		   });
	   });
   });
     

};


    exports.logout = function(req, res) {
         res.send(200);
	};

exports.Findneighbours = function(req, res) {
 // console.log("plot name is ..."+req.query.plot_name);
 db.collection('user', function(err, collection) {
 collection.find({$and: [ {"plot.Plotname":req.query.plot_name},{"hsestatus" : 1}]},{names:1,housename:1,_id:1}).toArray( function(err, item){
   if (err) {
   DbError(res);}
   else{res.send(item);}
});
});
};

exports.photoupload = function(req, res) {

   var tmp_path = req.files.file.path;

    // set where the file should actually exists - in this case it is in the "images" directory
   // var target_path = __dirname +  "/"  + req.files.file.name; 

	  var target_path = './Client/uploads/Tenant/' + req.files.file.name;
	  var dbpath='/uploads/Tenant/'+req.files.file.name;
	

	// console.log("The Target path is "+target_path);
    // move the file from the temporary location to the intended location
    fs.rename(tmp_path, target_path, function(err) {
        if (err) throw err;
        // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
        fs.unlink(tmp_path, function() {
            if (err) throw err;


             //      console.log("Updating Tenant Photo Details for " +req.user.identifier.toString() );
				   db.collection('user', function(err, collection) {
					collection.update({"_id" : req.user._id},{$set:{"Details.imageUrl" : dbpath}}, { upsert: true }, function(err, item) {
				   if (err) {//console.log(err);
				   DbError(res);}
				   else{res.json(200,{imageUrl:dbpath});}
				});
				});

         
        });
    });




};





exports.Landlordphotoupload = function(req, res) {

   var tmp_path = req.files.file.path;

    // set where the file should actually exists - in this case it is in the "images" directory
   // var target_path = __dirname +  "/"  + req.files.file.name; 

	  var target_path = './Client/uploads/Landlord/' + req.files.file.name;
	  var dbpath='/uploads/Landlord/'+req.files.file.name;
	

	//console.log("Image Path " + req.files.file.name);
    // move the file from the temporary location to the intended location
    fs.rename(tmp_path, target_path, function(err) {
        if (err) throw err;
        // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
        fs.unlink(tmp_path, function() {
            if (err) throw err;


              //     console.log("Updating Landlord Photo Details for " +req.user.identifier );
				   db.collection('user', function(err, collection) {
					collection.update({"_id" : req.user._id},{$set:{"Details.imageUrl" : dbpath}}, { upsert: true }, function(err, item) {
				   if (err) {
					   //console.log(err);
				   DbError(res);}
				   else{
					   res.status(200).json({imageUrl:dbpath});
					   }
				});
				});

         
        });
    });




};





exports.TotalUnpaid= function(req, res) {
  db.collection('user', function(err, collection) {
    collection.aggregate([ { $match: { "Landlordid" : req.user.Landlordid ,"balance":{$gte: 0},"hsestatus" : 1 }},{ $group: {_id: "$Landlordid" , total: { $sum: "$balance" } } } ] , function(err, result) {
         if (result){  res.status(200).json({total: result}); }
		 else{ DbError(res);}
	});
});

};

exports.UnverifiedTransactions= function(req, res) {
  db.collection('TransactionStaging', function(err, collection) {
    collection.find({"Landlordid":req.user.Landlordid}).toArray( function(err, item){
  if(item){res.send(item);}
  if (err) {DbError(res);}

});
});
};

exports.PaymentDateAggregation= function(req, res) {
	var d = new Date();
    var month = d.getMonth();
  db.collection('Transaction', function(err, collection) {
    collection.aggregate([ { $match: { "Landlordid" : req.user._id,"Month":month }},
		                   { $group: {_id: "$transactiondate" , total: { $sum: "$tranAmount" } } } 
	                      ] , function(err, result) {
         if (result){  res.status(200).json({total: result}); }
		 else{ DbError(res);}
	});
});

};




exports.TransactionReport= function(plot,start,end,fn) {

 db.collection('Transaction', function(err, collection) {
 collection.find( {$and: [{"plotnumber":plot},{"transactiondate": {$gte:start,$lte:end}}]}).toArray( function(err, item){
  if(item){
	 fn(null,item);}
  if (err) {fn(err,null);}

});
});
};


exports.TenantPaidReport= function(plot,fn) {
db.collection('user', function(err, collection) {
 collection.find({$and: [{"plot.Plotname": plot},{"balance":{$lte: 0}}]},{ sort:{ "housename" :1}}).toArray( function(err, item){
  if(item){
	 fn(null,item);}
  if (err) {fn(err,null);}

});
});
};

exports.TenantOverPaidReport= function(plot,fn) {
db.collection('user', function(err, collection) {
 collection.find({$and: [{"plot.Plotname": plot},{"balance":{$lt: 0}}]},{ sort:{ "housename" :1}}).toArray( function(err, item){
  if(item){
	 fn(null,item);}
  if (err) {fn(err,null);}

});
});
};


exports.TenantUnpaidReport= function(plot,fn) {
  db.collection('user', function(err, collection) {
  collection.find({$and: [{"plot.Plotname": plot},{"hsestatus":1},{"balance":{$gt: 0}}]},{ sort: "housename" }).toArray( function(err, item){
  if(item){
	  //added the sort capability ..
	  fn(null,item.sort(function(a,b){return Number(a.housename) -Number(b.housename)}));
}
  if (err) {fn(err,null);}

});
});
};




exports.TenantListReport= function(plot,fn) {
  db.collection('user', function(err, collection) {
 collection.find({$and: [{"plot.Plotname": plot},{"hsestatus":1}]},{ sort: "housename" }).toArray( function(err, item){
  if(item){
	  fn(null,item);
}
  if (err) {fn(err,null);}

});
});
};


exports.OccupiedHouseReport= function(plot,fn) {
  db.collection('House', function(err, collection) {
 collection.find({$and: [{"plot.Plotname": plot},{"status":"rented"}]},{plot:0,status:0,_id:0},{ sort: "number" }).toArray( function(err, item){
  if(item){
	  fn(null,item);
}
  if (err) {fn(err,null);}

});
});
};

exports.AllHouses= function(plot,fn) {
  db.collection('House', function(err, collection) {
 collection.find({"plot.Plotname": plot},{plot:0,status:0,_id:0},{ sort: "number" }).toArray( function(err, item){
  if(item){
	  fn(null,item);
}
  if (err) {fn(err,null);}

});
});
};



exports.vacantHouseReport= function(plot,fn) {
  db.collection('House', function(err, collection) {
 collection.find({$and: [{"plot.Plotname": plot},{"status":"vacant"}]},{plot:0,status:0,_id:0},{ sort: "number" }).toArray( function(err, item){
  if(item){
	  fn(null,item);
}
  if (err) {fn(err,null);}

});
});
};







exports.MonthlyRentPosting= function(req, res) {
 //to delete
   res.json(200,{Status: "Ok"});
  }; 




function doPosting(req1,callback){

     postTran(req1,function(ok,err)
			      {
				    if(ok){callback(false,null);}
					else{
						console.log("The Error is "+ err);
					callback(true,err);}
	                });
	             
 }

 function SuccessPostNotification(res){
    res.json(200,{Status: "Ok"});
 }

  function ErrorPostNotification(res){
    res.json(501,{Error: "Database Error"});
 }



 function BatchPosting(req,callback1)
 {
  
  //  console.log("Inserting Transaction for " +req.body.tenantid);
    db.collection('Transaction', function(err, collection) {
    collection.insert(req.body,{safe:true}, function(err, item) {
         if (err) {return callback1(true,err);} 
		  else   {callback1(false,null)}
    });
});

 }


 exports.Viewmail2=function(id, res) {
 db.collection('Inbox', function(err, collection) {
  collection.findOne({"_id":100},function(err, item){
  if(item){res.send(item);}
  if (err) {DbError(res);}

});
});
};



exports.ServiceRegistration=function(req, res) {
db.collection('Services', function(err, collection) {
collection.insert(req.body, function(err, item) {
     if(err){DbError(res);}
	  else{ Success(res)}
      });
   }); 
};


exports.NotificationScheduling=function(req, res) {
db.collection('Schedules', function(err, collection) {
collection.insert(req.body, function(err, item) {
     if(err){DbError(res);}
	  else{ Success(res)}
      });
   }); 
};


exports.LandlordCreateUser=function(req, res) {
  bcrypt.hash(req.body.password, 10, function(err, hash) {
	req.body.password=hash;
	  db.collection('user', function(err, collection) {
	   collection.insert(req.body, function(err, item) {
		 if(err){console .log(err);DbError(res);}
		  else{ Success(res)}
		  });
	   }); 
  });
};



exports.addPost=function(req, res) {
db.collection('tenantPosts', function(err, collection) {
collection.insert(req.body, function(err, item) {
     if(err){DbError(res);}
	  else{ Success(res)}
      });
   }); 
};

exports.getPost=function(req, res) {
db.collection('tenantPosts', function(err, collection) {
collection.find().toArray( function(err, item){
     if(err){DbError(res);}
	  else{  res.status(200).json(item);}
      });
   }); 
};



exports.ServiceListing=function(req, res) {
db.collection('Services', function(err, collection) {
 collection.find({$and:[{"location.name":req.body.location.name},{"type.name":req.body.type.name}]}).toArray( function(err, item){
  if(item){
	  //console.log("Querry Data "+ item);
  res.send(item);}
  if (err) {DbError(res);}
    });
  });
};

exports.PropertyRegistration=function(req, res) {
	req.body.Owner=req.user.username;
db.collection('PropertyDetails', function(err, collection) {
  collection.insert(req.body, function(err, item) {
     if(err){DbError(res);}
	  else{ 
         addProperty(req.user.username,req.body.propertyname,function (status,err){
                    if (status){ Success(res);}
					else{DbError(res);}
		     });
		     
		  }
      });
   }); 
};

var addProperty=function(username,propertyname,fn){
 db.collection('property', function(err, collection) {
  collection.update({"username" : username},{$addToSet: {"Properties":propertyname}},function(err, item) {
     if(err){fn(null,err);}
	  else{ fn(true,null);}
      });
   });

}


exports.PropertyOwnerProfile=function(req, res) {
  db.collection('property', function(err, collection) {
 collection.update({"username" : req.user.username},{$set:{"Profile":req.body}},{safe:true},function(err, item) {
     if(err){DbError(res);}
	  else{ Success(res);}
      });
   }); 
};

exports.PropertyListing=function(req, res) {
db.collection('PropertyDetails', function(err, collection) {
 collection.find({$and:[{"location.name":req.body.location.name},{"type.name":req.body.Propertytype.name}]}).toArray( function(err, item){
  if(item){
  res.send(item);}
  if (err) {DbError(res);}
    });
  });
};

exports.PropertyOwnerDetails=function(req, res) {
db.collection('property', function(err, collection) {
	collection.findOne({"username":req.user.username},function(err, item){
		if(item){res.send(item);}
		else  {DbError(res);}
	});
	});
};

exports.GetProperty=function(req, res) {
 db.collection('PropertyDetails', function(err, collection) {
 collection.findOne({$and:[{"Owner":req.user.username},{"propertyname":req.body.propertyname}]}, function(err, item){
  if(item){
	  res.status(200).json(item);}
   else{DbError(res);}
  
  if (err) {DbError(res);}
    });
  });
};


exports.PropertyPhotoUpload=function(req, res) {
      var tmp_path = req.files.file.path;
	  var target_path = './Client/uploads/Property/' + req.files.file.name;
	  req.body.path='/uploads/Property/'+req.files.file.name;;
    fs.rename(tmp_path, target_path, function(err) {
        if (err) throw err;
        fs.unlink(tmp_path, function() {
            if (err) throw err;
				   db.collection('PropertyDetails', function(err, collection) {
				  collection.update({"propertyname" : req.body.name},{$addToSet: {"PhotoDetails":req.body}},function(err, item) {
				   if (err) {
				   DbError(res);}
				   else{  Success(res);}
				});
				});
         
        });
    });



 
};





exports.VacantRentalListing=function(req, res) {
var min=parseInt(req.body.Amount.Min);
var max=parseInt(req.body.Amount.Max);
 db.collection('House', function(err, collection) {
 collection.find({$and:[{"status":"vacant"},req.body.querry,{"amount":{$gte:min,$lte:max}}]}).toArray( function(err, item){
  
  if(item){res.send(item);}
  if (err) {DbError(res);}
    });
  });
};



exports.LoginRedirect=function(req, res) {
	  // console.log("The User Role is." +req.user.role );
           
			if(req.user.role=="tenant"){
			    res.redirect('/Tenant.html');
			 }

            else if(req.user.role=="landlord"){
			    res.redirect('/Landlord.html');
			 }
         
             else if(req.user.role=="agent"){
			    res.redirect('/Agent.html');
			 }
			  else if(req.user.role=="admin"){
			    res.redirect('/Admin.html');
	 }	

};

exports.findEmail=function(id,callback) {
	db.collection('Credential', function(err, collection) {
			  collection.findOne({"identifier":id},function(err, item){
			  if(item){callback(null,item)}
			  else  {callback(null,null);}
	});
	});
	
  
};


exports.hseLookup=function(req, res) {
 db.collection('House', function(err, collection) {
	collection.findOne({$and: [ { "landlordid":req.user._id},{"number" : req.body.id}]},{_id:0},function(err, item){
		if(item){res.send(item);}
		else  {DbError(res);}
	});
	});
};

exports.updateHsedetails=function(req, res) {
	
 db.collection('House', function(err, collection) {
	collection.update( { "landlordid":req.user._id,"number" : req.body.number},req.body,function(err, item){
		if(err){
			console.log(err);
			DbError(res);}
		else  {Success(res);}
	});
	});
};



exports.idExists=function(req, res) {
 db.collection('user', function(err, collection) {
  collection.findOne({"_id":req.body.idnumber},function(err, item){
  if(item){ res.json(200,{exist: true}); }
   else { res.json(200,{exist: false}); };
  if (err) {DbError(res);}
});
});
};


exports.phonenumber=function(req, res) {
 db.collection('user', function(err, collection) {
  collection.findOne({"contact":req.body.phonenumber},function(err, item){
  if(item){ res.json(200,{exist: true}); }
   else { res.json(200,{exist: false}); };
  if (err) {DbError(res);}
});
});
};



exports.ContactExists=function(req, res) {
 db.collection('property', function(err, collection) {
  collection.findOne({"contact":req.body.phonenumber},function(err, item){
  if(item){ res.json(200,{exist: true}); }
   else { res.json(200,{exist: false}); };
  if (err) {DbError(res);}
});
});
};

exports.UsernameExists=function(req, res) {
 db.collection('property', function(err, collection) {
  collection.findOne({"username":req.body.username},function(err, item){
  if(item){ res.status(200).json({exist: true})}
  else {DbError(res);}
});
});
};

exports.Documents=function(req, res) {
 db.collection('Documents', function(err, collection) {
collection.insert(req.body, function(err, item) {
     if(err){DbError(res);}
	  else{ res.json(200,{Success: "Success"});}
      });
   }); 
};

exports.VacateNotice=function(req, res) {
 db.collection('VacateNotice', function(err, collection) {
collection.insert(req.body, function(err, item) {
     if(err){DbError(res);}
	  else{ Success(res);}
      });
   }); 
};


exports.EvictionNotice=function(req, res) {
 db.collection('EvictionNotice', function(err, collection) {
collection.insert(req.body, function(err, item) {
     if(err){DbError(res);}
	  else{ 
		   getPhonenumber(req.body.tenantid,function(status,item){
		      if (status)
		      {
				 sms.EvictionNoticeSMS(item.names,item.contact,item.housename,function(message){
			       message.Landlordid=req.user.username
				   SaveMessage(message);
		        });
		      }
		   })
		 
		   Success(res);
		  
		  }
      });
   }); 
};

exports.GetTenantVacateNotice=function(req, res) {
 db.collection('EvictionNotice', function(err, collection) {
 collection.findOne({"tenantid":req.user._id},function(err, item){
     if(err){DbError(res);}
	  else{ res.send(item);}
      });
   }); 
};


exports.SearchReceipt=function(req, res) {

	console.log("Searching Receipt " +req.body.receiptno);
 db.collection('Transaction', function(err, collection) {
 collection.findOne({$and: [ {"Landlordid":req.user._id},{"receiptno":req.body.receiptno}]},function(err, item){
     if(err){DbError(res);}
	  else{ res.send(item);}
      });
   }); 
};

exports.DeleteReceipt=function(req, res) {
 db.collection('Transaction', function(err, collection) {
 collection.remove({$and: [ {"Landlordid":req.user._id},{"receiptno":req.body.receiptno}]},function(err, item){
     if(err){DbError(res);}
	  else{ 
		   updateTenantBal(-req.body.Amount,req.body.tenantid,function(ok,status) {
			    if (ok){
					 Success(res);; 
					 }	
		         else {
                     DbError(res);
				 }
            });
	      }
     }); 
   }); 
};




exports.GetLandlordNotice=function(req, res) {
 db.collection('VacateNotice', function(err, collection) {
collection.find({$and: [ {"Landlordid":req.user._id},{"LandlordProcessed" : 0}]}).toArray(function(err, item) {
     if(err){DbError(res);}
	  else{ res.send(item);}
      });
   }); 
};

exports.LandlordNoticeUpdate=function(req, res) {
 db.collection('VacateNotice', function(err, collection) {
 collection.update({"Tenantid" : req.body.tenantid},{$set:{"LandlordProcessed":1}},{safe:true},function(err, item) {
     if(err){DbError(res);}
	  else{ Success(res);}
      });
   }); 
};


exports.GetDocument=function(req, res) {
 db.collection('Documents', function(err, collection) {
 collection.find({"plotName": req.query.plot_name}).toArray( function(err, item){
  if(item){//console.log(item);
	  res.send(item);
	  }
  if (err) {DbError(res);}

});
});
};




var getTenantDetails=function(tid,callback){

 db.collection('user', function(err, collection) {
  collection.findOne({"_id":tid},function(err, item){
  if(item){ callback( "ok",item); }
   else { callback( null,null); };
  if (err) {callback( null,null);}
});
});
}

var getUser=function(lid,callback){

 db.collection('user', function(err, collection) {
  collection.findOne({"_id":lid},function(err, item){
  if(item){ callback( "ok",item); }
   else { callback( null,null); };
  if (err) {callback( null,null);}
});
});
}

exports.findUser=function(lid,callback) {
	 db.collection('user', function(err, collection) {
  collection.findOne({"_id":lid},function(err, item){
  if(item){ callback( "ok",item); }
   else { callback( null,null); };
  if (err) {callback( null,null);}
});
});
}


exports.findPhoneNumber=function(phonenumber,callback) {
   db.collection('user', function(err, collection) {
  collection.findOne({"contact":phonenumber},function(err, item){
     if(item){ callback( "ok",item); }
       else { callback( null,null); };
      });
   });
}

function getPhonenumber(tid,callback){
     db.collection('user', function(err, collection) {
      collection.findOne({"_id":tid},function(err, item){
     if(item){ callback( "ok",item); }
       else { callback( null,null); };
      });
   });
};

exports.Recoverpwd=function(req, res) {
// generate new password here
     getUser(req.body.id,function(no,user){
                  if (no)
                  {
		               var msg ="Hi "+user.names +" Your Password has Been Reset Use Test. Change after Login  "
					   sms.sendPassword(user.contact,msg,function(ok,status){
			           if (ok){ console.log("Pwd Sms Sent"); }
				         else{console.log("Pwd Sms Not Sent");}
		                  });
				  }
				  });

				  {res.json(200,{success: "Request Received"})};
	
}

exports.CheckIfMonthPosted=function(plotname,month,fn) {
  db.collection('MonthlyPosting', function(err, collection) {
  collection.findOne({$and: [ {"plotname":plotname},{"Month" : month}]},function(err, item){
  if(item){    

	  if(item.Month==month) {
			 fn(null,true);	  
	  }
	  else {
               fn(null,false);
	  }
  }
  else{
	    fn(null,err); 
      }
  });
  });
}

exports.ChekJobs=function(dt,fn) {
 db.collection('Schedules', function(err, collection) {
 collection.find({"Rundate":dt}).toArray( function(err, item){
     if(item){
		 if (item.length === 0 ) {
				fn(null,null);
		    }
          else{
			  fn(null,item);		  
			  }
		 }  
      if (err) {
		  fn(err,null);  
		  }

    });
  });
	
};




var getNextSequenceValue=function (sequenceName,callback){

        db.collection('counters', function(err, collection) {
		  collection.findAndModify( {"_id": sequenceName },{},{$inc:{"sequence_value":1}},{new:true, upsert:true}, function(err, item) {
		   if (err) {
			   console.log("Error getting Sequence db..."+err);
		       callback(null,null);
		   }
		   else{
			   console.log("The sequence is .."+item.sequence_value );
			   callback(null,item.sequence_value);
			   }
		  });
		  });  
};

exports.SaveMsg=function(msg) {
	SaveMessage(msg);
};

function SaveMessage(msg){
 db.collection('Messages', function(err, collection) {
  collection.insert(msg, function(err, item) {
     if(err){
		 console.log("Error Saving Message" + err);
		 }
      });
   }); 
};

function InsertMonthlyPosting(plot){
 db.collection('MonthlyPosting', function(err, collection) {
  collection.insert({"plotname":plot}, function(err, item) {
     if(err){console.log("Error Inserting doc for Monthly posting");}
      });
   }); 
};



function configureCounters(){
 var rec={"_id":"transactionid","sequence_value":0};
  db.collection('counters', function(err, collection) {
  collection.insert(rec, function(err, item) {
   if (err) {console.log("Error in Counter Configuratio");}
   else{console.log("Counter Collection Created..");}
  });
  });
};
function configureDB(){
	var rec={
        "_id" : "RentalConfiguration",
        "expenseType" : [{"_id" : "1","name" : "Deposit Refund" },
                {"_id" : "2","name" : "Damages"},
                {"_id" : "3","name" : "Materials" },
                {"_id" : "4","name" : "Others" }
                         ],
        "hsetype" : [
                {
                        "name" : "One Bedroom"
                },
                {
                        "name" : "Two Bedroom"
                },
                {
                        "name" : "BedSitter"
                },
                {
                        "name" : "Three Bedroom"
                }
        ],
        "paymentmethod" : [
                {
                        "_id" : "1",
                        "name" : "Cash"
                },
                {
                        "_id" : "2",
                        "name" : "Mpesa"
                },
                {
                        "_id" : "3",
                        "name" : "Bank Deposit"
                }
        ],
        "transactiontype" : [
                {
                        "_id" : "1",
                        "name" : "Rent Payment"
                },
                {
                        "_id" : "2",
                        "name" : "Deposit Payment"
                },
                {
                        "_id" : "3",
                        "name" : "Arrears Payment"
                },
                {
                        "_id" : "3",
                        "name" : "Damage Payment"
                },
                {
                        "name" : "Posting"
                }
        ]
};
	db.collection('Configuration', function(err, collection) {
 collection.insert(rec, function(err, item) {
   if (err) {console.log("Error Configuring db...");}
   else{console.log("Configuration collection Created...");}
  });
  });

  //configure admin
var det={
	     "_id" : "roba",
	     "names" : "roba",
         "AccessStatus" : 1,
         "email" : "nanatec@gmail.com",
         "password": "$2a$10$IaQpkGxJpWxjyoi7wgp5ku.0.xlG8Gw.EmSjDhEA1O83Dxtkjogqa",
         "role" : "both",
         "category" : "admin",
         "modules" : "['tenant','admin','propertymanager','serviceprovider','agent','propertylister','booking'",
         "Approutes":"['all']",
         "Homepage":"Modules.html",
}
    db.collection('user', function(err, collection) {
 collection.insert(det, function(err, item) {
   if (err) {console.log("Error Configuring Admin...");}
   else{console.log("Admin Configured..");}
  });
  });
}; 