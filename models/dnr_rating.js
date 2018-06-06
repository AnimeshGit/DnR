var mongoose = require('./../libs/mongoose-connection')();
var Schema = mongoose.Schema;
var plugin = require('mongoose-createdat-updatedat');

var RatingSchema = new Schema({
   	rated_by:{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'DnR_User'
	},
	rated_to:{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'DnR_User'
	},
	is_rated:{
		type: Boolean,
		default: false
	},
	ratings	: Object
});
    
RatingSchema.plugin(plugin);
module.exports = mongoose.model('DnR_Rating', RatingSchema);