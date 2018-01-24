'use strict';

require('mongoose').Promise = Promise; // fix the issue that mongoose promise doesn't have .catch
const mongoose = require('mongoose');
const Config = require('./dbConfig');
const Co = require('co');

// shortcut for upsert that does fire 'save' hook when create a new record
mongoose.__proto__.Model.upsert = function(conditions, params) {
    return Co(function*() {
        let object = yield this.findOneAndUpdate(conditions, {
            $set: params
        }, {
            runValidators: true,
            upsert: true,
            setDefaultsOnInsert: true,
            'new': true /* return the modified document */
        });

        // since mongoose doesn't run document hooks when upsert,
        // we have to do a redundant doc save to run the document hooks
        return yield object.save();
    }.bind(this));
};

module.exports = function() {
    if (!global.mongoose) {
        global.mongoose = mongoose;
        // global.mongoose.connect(Config.mongoUrl, {
        //     reconnectTries: Number.MAX_VALUE,
        //     autoReconnect: true
        // });
        var promise = global.mongoose.connect(Config.mongoUrl, {
          useMongoClient: true,
           reconnectTries: Number.MAX_VALUE,
           autoReconnect: true
          /* other options */
        });

    }

    return global.mongoose;
};