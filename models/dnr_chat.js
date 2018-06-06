var mongoose = require('./../libs/mongoose-connection')();
var Schema = mongoose.Schema;
var plugin = require('mongoose-createdat-updatedat');

var ChatSchema = new Schema({
    sender_id:{
        type: String
    },
    receiver_id:{
        type: String
    },
    message:{
        type: String
    },
    time:{
        type: Date
    }
});

ChatSchema.plugin(plugin);
module.exports = mongoose.model('DnR_Chats', ChatSchema);