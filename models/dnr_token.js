var mongoose = require('./../libs/mongoose-connection')();
var Schema = mongoose.Schema;
//var bcrypt = require('bcrypt');
var plugin = require('mongoose-createdat-updatedat');

// set up a mongoose model
var TokenSchema = new Schema({
    token: {
        type: String,
        required: true
    },
    deviceType: {
        type: String
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DnR_User',
        required: true
    }
})

TokenSchema.plugin(plugin);

module.exports = mongoose.model('DnR_Tokens', TokenSchema);