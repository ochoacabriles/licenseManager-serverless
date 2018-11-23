var compare = require('version-comparison')

module.exports.parseRequest = function(body, action, callback) {
  var responseBody = {}
  try {
    var rigInformation = JSON.parse(body)
    return rigInformation
  } catch (e) {
    console.error(action + 'Error-badFormat')
    responseBody.status = 'invalidJson'
    return callback(null, {
      statusCode: 400,
      body: JSON.stringify(responseBody)
    })
  }
}

function checkVersion(version) {
  let lastVersion = compare (version, process.env.LAST_VERSION)
  if ( lastVersion == 0) {
      return 'UpToDate'
  } else {
    let minVersion = compare (version, process.env.MIN_VERSION)
    if ( minVersion >= 0 ) {
      return 'OutOfDate'
    } else {
      return 'OutOfDateShouldUpdate'
    }
  }
}

module.exports.sendResponse = function (status, statusCode, callback, version) {
  var responseBody = {
    status: status,
  }
  if (version) {
    responseBody.versionStatus = checkVersion(version)
  }
  return callback(null, {
    statusCode: statusCode,
    body: JSON.stringify(responseBody)
  })

}