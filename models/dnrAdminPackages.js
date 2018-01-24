var mongoose = require('./../libs/mongoose-connection')();
var Schema = mongoose.Schema;
var plugin = require('mongoose-createdat-updatedat');

// set up a mongoose model
var PackagesSchema = new Schema({
    title: {
        type: String
    },
    tag: {
        type: String
    },
    price: {
        type: Number
    },
    duration: {
        type: Number
    }
});

PackagesSchema.plugin(plugin);

module.exports = mongoose.model('DnrAdminPackages', PackagesSchema);