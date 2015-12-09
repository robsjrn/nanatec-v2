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
	    console.log("Database Up .."); 
	  
		 db.collection('counters',{strict:true}, function(err, collection) {
	      if (err) { 
			   console.error('counters Collection Does not Exists: %s', err);
			   configureCounters();
		   }
		   });
	    
	        
		   db.collection('Configuration',{strict:true}, function(err, collection) {
		   if (err) { 
			   console.error('Configuration Collection Does not Exists: %s', err);
			   configureDB();
			   }

			  });

	});

	function DbError(res,errmsg){
		 var err={};
		  err.status='error';
		  err.DeveloperMessage=errmsg;
		res.status(500).json(err) ;
	}

	function Success(res){
	    res.status(200).json({success: "Succesfull"});
	}
	
    exports.logout = function(req, res) {
         res.send(200);
	};



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
			//	InsertMonthlyPosting(plot.Plotname);
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
		console.log("got the equest ..");
	  db.collection('property', function(err, collection) {
	  collection.insert(req.body, function(err, item) {
	      if (err) {
	      	DbError(res,err) ;
	      	console.log(err);
	      }
	     else{  addLandlordPlots(req.user._id,req.body,function(err,success){
			         if (success){Success(res);}
			         else{DbError(res,err) ;
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
	  if (err) {DbError(res,err);}
	    });
	   });
	};


	exports.GetAllProperty = function(req, res) {

	   db.collection('property', function(err, collection) {
	    collection.find({"propertymanagerid":req.body.propertymanagerid}).toArray(function(err, item){
	  if(item){ res.status(200).json({'properties': item});}
	  if (err) {DbError(res,err);}
	    });
	   });
	};



	exports.Updateproperty = function(req, res) {
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
				  DbError(res,err) ;}
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
	  if (err) {DbError(res,err);}
	    });
	   });
	};

	exports.listAllproperty = function(req, res) {
	   db.collection('properties', function(err, collection) {
	     collection.find({"occupationStatus" : "vacant"},{_id:0}).toArray(function(err, item){
	  if(item){ res.status(200).json(item);}
	  else { res.status(404).json({exist: false}) };
	  if (err) {DbError(res,err);}
	    });
	   });
	};


	exports.ListBookings = function(req, res) {
	   db.collection('sales', function(err, collection) {
	     collection.find({$and: [ {"Owner.landlordid":req.user.landlordid},{"stage" : "booking"}]},{_id:0}).toArray(function(err, item){
	  if(item){ res.status(200).json(item);}
	  else { res.status(404).json({exist: false}) };
	  if (err) {DbError(res,err);}
	    });
	   });
	};


		exports.updatebooking= function(req, res) {
			db.collection('sales', function(err, collection) {
			collection.update({$and: [ {"Owner.landlordid":req.user.landlordid},{"client.id" : req.body.clientid}]},{$set:{"stage":"reservation"}}, function(err, item) {
			   if (err) {console.log(err);DbError(res,err) ;}
				else{res.status(200).json({update:"success"});}	
				});
			});
		};




	exports.Listreservation = function(req, res) {
	   db.collection('sales', function(err, collection) {
	     collection.find({$and: [ {"Owner.landlordid":req.user.landlordid},{"stage" : "reservation"}]},{_id:0}).toArray(function(err, item){
	  if(item){ res.status(200).json(item);}
	  else { res.status(404).json({exist: false}) };
	  if (err) {DbError(res,err);}
	    });
	   });
	};

		exports.updatereservation= function(req, res) {
			db.collection('sales', function(err, collection) {
			collection.update({$and: [ {"Owner.landlordid":req.user.landlordid},{"client.id" : req.body.clientid}]},{$set:{"stage":"deposit","Reservationchecklist":req.body.checklist}}, function(err, item) {
			   if (err) {console.log(err);DbError(res,err) ;}
				else{res.status(200).json({update:"success"});}	
				});
			});
		};






	exports.PropertyBooking = function(req, res) {
	 db.collection('sales', function(err, collection) {
	  collection.insert(req.body, function(err, item) {
	      if (err) {
	      	console.log(err);
				  DbError(res,err) ;}
	      else {Success(res);}
	        });
	   });
	};


	               

	exports.GetplotDetails = function(req, res) {
	   db.collection('property', function(err, collection) {
	    collection.findOne({"Plotname":req.params.plotname},{_id:0},function(err, item){
	  if(item){ res.status(200).json(item);}
	  else { res.status(404).json({exist: false}) };
	  if (err) {DbError(res,err);}
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

		   }else{DbError(res,err) ;}
	});
	});
	};


		exports.createunit = function(req, res) {
		db.collection('units', function(err, collection) {
		collection.insert(req.body, function(err, item) {
		   if (err) {DbError(res,err) ;}
		   else{updatenohse(req.body.propertymanagerid,1,req.body.amount,function(ok,status)
			   {if (ok){
			      res.status(200).json({success: "Succesfull"});
		       }	
		   });}

		});
		});
		};

	exports.UpdateUnit= function(req, res) {
	db.collection('units', function(err, collection) {
	collection.update({$and: [ {"_id":req.body.number},{"ownerid" : req.body.propertymanagerid}]},{$set:req.body}, function(err, item) {
	   if (err) {console.log(err);DbError(res,err) ;}
	   else{updatenohse(req.body.propertymanagerid,0,-req.body.amount,function(ok,status)
		   {if (ok){
		      res.status(200).json({success: "Succesfull"});
	       }else{DbError(res,err) ;}	
	   });}

	});
	});
	};

	exports.UpdateUnitSettings= function(req, res) {
		var _id=req.body._id;
		delete req.body["_id"];
	db.collection('units', function(err, collection) {
	collection.update({"_id":ObjectID(_id)},{$set:{'settings':req.body.settings}}, function(err, item) {
	   if (err) {console.log(err);DbError(res,err) ;}
	   else{   res.status(200).json({success: "Succesfull"});}

	});
	});
	};


	exports.vacantunits = function(req, res) {
		console.log("Property manager id "+req.body.propertymanagerid);
	 db.collection('units', function(err, collection) {
	 collection.find({$and: [{"propertymanagerid":req.body.propertymanagerid},{"occupationStatus":"vacant"},{"verifiedstatus":"verified"}]}).toArray( function(err, item){
	  if(item){res.status(200).json({'vacantunits': item});}
	  if (err) {DbError(res,err) ;}

	});
	});
	};
	exports.GetLandlordUnits = function(req, res) {
	 db.collection('units', function(err, collection) {
	     collection.find({"propertymanagerid":req.body.propertymanagerid},{_id:0}).toArray(function(err, item) {
		   if(item){res.status(200).json(item);;
		   }else{DbError(res,err)  ;}
	});
	});
	};




	 exports.deleteHse = function(req, res) {
	  db.collection('units', function(err, collection) {
	   collection.remove({$and:[{"landlordid":req.user.propertymanagerid},{"number" : req.params.hsename}]}, function(err, item) {
	   if (err) {DbError(res,err)  ;}
	   else{updatenohse(req.user.propertymanagerid,-1,-req.body.amount,function(ok,status)
		   {if (ok){
		      res.status(200).json({success: "Succesfull"});
	        }else{DbError(res,err)  ;}	
	   });}

	});
	});
	};





	/* End of  House Stuff Begin */


	/* Tenant Stuff */

			exports.CheckTenantid=function(req, res) {
				console.log(req.params.idnumber);
			 db.collection('user', function(err, collection) {
			  collection.findOne({$and:[{"_id":req.params.idnumber},{"userrole.role" : "tenant"}]},{password:0},function(err, item){
			  if(item){ res.status(200).json({exist: true,tenantdetails:item}); }
			   if (err) {DbError(res,err) ;}
			  // else { res.status(200).json({exist: false}); };
			 
			});
			});
			};


			     exports.checkTenantContact=function(req, res) {
					 db.collection('user', function(err, collection) {
					  collection.findOne({$and:[{"contact":req.params.contactnumber},{"role" : "tenant"}]},{password:0},function(err, item){
					  if(item){ res.json(200,{exist: true,data:item}); }
					   else { res.json(200,{exist: false}); };
					  if (err) {DbError(res,err) ;}
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
								   DbError(res,err)  ;
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
							  if (err) {DbError(res,err)  ;}

							});
							});
	                  
	                 };

	    
		exports.updateTenant= function(req, res) {
			db.collection('user', function(err, collection) {
			collection.update({$and: [ {"Landlordid":req.user._id},{"_id" : req.body.tid}]},{$set:req.body}, function(err, item) {
			   if (err) {console.log(err);DbError(res,err)  ;}
				else{res.status(200).json({update:"success"});}	
				});
			});
		};




			exports.TenantList = function(req, res) {

			 db.collection('user', function(err, collection) {
			 collection.find({$and: [ {"propertymanagerid":req.user._id},{"userrole.role" : "tenant"}]}).toArray( function(err, item){
			  if(item){res.status(200).json({'tenants':item});}
			  if (err) {DbError(res,err)  ;}

			});
			});
			};






				exports.deleteTenant = function(req, res) {
			  db.collection('user', function(err, collection) {
			   collection.remove({$and:[{"propertymanagerid":req.user._id},{"_id" : req.params.tenantid}]}, function(err, item) {
			   if (err) {DbError(res,err)  ;}
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
				   DbError(res,err) ;}
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
				  if (err) {DbError(res,err) ;}
				});
				});
				};

	 exports.idExists=function(req, res) {
	 db.collection('user', function(err, collection) {
	  collection.findOne({"_id":req.body.idnumber},function(err, item){
	  if(item){ res.json(200,{exist: true}); }
	   else { res.json(200,{exist: false}); };
	  if (err) {DbError(res,err) ;}
	});
	});
	};


	exports.phonenumber=function(req, res) {
	 db.collection('user', function(err, collection) {
	  collection.findOne({"contact":req.body.phonenumber},function(err, item){
	  if(item){ res.json(200,{exist: true}); }
	   else { res.json(200,{exist: false}); };
	  if (err) {DbError(res,err) ;}
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
		   DbError(res,err) ;}
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


			exports.CreatePropertyMaster = function(req, res) {
			db.collection('propertyMaster', function(err, collection) {
			collection.insert(req.body, function(err, item) {
			   if (err) {DbError(res,err)  ;}
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
			   if (err) {DbError(res,err)  ;}
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
			   if (err) {console.log(err);DbError(res,err)  ;}
				else{res.status(200).json({update:"success"});}	
				});
			});
		};



			exports.deletePropertyMaster = function(req, res) {
			  db.collection('propertyMaster', function(err, collection) {
			   collection.remove({$and:[{"Landlordid":req.user._id},{"_id" : req.params._id}]}, function(err, item) {
			   if (err) {DbError(res,err)  ;}
			   else{ res.status(200).json({success: "Succesfull"}) ;}	
			   });
			});
			};

	    exports.getPropertyMaster = function(req, res) {
	      console.log(req.user._id);
			 db.collection('propertyMaster', function(err, collection) {
			 collection.find({"landlordid":req.user._id}).toArray( function(err, item){
			  if(item){res.send(item);}
			  if (err) {DbError(res,err)  ;}

			});
			});
			};

	    exports.propertyPortfolio = function(req, res) {
			 db.collection('propertyMaster', function(err, collection) {
			 collection.find({"landlordid":req.user.landlordid}).toArray( function(err, item){
			  if(item){res.send(item);}
			  if (err) {DbError(res,err)  ;}

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
			   if (err) {DbError(res,err)  ;}
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
			   if (err) {console.log(err);DbError(res,err)  ;}
				else{res.status(200).json({update:"success"});}	
				});
			});
		};


			exports.deleteproperytUser = function(req, res) {
			  db.collection('user', function(err, collection) {
			   collection.remove({$and:[{"landlordid":req.user._id},{"_id" : req.params._id}]}, function(err, item) {
			   if (err) {DbError(res,err)  ;}
			   else{ res.status(200).json({success: "Succesfull"}) ;}	
			   });
			});
			};

	    exports.getproperytUser = function(req, res) {
			 db.collection('user', function(err, collection) {
			 collection.find({"landlordid":req.user._id}).toArray( function(err, item){
			  if(item){res.send(item);}
			  if (err) {DbError(res,err)  ;}

			});
			});
			};

			    exports.getunassignedproperytUser = function(req, res) {
					 db.collection('user', function(err, collection) {
					 collection.find({$and:[{"landlordid":req.user._id},{"assignedStatus" : 0}]}).toArray( function(err, item){
					  if(item){res.send(item);}
					  if (err) {DbError(res,err)  ;}

					});
					});
					};

			


	/* end of Property User */



	exports.listoftenant = function(req, res) {

	 db.collection('user', function(err, collection) {
	 collection.find({"plot.Plotname":req.params.plot}).toArray( function(err, item){
	  if(item){res.send(item);}
	  if (err) {DbError(res,err)  ;}

	});
	});
	};

	exports.tenantDataID = function(req, res) {

	 db.collection('user', function(err, collection) {
	     collection.findOne({$and:[{"_id":req.body.tenantid},{"hsestatus" : 1},{"Landlordid":req.user._id}]},{names:1,_id:1,housename:1,plot:1,balance:1,contact:1},function(err, item) {
		   if(item){res.send(item);
		   }else{DbError(res,err)  ;}
	});
	});
	};


	exports.tenantDataHseName = function(req, res) {

	 db.collection('user', function(err, collection) {
	     collection.findOne({$and:[{"housename":req.body.housename},{"hsestatus" : 1},{"Landlordid":req.user._id}]},{names:1,_id:1,housename:1,plot:1,balance:1,contact:1},function(err, item) {
		   if(item){res.send(item);
		   }else{DbError(res,err) ;}
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
			   DbError(res,err)  ;
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
			   DbError(res,err)  ;
			   }
	});
	});
	};



	exports.listofHouse = function(req, res) {
	 db.collection('House', function(err, collection) {
	 collection.find({"plot.Plotname":req.params.plot}).toArray( function(err, item){
	  if(item){res.send(item);}
	  if (err) {DbError(res,err)  ;}

	});
	});
	};



	exports.listofUnbookedtenant = function(req, res) {
		
	 db.collection('user', function(err, collection) {
	 collection.find({$and: [{"Landlordid":req.user.landlordid}, {"role":"tenant"},{"hsestatus" : 0}]}).toArray( function(err, item){
	  if(item){res.send(item);}
	  if (err) {DbError(res,err)  ;}

	});
	});
	};




	exports.listtenant = function(req, res) {
		
	 db.collection('user', function(err, collection) {
	 collection.find({$and: [{"Landlordid":req.user.landlordid}, {"role":"tenant"}]}).toArray( function(err, item){
	  if(item){res.send(item);}
	  if (err) {DbError(res,err)  ;}

	});
	});
	};





	exports.OccupiedTenantList = function(req, res) {
	 db.collection('user', function(err, collection) {
	 collection.find({$and: [{"Landlordid":req.user.landlordid}, {"hsestatus":1}]}).toArray( function(err, item){
	  if(item){res.send(item);}
	  if (err) {DbError(res,err)  ;}

	});
	});
	};


    exports.checkin=function(req,res){

    	console.log(req.body);

    	var tenantunits=[];

    	    req.body.units.forEach(function(item){
                var det={};
                     det.unitid=item._id;
                     det.propertyid=item.propertyid;
                     det.name=item.name;
                     tenantunits.push(det);
                     updateUnitStatus(item._id,req.body.tenantid,function(status,resp){
                     
                     	  if (status){}
                     });
    	    	     
    	    });
           console.log(tenantunits);
        db.collection('user', function(err, collection) {
	      collection.findAndModify({"_id":req.body.tenantid},{},{$set:{'occupationStatus':'occupied','units':tenantunits}},{ new: true }, function(err, item) {
	        if (item) {
	        	//console.log(item);
				res.send(item);
				}
			else{
				console.log(err);
				DbError(res,err);
			}
			 
	      }); 
	    });

    	   
                    
  

    };

    var updateUnitStatus=function(unitid,tenantid,callback){

    db.collection('units', function(err, collection) {
	collection.findAndModify({"_id":ObjectID(unitid)},{},{$set:{'occupationStatus':'occupied','tenantid':tenantid}},{ new: true },  function(err, item) {
	        if (item) {

				callback(true,item); 
				}
			else{
				console.log("callback Error " );
				console.log(err);
				callback(false,err)
			}
			 
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
	  
	          db.collection('property').ensureIndex({loc: "2d"}, { w:1}, function(err, result) {
	           if(err) { console.dir(err);}
	          });



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