const connectToDatabase = require('../cont/db');
const dataProcess = require('../utils/dataProcess.js');
const License = require('../model/license');
const dataUpdate = require('../cont/dataUpdate');

module.exports.run = async function(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false;
  var rigInformation = dataProcess.parseRequest(event.body, 'activate', callback)
  var matchQuery = {'orderNumber': rigInformation.orderNumber, 'email': rigInformation.email}
  var toAdd = {'rigName': rigInformation.rigName, 'rigId': rigInformation.rigId, 'version': rigInformation.version}
  var version = rigInformation.version

  await connectToDatabase(callback)
  var doc = await License.findOne(matchQuery)

  if (doc == null) {
    console.error('activateEror-incorrectUser %s %s',matchQuery.orderNumber, matchQuery.email)
    dataProcess.sendResponse('incorrectUser', 200, callback, version)
  } else {
    var rigIds = []
    var rigNames = []
      doc.registeredRigs.forEach( (rig) => {
      rigIds.push(rig.rigId)
      rigNames.push(rig.rigName)
    })
    if (rigIds.includes(rigInformation.rigId)) {
      var existentDoc = doc.registeredRigs.find(rig => rig.rigId == rigInformation.rigId)
      if (existentDoc.version != rigInformation.version) {
        await dataUpdate.updateVersion(doc, rigInformation, callback)
      }
      if (existentDoc.rigName != rigInformation.rigName) {
        await dataUpdate.updateRigName(doc, rigInformation, callback)
      }
      console.log('activateSuccess-alreadyRegistered %s %s %s %s', matchQuery.orderNumber, matchQuery.email, toAdd.rigId, toAdd.rigName)
      dataProcess.sendResponse('ok', 200, callback, version)
    } else {
      if (rigNames.includes(rigInformation.rigName)) {
        console.error('activateError-invalidRigName %s', toAdd.rigName)
        dataProcess.sendResponse('invalidRigName', 200, callback, version)
      } else {
        if (doc.licenses > rigIds.length) {
          await License.findOneAndUpdate(matchQuery, {$push: {'registeredRigs': toAdd}})
          console.log('activationSuccess-ok %s %s %s %s', matchQuery.orderNumber, matchQuery.email, toAdd.rigId, toAdd.rigName)
          dataProcess.sendResponse('ok', 200, callback, version)
        } else {
          console.error('activationError-noLicenses %s %s', matchQuery.orderNumber, matchQuery.email)
          dataProcess.sendResponse('noLicenses', 200, callback, version)
        }
      }
    }    
  }
}