var mongoose = require('./../libs/mongoose-connection')();
var Schema = mongoose.Schema;
var plugin = require('mongoose-createdat-updatedat');

// set up a mongoose model
var ListItems = new Schema({
    ethinicity: {
        type: [String]
    },
    relationship_status: {
        type: [String]
    },
    searching_for: {
        type: [String]
    },
    interests: {
        type: [String]
    },
    ratings:{
        type:[String]
    }
});

ListItems.plugin(plugin);
module.exports = mongoose.model('DnR_List', ListItems);