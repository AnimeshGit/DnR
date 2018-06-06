var mongoose = require('./../libs/mongoose-connection')();
var Schema = mongoose.Schema;
var plugin = require('mongoose-createdat-updatedat');

// set up a mongoose model
var MessageSchema = new Schema({
    emailTemplate : [{
        emailSubject : String,
        emailBody : String,
        emailType : Number
    }],
    pushNotificationTemplate : [{
        pushTitle : String,
        pushBody : String,
        pushType : String
    }],
    pageContent : [{
        pageName : String,
        content : String
    }]

});

MessageSchema.plugin(plugin);
module.exports = mongoose.model('DnR_Message', MessageSchema);