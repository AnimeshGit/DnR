var mongoose = require('./../libs/mongoose-connection')();
var Schema = mongoose.Schema;
var plugin = require('mongoose-createdat-updatedat');

var RatingSchema = new Schema({
   	rating_by:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DnR_User'
	},
	rating_to:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DnR_User'
	},
	is_rated:{
        type: Boolean,
        default: false
	},
    ratings:{
        Sense_of_Humar: Number, 
        Good_listner: Number,
        Good_kisser: Number,
        Sense_of_fashion: Number,
        Kindness: Number,
        Generosity: Number,
        Spontaneuos: Number,
        Good_cook: Number,
        Passionate: Number,
        Manners: Number,
        Intellectual: Number,
        Compassion: Number
    }
    
RatingSchema.plugin(plugin);
module.exports = mongoose.model('DnR_Rating', RatingSchema);