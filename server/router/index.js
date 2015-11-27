

module.exports = function (app) {


     app.use('/web', require('./routes/MainRoutes'));
     app.use('/web/propertymanager', require('./routes/LandlordRoutes'));
	// app.use('/web/Tenant', require('./routes/TenantRoutes'));
	// app.use('/web/Property', require('./routes/PropertyRoutes'));
	// app.use('/web/Admin', require('./routes/AdminRoutes'));
    // app.use('/web/Reports', require('./routes/ReportsRoutes'));
	// app.use('/web/Download', require('./routes/DownloadRoute'));
    // app.use('/web/Sales', require('./routes/SalesRoutes'));
	// app.use('/web/Sms', require('./routes/SmsRoutes'));
	 
};