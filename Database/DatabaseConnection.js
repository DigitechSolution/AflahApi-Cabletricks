const MongoClient = require( 'mongoose' );
const url = "mongodb://cabletricks:CaB!e!!2o2!%5ETrIZ!@43.204.208.15:38128/cabletricks_cabletricks?authSource=admin";

  async function mongoConnection ( callback ) {
    MongoClient.set("strictQuery", false);
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {

      return callback(err);
    });
  }
  module.exports = {
  connectToServerMongo: mongoConnection,
};
  