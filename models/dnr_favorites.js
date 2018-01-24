var mongoose = require('./../libs/mongoose-connection')();
var Schema = mongoose.Schema;
var plugin = require('mongoose-createdat-updatedat');

var FavoriteSchema = new Schema({
	favorite_by:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DnR_User'
	},
	favorite_to:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DnR_User'
	},
	is_favorite:{
        type: Boolean,
        default:false
	}
});

FavoriteSchema.plugin(plugin);
module.exports = mongoose.model('DnR_Favorite', FavoriteSchema);