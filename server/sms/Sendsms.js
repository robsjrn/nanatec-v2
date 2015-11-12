var twilio = require('twilio');

 
// Create a new REST API client to make authenticated requests against the
// twilio back end
var client = new twilio.RestClient('AC5dabe402352ad3b7eadad650dccd3c8c', '4ffa6f3ff6fb7f461996e4a992e24b93');


exports.sendPassword=function(phoneNumber,msg,fn){

	console.log("the phone numbers is "+ phoneNumber)
  client.sms.messages.create({
    to:phoneNumber,
    from:'+17746332190',
    body:msg
}, function(error, message) {
   
    if (!error) {
    /// to do save this message to the DB
        console.log('Success! The SID for this SMS message is:');
        console.log(message.sid);

        console.log('Message sent on:');
        console.log(message.dateCreated);
		fn(message.sid,message.sid);//correct this late
    } else {
        console.log('Oops! There was an error.' + error);
        fn(null,null);
    }
}); 
};

exports.sendSMS=function(phoneNumber,msg,fn){
  var msgs={};
  client.sms.messages.create({
    to:phoneNumber,
    from:'+17746332190',
    body:msg
}, function(error, message) {
   
    if (!error) {
		 msgs.Details=message;
		 msgs.Status=1;
		fn(msgs);//correct this late
    } else {
         msgs.Error=error;
	     msgs.Status=0;
        fn(msgs);
    }
}); 
};



exports.LandlordWelcomeSMS=function(landlord,fn){
  var message ="Hi "+landlord.names +" Welcome to Nana You Have Registered as Landlord .Hope to Serve You Better. "
  var msg={};
  client.sms.messages.create({
    to:landlord.contact,
    from:'+17746332190',
    body:message
}, function(error, message) {
    if (!error) {
         msg.Details=message;
		 msg.Status=1;
		 fn(msg);
    } else {
        msg.Error=error;
		msg.To=landlord.contact;
		msg.Messsage=msg;
		msg.Status=0;
        fn(msg);
    }
}); 
};


exports.TenantWelcomeSMS=function(Tenant,tm,fn){
  var message ="Hi "+Tenant.names + " "+tm ;
 
  console.log(message);
  var msg={};
  client.sms.messages.create({
    to:Tenant.contact,
    from:'+17746332190',
    body:message
}, function(error, message) {
    if (!error) {
         msg.Details=message;
		 msg.Status=1;
		 fn(msg);
    } else {
        msg.Error=error;
		msg.To=Tenant.contact;
		msg.Messsage=msg;
		msg.Status=0;
        fn(msg);
    }
}); 
};

exports.PropertyWelcomeSMS=function(owner,fn){
  var message ="Hi "+owner.names +" Welcome to Nana We Hope to Serve You Better "
  var msg={};
  client.sms.messages.create({
    to:owner.contact,
    from:'+17746332190',
    body:message
}, function(error, message) {
    if (!error) {
         msg.Details=message;
		 msg.Status=1;
		 fn(msg);
    } else {
        msg.Error=error;
		msg.To=owner.contact;
		msg.Messsage=msg;
		msg.Status=0;
        fn(msg);
    }
}); 
};

exports.TenantTransactionSMS=function(names,contact,Amount,Hseno,bal,fn){
    if (bal >= 0)
    {var message ="Hi "+names +" An Amount of Ksh "+Amount +" Has been Paid to Your House No. "+ Hseno +" Your Balance is "+bal ;}
    else {var message ="Hi "+names +" An Amount of Ksh "+Amount +" Has been Paid to Your House No. "+ Hseno +" And You Have an Overpayment of "+bal ;};

  
  var msg={};
  client.sms.messages.create({
    to:contact,
    from:'+17746332190',
    body:message
}, function(error, message) {
    if (!error) {
         msg.Details=message;
		 msg.Status=1;
		 fn(msg);
    } else {
        msg.Error=error;
		msg.To=contact;
		msg.Messsage=msg;
		msg.Status=0;
        fn(msg);
    }
}); 
};


exports.EvictionNoticeSMS=function(tenantnames,contact,hseno,fn){
  var message ="Hi "+tenantnames +" An Eviction Notice to Your House " +hseno +" Has Been Issued By Your Landlord Login for More Details."
  var msg={};
  client.sms.messages.create({
    to:contact,
    from:'+17746332190',
    body:message
}, function(error, message) {
    if (!error) {
         msg.Details=message;
		 msg.Status=1;
		 fn(msg);
    } else {
        msg.Error=error;
		msg.To=contact;
		msg.Messsage=msg;
		msg.Status=0;
        fn(msg);
    }
}); 
};

exports.BalanceNotificationSMS=function(tenantnames,contact,hseno,balance,fn){
  var message ="Kind Reminder "+tenantnames +" Your Rental Balance For House Number " +hseno +" is " + balance + " Kindly Pay Before Due Date"
  var msg={};
  client.sms.messages.create({
    to:contact,
    from:'+17746332190',
    body:message
}, function(error, message) {
    if (!error) {
         msg.Details=message;
		 msg.Status=1;
		 fn(msg);
    } else {
        msg.Error=error;
		msg.To=contact;
		msg.Messsage=msg;
		msg.Status=0;
        fn(msg);
    }
}); 
};
