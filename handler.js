'use strict';
const activate = require('./handlers/activate');
const check = require('./handlers/check');
const deactivateOne = require('./handlers/deactivateOne');
const deactivateAll = require('./handlers/deactivateAll');
const getUpdate = require('./handlers/getUpdate');
const getDBUpdates = require('./handlers/getDBUpdates');

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
  getUpdate.run(event, context, callback)
}

module.exports.getDBUpdates = (event, context, callback) => {
  getDBUpdates.run(event, context, callback)
}