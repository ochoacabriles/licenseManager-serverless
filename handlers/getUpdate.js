const dataProcess = require('../utils/dataProcess.js');
const getOrders = require('../cont/getOrders')

module.exports.run = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  var order = dataProcess.parseRequest(event.body, 'getUpdate', callback)
  getOrders.webhookUpdate(order, callback)
}