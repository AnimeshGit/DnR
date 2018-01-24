var mongoose = require('./../libs/mongoose-connection')();
var Schema = mongoose.Schema;
var plugin = require('mongoose-createdat-updatedat');

var BlockedSchema = new Schema({
	blocked_by:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DnR_User'
	},
	blocked_to:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DnR_User'
	},
	is_blocked:{
        type: Boolean,
        default: false
	}
});

BlockedSchema.plugin(plugin);
module.exports = mongoose.model('DnR_Blocked', BlockedSchema);