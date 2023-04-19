const express = require("express");
const cors = require("cors");
const dynamicRoutes = require("./Routes/AflahApi");
const app = express();
app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true, parameterLimit: 50000}));
app.set('view engine', 'ejs');
const databaseUtils = require( './Database/DatabaseConnection' ); 
global.responseArray = {};
databaseUtils.connectToServerMongo((err,client) => {
  
  if(err) throw err; 
        
        app.use(dynamicRoutes);
           
  
  });
  app.listen(3033);
