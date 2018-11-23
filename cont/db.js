
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
let isConnected;

module.exports = connectToDatabase = async (callback) => {
  if (isConnected) {
    console.log('=> using existing database connection');
    return
  }

  console.log('=> using new database connection');
  try {
    var db = await mongoose.connect(process.env.MONGO_DB_URL)
    isConnected = db.connections[0].readyState;
    return
  } catch (err) {
    var responseBody = { 
      'status': 'databaseError',
      'errorStack': err  
    }
    return callback(null, {
      statusCode: 500,
      body: JSON.stringify(responseBody)
    })    
  }
};