'use strict';
const activate = require('./handlers/activate')
const check = require('./handlers/check')
const deactivateOne = require('./handlers/deactivateOne')
const deactivateAll = require('./handlers/deactivateAll')

const https = require('https')
const getOrders = require('./cont/getOrders')
const dataProcess = require('./utils/dataProcess.js')

require('dotenv').config()

module.exports.activate = (event, context, callback) => {
  activate.run(event, context, callback)
};

module.exports.check = (event, context, callback) => {
  check.run(event, context, callback)
}

module.exports.deactivateOne = (event, context, callback) => {
  deactivateOne.run(event, context, callback)
}

module.exports.deactivateAll = (event, context, callback) => {
  deactivateAll.run(event, context, callback)
}

module.exports.getUpdate = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  var order = dataProcess.parseRequest(event.body, 'getUpdate', callback)
  getOrders.uploadData(order, callback)
}

module.exports.getDBUpdates = (event, context, callback) => {
  var timer = new Date()
  timer.setHours(timer.getHours() - event.pathParameters.time)
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
      var order = dataProcess.parseRequest(event.body, 'getDBUpdates', callback)
      if ('orders' in order) {
        var messages = []
        var length = order.orders.length
        if (length == 0) {
          return callback('noNewOrders')
        }
        order.orders.forEach( (order, i) => {
          getOrders.uploadData(order, (message) => {
            if (message != 'ok')
              messages.push(message)
          })
          if (i == length - 1) {
            return callback(String(messages.length))
          }
        })
      } else {
        if ('order' in order) {
          getOrders.uploadData(order.order, callback)
        } else {
          return callback('invalidOrder')
        }
      }
    })
  })
}