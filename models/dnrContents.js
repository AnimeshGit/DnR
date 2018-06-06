var mongoose = require('./../libs/mongoose-connection')();
var Schema = mongoose.Schema;
var plugin = require('mongoose-createdat-updatedat');

// set up a mongoose model
var ContentSchema = new Schema({
    title: {
        type: String
    },
    description: {
        type: String
    },
    conType:{
        type:Number
    }
});

ContentSchema.plugin(plugin);
module.exports = mongoose.model('DnrAdminContent', ContentSchema);