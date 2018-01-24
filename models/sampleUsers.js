var mongoose = require('./../libs/mongoose-connection')();
var Schema = mongoose.Schema;
var plugin = require('mongoose-createdat-updatedat');

// set up a mongoose model
var UserSchema = new Schema({
    fullname: {
        type: String
    },
    email: {
        type: String,
        unique: true
    },
    phoneNumber: {
        type: String,
        unique: true
    },
    dateOfBirth: {
        type: Date
    },
    age: {
        type: String
    },
    status: {
        type: Boolean,
        default: false
    }
});

UserSchema.plugin(plugin);
module.exports = mongoose.model('sampleUser', UserSchema);