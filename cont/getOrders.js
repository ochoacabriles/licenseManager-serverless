const connectToDatabase = require('./db');
const License = require('../model/license');

module.exports.uploadData = async function (order, callback) {
  var licenses = 0
  if ('line_items' in order) {
      order.line_items.forEach( (item) => {
          if ( item.sku == process.env.ITEM_SKU ) {
              licenses += item.quantity
          }
      })
      var toUpdate = {
          $set : {
              orderNumber: order.order_number,
              email: order.email,
              licenses: licenses,
          }
      }
      var query = { 'orderNumber': order.order_number }
      await connectToDatabase()
      await License.findOneAndUpdate(query, toUpdate, {upsert: true})
      return callback( null, {
        statusCode: 200,
        body: 'OK'
      })
  } else {
    return callback(null, {
      statusCode: 200,
      body: 'OK'
    })
  }
}