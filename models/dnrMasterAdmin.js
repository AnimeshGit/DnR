var mongoose = require('./../libs/mongoose-connection')();
var Schema = mongoose.Schema;
var plugin = require('mongoose-createdat-updatedat');

// set up a mongoose model
var MasterSchema = new Schema({
    adminFirstName: {
        type: String
    },
    adminLastName: {
        type: String
    },
    adminEmail: {
        type: String
    },
    adminPassword: {
        type: String
    }
});

MasterSchema.plugin(plugin);

module.exports = mongoose.model('DnrMasterAdmin', MasterSchema);