var Config = {};
Config.PM={};//property manager
Config.PL={};//property Lister
Config.PB={};//property Both manager and Lister

Config.JobConfig="'00 15 4 * * 0-6'"; //this is Every second
Config.AppUrl="104.131.100.150:4000";
Config.TenantWelcomeMsg="You Have Been Registered as a Tenant in One of Our Property for More Information Visit Us at http://104.131.100.150 use your id as username and Password";
Config.DatabaseUrl="mongodb://127.0.0.1:27017/nanatecdb";
Config.tokenSecret='1234567890QWERTY';

Config.Tenant={
             "Homepage":"/Tenant.html",
             "usercategory":"tenant",
             "allowedPath":'["/properties","/units"]',
             "userrole" : {
                "id" : 2,
                "role" : "tenant"
                    }
};

Config.PL={
		 "Homepage":"/PropertyListing.html",
         "usercategory":"propertyListing",
         "allowedPath":'["/properties","/units","/edit-property"]',
		 "userrole" : {
					 "id" : 1,
					 "role" : "admin"
                    }	
			
			};
			
Config.PM={
	   	 "Homepage":"/propertymanager.html",	
         "usercategory":"propertymanager",
         "allowedPath":'["/properties","/units","/edit-property"]',
         "userrole":{ 
					 "id" : 1,
					 "role" : "admin"
                    }
 };

module.exports = Config




