var mongoose = require('./../libs/mongoose-connection')();
var Schema = mongoose.Schema;
var plugin = require('mongoose-createdat-updatedat');

var DateSchema = new Schema({
    date_requester_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DnR_User'
    },
    date_receiver_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DnR_User'
    },
    request_send_date:{
        type: Date
    },
    request_accepted_date:{
        type: Date
    },
    date_request:{
        type:Boolean,
        default:false
    },
    date_accept:{
        type:Boolean,
        default:false
    },
    date_status: {
        type: String
    }
});

DateSchema.plugin(plugin);
module.exports = mongoose.model('DnR_Dates', DateSchema);