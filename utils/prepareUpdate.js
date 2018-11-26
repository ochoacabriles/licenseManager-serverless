module.exports.makeUpdateObject = function(order) {
  var licenses = 0
  var updateObject = {}
  if ('line_items' in order) {
    order.line_items.forEach( (item) => {
      if ( item.sku == process.env.ITEM_SKU ) {
        licenses += item.quantity
      }
    })
  }
  updateObject.query = { 'orderNumber': order.order_number }
  updateObject.toUpdate = {
    orderNumber: order.order_number,
    email: order.email,
    licenses: licenses
  }
  return updateObject
}