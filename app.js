var express=require('express'),
     app=express();
var bodyParser = require('body-parser');
var serveStatic = require('serve-static');


app.use(serveStatic(__dirname + '/client/app'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.json({limit: '50mb'}));


var router = require('./server/router')(app);
  app.listen(process.env.PORT || 4000);
  console.log('Rental App Started on Port 4000');

module.exports = app;




