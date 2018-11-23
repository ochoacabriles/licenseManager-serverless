var License = require('../model/license')

require ('dotenv').config()

module.exports.updateVersion = async function (doc, rigInformation, callback) {
  try {
    await License.updateOne( 
      { _id: doc._id, 'registeredRigs.rigId': rigInformation.rigId},
      { $set: {'registeredRigs.$.version': rigInformation.version} } 
    )
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
}

module.exports.updateRigName = async function (doc, rigInformation, callback) {
  try {
    await License.updateOne(
      {_id: doc._id, 'registeredRigs.rigId': rigInformation.rigId},
      { $set: {'registeredRigs.$.rigName': rigInformation.rigName}}
    )
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
}