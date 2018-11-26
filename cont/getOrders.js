const connectToDatabase = require('./db');
const License = require('../model/license');
const dataProcess = require('../utils/dataProcess');
const prepareUpdate = require('../utils/prepareUpdate')

module.exports.webhookUpdate = async (order, callback) => {
  var updateObject = prepareUpdate.makeUpdateObject(order)
  console.log({updateObject})
  try {
    await connectToDatabase()
    await License.findOneAndUpdate(updateObject.query, updateObject.toUpdate, { 'upsert': true })
    dataProcess.sendResponse('ok', 200, callback)
  } catch (err) {
    console.error('Ocurrió un error al actualizar la base de datos: \n %s', err)
    return dataProcess.sendResponse('databaseError', 500, callback) 
  }
}

module.exports.scheduledUpdate = (orders, callback) => {
  var bulkUpserts = []
  var length = orders.length
  if (length == 0) {
    console.log('No hay órdenes nuevas')
    return dataProcess.sendResponse('noNewOrders', 200, callback)
  }
  orders.forEach( async (order, i) => {
    var updateObject = prepareUpdate.makeUpdateObject(order)
    let upsertDoc = { 
      'updateOne': {
        'filter': updateObject.query,
        'update': updateObject.toUpdate,
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