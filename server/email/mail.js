var email   = require("emailjs/email");
var path = require('path');
var EmailTemplate = require('email-templates').EmailTemplate;
var _ = require('lodash');
var Handlebars = require('handlebars');


var sendmail = email.server.connect({
  user: "nana.customercare@gmail.com",
  password: "sebastian123!",
  host: "smtp.gmail.com",
  ssl: true
});



exports.sendWelcomeMail=function(user) {

	var htmlt;
		 welcomeMailPartial(user,function (status,result){
		 	if (status){
		                  
                   var message = {
					
					   from:    "Nana Properties <nana.customercare@gmail.com>", 
					   to:      user.email,
					   cc:      "roba <robsjrn@gmail.com>",
					   subject: "Welcome To Nana ",
					   attachment: 
					   [
					      {data:result.html, alternative:true}
					   ]
					};


					   console.log("sending Mail ");

					   sendmail.send(message, function (err, message) {
					    var body = null;
					    if (err) {
					      body = err.toString();
					      console.log(body);
					    } else {
					      console.log("Mail Sent ");
					    }
					    
					  });


		 	}

		 });



};


var welcomeMailPartial=function(user,callback){

	var templateDir = path.resolve(__dirname,  'templates', 'welcome-hbs')
	   Handlebars.registerHelper('capitalize', function capitalize (context) {
		  return context.toUpperCase()
		})

		Handlebars.registerPartial('name',
		  '{{ capitalize name.first }} {{ capitalize name.last }}'
		)

		var template = new EmailTemplate(templateDir)
		var locals = {
		  names: user.name,
		  username :user.id,
		  password :user.password,
		  role:user.role

		}

		template.render(locals)
		.then(function (results) {
		
		  callback(true,results);
		});

};


