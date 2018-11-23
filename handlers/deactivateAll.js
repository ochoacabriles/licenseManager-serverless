const connectToDatabase = require('../cont/db');
const dataProcess = require('../utils/dataProcess.js');
const License = require('../model/license');

module.exports.run = async function(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false;
  var rigInformation = dataProcess.parseRequest(event.body, 'deactivateAll', callback)
  var matchQuery = {'orderNumber': rigInformation.orderNumber, 'email': rigInformation.email}

  await connectToDatabase()
  var doc = await License.findOne(matchQuery)
  if (doc == null) {
    console.error('deactivateAllError-incorrectUser %s %s', matchQuery.orderNumber, matchQuery.email)
    dataProcess.sendResponse('incorrectUser', 200, callback)
  } else {   
    await License.findOneAndUpdate(matchQuery, {$set: {'registeredRigs': []}})
    console.log('deactivateAllSuccess-ok %s %s', matchQuery.orderNumber, matchQuery.email)
    dataProcess.sendResponse('ok', 200, callback)
  }
}