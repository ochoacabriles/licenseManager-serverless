const connectToDatabase = require('./db');
const License = require('../model/license');
const dataProcess = require('../utils/dataProcess');

module.exports.uploadData = (orders, callback) => {
  var bulkUpserts = []
  var length = orders.length
  if (length == 0) {
    console.log('No hay órdenes nuevas')
    return dataProcess.sendResponse('noNewOrders', 200, callback)
  }
  orders.forEach( async (order, i) => {
    var licenses = 0
    if ('line_items' in order) {
      order.line_items.forEach( (item) => {
        if ( item.sku == process.env.ITEM_SKU ) {
          licenses += item.quantity
        }
      })
      var query = { 'orderNumber': order.order_number }
      var toUpdate = {
        orderNumber: order.order_number,
        email: order.email,
        licenses: licenses
      }
    }
    let upsertDoc = { 
      'updateOne': {
        'filter': query,
        'update': toUpdate,
        'upsert': true
      }
    }
    bulkUpserts.push(upsertDoc)
    if ( i == length - 1 ) {
      try {
        await connectToDatabase()     
        await License.bulkWrite(bulkUpserts) 
        console.log('%s órdenes actualizadas con éxito', length)
        return dataProcess.sendResponse('ok', 200, callback)
      } catch (err) {
        console.error('Ocurrió un error al actualizar la base de datos: \n %s', err)
        return dataProcess.sendResponse('databaseError', 500, callback)
      }
    }
  })  
}