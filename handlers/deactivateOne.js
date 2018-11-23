const connectToDatabase = require('../cont/db');
const dataProcess = require('../utils/dataProcess.js');
const License = require('../model/license');

module.exports.run = async function(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false;
  var rigInformation = dataProcess.parseRequest(event.body, 'deactivateOne', callback)
  var matchQuery = {'orderNumber': rigInformation.orderNumber, 'email': rigInformation.email}
  
  await connectToDatabase()
  var doc = await License.findOne(matchQuery)
  if (doc == null) {
    console.error('deactivateOneError-incorrectUser %s %s', matchQuery.orderNumber, matchQuery.email)
    dataProcess.sendResponse('incorrectUser', 200, callback)
  } else {    
    var rigNames = []
      doc.registeredRigs.forEach( (rig) => {
      rigNames.push(rig.rigName)
    })
    if (rigNames.includes(event.pathParameters.rigName)) {
      await License.findOneAndUpdate(matchQuery, {$pull: {'registeredRigs': {'rigName': event.pathParameters.rigName}}})
      console.log('deactivateOneSuccess-ok %s %s %s', matchQuery.orderNumber, matchQuery.email, event.pathParameters.rigName)
      dataProcess.sendResponse('ok', 200, callback)
    } else {  
      console.error('deactivateOneError-notRegistered %s %s %s', matchQuery.orderNumber, matchQuery.email, event.pathParameters.rigName)
      dataProcess.sendResponse('notRegistered', 200, callback)
    }
  }  
}