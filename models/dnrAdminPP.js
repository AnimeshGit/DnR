var mongoose = require('./../libs/mongoose-connection')();
var Schema = mongoose.Schema;
var plugin = require('mongoose-createdat-updatedat');

// set up a mongoose model
var PPSchema = new Schema({
    title: {
        type: String
    },
    description: {
        type: String
    }
});

PPSchema.plugin(plugin);
module.exports = mongoose.model('DnrAdminPP', PPSchema);