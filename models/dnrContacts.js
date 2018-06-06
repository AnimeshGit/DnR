var mongoose = require('./../libs/mongoose-connection')();
var Schema = mongoose.Schema;
var plugin = require('mongoose-createdat-updatedat');

// set up a mongoose model
var ContactsSchema = new Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    textMessage: {
        type: String,
        required: true
    }
});

ContactsSchema.plugin(plugin);
module.exports = mongoose.model('DnrContacts', ContactsSchema);