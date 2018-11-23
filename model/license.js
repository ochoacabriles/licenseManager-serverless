var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

require('dotenv').config()

var rigSchema = new Schema(
    {
        rigId: String,
        rigName: String,
        version: String
    }
)

var licenseSchema = new Schema(
    {
        orderNumber: String,
        email: String,
        licenses: Number,
        registeredRigs: [rigSchema]
    },
    {
        versionKey: false
    });
 
module.exports = mongoose.model('License', licenseSchema);