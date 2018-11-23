const connectToDatabase = require('../cont/db');
const License = require('../model/license');
const dataProcess = require('../utils/dataProcess.js');
const dataUpdate = require('../cont/dataUpdate');

module.exports.run = async function (event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false;
  var rigInformation = dataProcess.parseRequest(event.body, 'check', callback)
  console.log({rigInformation})
  var matchQuery = {'orderNumber': rigInformation.orderNumber, 'email': rigInformation.email}
  var version = rigInformation.version
  
  await connectToDatabase(callback)
  var doc = await License.findOne(matchQuery)
  if (doc == null) {
    console.error('checkError-incorrectUser %s %s', matchQuery.orderNumber, matchQuery.email)
    dataProcess.sendResponse('incorrectUser', 200, callback, version)
  } else {
    var rigIds = []
    doc.registeredRigs.forEach( (rig) => {
      rigIds.push(rig.rigId)
    })
    if (rigIds.includes(rigInformation.rigId)) {
      var versionTrack = doc.registeredRigs.find(rig => rig.rigId == rigInformation.rigId)
      if (versionTrack.version != rigInformation.version) {
        dataUpdate.updateVersion(doc, rigInformation, callback)
      }
      console.log('checkSuccess-ok %s %s %s', matchQuery.orderNumber, matchQuery.email, rigInformation.rigId)
      dataProcess.sendResponse('ok', 200, callback, version)
    } else {   
      console.error('checkError-notRegistered %s %s %s %s', matchQuery.orderNumber, matchQuery.email, rigInformation.rigId)
      dataProcess.sendResponse('notRegistered', 200, callback, version)
    }         
  }
}

