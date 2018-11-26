const https = require('https')
const getOrders = require('../cont/getOrders')
const dataProcess = require('../utils/dataProcess.js')

module.exports.run = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  var timer = new Date()
  timer.setHours(timer.getHours() - 24)
  var date = timer.toISOString()
  const URL = 'https://' + process.env.API_KEY + ':' + process.env.API_PASSWORD + '@' +
              process.env.API_URL + '?created_at_min=' + date + '&fields=order_number,line_items,email'
  https.get(URL, (res) => {
    var receivedData = []
    res.on('data', (chunk) => {
      receivedData.push(chunk)
    }).on('end', () => {
      var buffer = Buffer.concat(receivedData)
      var stringData = buffer.toString()
      var order = dataProcess.parseRequest(stringData, 'getDBUpdates', callback)
      getOrders.uploadData(order.orders, callback)
    })
  })
}