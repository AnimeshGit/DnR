var mongoose = require('./../libs/mongoose-connection')();
var Schema = mongoose.Schema;
var plugin = require('mongoose-createdat-updatedat');

// set up a mongoose model
var TermsSchema = new Schema({
    title: {
        type: String
    },
    subject: {
        type: String
    },
    description: {
        type: String
    }
});

TermsSchema.plugin(plugin);

module.exports = mongoose.model('DnrAdminTerms', TermsSchema);