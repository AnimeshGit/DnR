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
        required: true
    },
    password: {
        type: String
    },
    photo: {
        type: String
    },
    about_user: {
        type: String
    },
    date_of_birth: {
        type: Date,
        default: Date.now
    },
    age: {
        type: String
    },
    show_age: {
        type: Boolean,
        default: false
    },
    show_searching_for: {
        type: Boolean,
        default: false
    },
    show_relationship_status: {
        type: Boolean,
        default: false
    },
    gender: {
        type: String
    },
    looking_for: {
        type: [String]
    },
    height: {
        type: Number
    },
    weight: {
        type: Number
    },
    ethnicity: {
        type: String
    },
    show_ethnicity: {
        type: Boolean,
        default: false
    },
    relationship_status: {
        type: [String]
    },
    interest: {
        type: [String]
    },
    location: {
        type: [Number]
    },
    unit_system: {
        type: String
    },
    searching_for: {
        type: [String]
    },
    notification_setting: {
        type: Boolean,
        default: false
    },
    distance_setting: {
        type: [String]
    },
    verify_email:{
        type: Boolean,
        default: false
    },
    is_upgrade: {
        type: Boolean,
        default: false
    },
    look_to_communicate: {
        type: String
    },
    facebookId: {
        type: String
    },
    deviceTokens: [{
        device_type: String,
        device_token: String
    }],
    login_type:{
        type:String
    },
    filter_setting:{
        looking_for:[String],
        age_range:String,
        online_now:Boolean,
        photos_only:Boolean,
        height_range:String,
        weight_range:String,
        ethnicity:[String],
        relationship_status:[String],
        searching_for:[String],
        likes:[String]
    },
    my_favorite_list: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DnR_User'
    }],
    my_block_list: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DnR_User'
    },
    my_dated_list: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DnR_User'
    },
    is_online: {
        type: Boolean,
        default: false
    },
    promocode:{
        type:String
    }
});

UserSchema.plugin(plugin);
module.exports = mongoose.model('DnR_User', UserSchema);