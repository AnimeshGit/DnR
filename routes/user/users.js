var express = require('express');
var router = express.Router();
var User = require(appRoot + '/models/dnr_users');
var Token = require(appRoot + '/models/dnr_token');

var config = require(appRoot + '/libs/config');

var mailFunction = require(appRoot + '/libs/email_helper');

var jwt = require('jsonwebtoken');
var jwtAuth = require(appRoot + '/libs/jwtAuth');
var randomString = require('randomstring');
var _ = require('lodash');
var fileUpload = require(appRoot + '/libs/fileupload');
var fs = require("fs");
var async = require("async");
var ObjectId = require('mongoose').Types.ObjectId;
var getImage = 'uploads/users/';
var userImage = '/public/uploads/users/';
bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);
var email_msgs = require(appRoot + '/message.json');
 
const CONSTANTS = require(appRoot + '/Constants/constant');

/*
 * User Singup
 * created by - AniMesh;
 * created on - 7th Nov 2017;
 */
router.post('/signup', function(req, res, next) {
    // console.log(req.body)
    // return
    var email = req.body.email;
    var password = req.body.password;
    // var promocode = req.body.promocode;

    var device = deviceType = "ANDROID";
    var deviceToken = "qaz123wsx456edc789rfv";
    var newUser;

    if (!req.body.email || !req.body.password) {
        res.json({
            success: false,
            msg: 'Please fill all Details.'
        });
        return;
    }else{
        if (req.body.email || req.body.phoneNumber) {

            var deviceData={};
            let tmpArr = [];
            deviceData.device_type = deviceType;
            deviceData.device_token = deviceToken;
            if(req.body.latitude && req.body.longitude){
                tmpArr.push(req.body.latitude);
                tmpArr.push(req.body.longitude);
            }

            User.findOne({
                    'email': email.toLowerCase()
            }).then(function(userData) {

                if (userData == null || userData == '') {
                    password = bcrypt.hashSync(req.body.password, salt);
                    newUser = new User({
                        login_type: "Normal",
                        password: password,
                        fullname:"",
                        gender:"",
                        photo:"",
                        about_user:"",
                        date_of_birth:req.body.date_of_birth,
                        email: email.toLowerCase(),
                        location : tmpArr
                    });
                    
                    newUser.deviceTokens = [];
                    newUser.deviceTokens.push(deviceData);
                    
                    newUser.save(function(err, data) {

                        if (err) {
                            res.send({
                                success: false,
                                msg: 'Username already exists.'
                            });
                        } else {
                            var text = email_msgs.congo +'\n\n'+
                                       email_msgs.signup_success.signup_body;
                            var subject = email_msgs.signup_success.signup_title;
                            
                            config.sendMail(req.body.email.toLowerCase(), text, subject).then(function(error,result) {
                                if (error) {
                                    console.log(error);
                                }
                            });
                                var tokenData = {
                                    username: data.email,
                                    timestamp: config.currentTimestamp,
                                    id: data._id
                                };
                                var generatedToken = jwt.sign(tokenData, config.secret);
                                
                                Token.findOne({
                                    userId: data._id
                                }).then(function(userInfo) {
                                    if (userInfo == null) {
                                        var newToken = new Token({
                                            userId: data._id,
                                            token: generatedToken,
                                            deviceType: device
                                        });
                                        newToken.save(function(error, info) {
                                            if (error) {
                                                res.json({
                                                    success: false,
                                                    msg: "Failed to add token"
                                                })
                                            } else {
                                               var createdUser = {
                                                'userId': data._id,
                                                'email': data.email,
                                                'login_type': data.login_type,
                                                'token': info.token
                                                };
                                                res.json({
                                                    success: true,
                                                    msg: 'Welcome to DnR!!',
                                                    data: createdUser
                                                });
                                                return;
                                            }
                                        });
                                    } else {
                                         res.json({
                                            success: false,
                                            msg: "User token already exist"
                                        });
                                        return;
                                       // res.json("User token already exist");
                                        //return;
                                    }
                                });
                             
                        }
                    }).catch(function(error) {
                         res.json({
                            success: false,
                            msg: "User registration failed"
                        });
                        return;
                       // res.send("User registration failed");
                        //return;
                    })
                } else {
                    res.json({
                        success: false,
                        msg: "Email id is already exist"
                    });
                    return;
                }
            })
        }else{
            res.json({
                success: false,
                msg: "Please enter email"
            });
            return;
        }
    }
});

/*
 * User Login
 * created by - Aniket Meshram;
 * created on - 8th Nov 2017;
 */
router.post('/login', function(req, res, next) {
    var password = req.body.password;
    var email = req.body.email;
    var is_online1 = "true";
    var device = deviceType = "ANDROID";
    var deviceToken = "qaz123wsx456edc789rfv";
    User.findOne({
        'email': email.toLowerCase()
    }).then(function(userData) {
        
        if (userData != null) {
            if(bcrypt.compareSync(req.body.password, userData.password)){
                if (deviceToken!=undefined) {
                    //--------------
                    var flag=1;
                    if(userData.deviceTokens)
                    {
                        async.forEach(userData.deviceTokens,function (item,callback) {
                            if(item.device_token == deviceToken)
                            {
                                flag=0;
                            }
                            callback();
                        },function(){

                            if(flag==1){

                                var deviceData={};
                                deviceData.device_type = deviceType;
                                deviceData.device_token = deviceToken;                                        
                                userData.deviceTokens.push(deviceData);
                            }
                        });
                    }else{

                        var deviceData={};
                        deviceData.device_type = deviceType;
                        deviceData.device_token = deviceToken;                                        
                        userData.deviceTokens.push(deviceData);
                    }
                }
                var tokenData = {
                    username: userData.email,
                    timestamp: config.currentTimestamp,
                    id: userData._id
                };
                var generatedToken = jwt.sign(tokenData, config.secret);
                Token.findOne({
                    userId: userData._id
                }).populate('userId').then(function(userInfo) {

                    User.findOneAndUpdate({
                        _id: userData._id
                    }, {
                        $set: {
                            'login_type': "Normal",
                            'is_online': true
                        }
                    }, {
                        'new': true
                    }, function(err, data) {
                        if (userInfo == null) {
                            var newToken = new Token({
                                userId: userData._id,
                                token: generatedToken,
                                deviceType: device
                            });
                            newToken.save(function(error, info) {
                                //------------
                                if (deviceToken != undefined) {
                                    
                                    var updatedUserData = _.merge(userData, userData);
                                   
                                    // updatedUserData.save(function(err, data) {
                                    //     // console.log("deviceToken@loginByEmail->"+data);
                                    // })
                                } 
                                //------------------
                                 if (userData.photo) {
                                    
                                    if (userData.photo != null && userData.photo != "" && userData.photo != undefined) {
                                        var picture = CONSTANTS.baseUrl + getImage + userData.photo;
                                        userData.photo = picture;
                                    }
                                }
                                    
                                if (userData.unit_system==""||userData.unit_system=="Imperial") {
                                   
                                    if(userData.height!=""&&userData.height!=undefined&&userData.height!=null){
                                        converted_height = userData.height * 0.3937;
                                        userData.height = converted_height.toFixed(2);
                                    }        
                                    if(userData.weight!=""&&userData.weight!=undefined&&userData.weight!=null){
                                        converted_weight = userData.weight * 2.2046;
                                        userData.weight = converted_weight.toFixed(2);
                                    }
                                };
                                
                                
                                var userGeneratedToken = {
                                    'userId': info.userId,
                                    'token': info.token,
                                    'email': userData.email,
                                    'is_online': data.is_online,
                                    'latitude': data.latitude,
                                    'longitude': data.longitude,
                                    'login_type': data.login_type,
                                    'stripe_customer_id'  :userData.stripe_customer_id,
                                    'is_upgrade': userData.is_upgrade,
                                    'fullname' : userData.fullname,
                                    'gender' : userData.gender,
                                    'about_user' : userData.about_user,
                                    'distance_setting' : userData.distance_setting,
                                    'show_ethnicity' : userData.show_ethnicity,
                                    'interest' : userData.interest,
                                    'rating' : userData.rating,
                                    'age' : userData.age,
                                    'date_of_birth' : userData.date_of_birth,
                                    'show_age' : userData.show_age,
                                    'show_searching_for' : userData.show_searching_for,
                                    'show_relationship_status' : userData.show_relationship_status,
                                    'height':userData.height,
                                    'weight':userData.weight,
                                    'unit_system':userData.unit_system,
                                    'ethnicity':userData.ethnicity,
                                    'relationship_status':userData.relationship_status,
                                    'photo' : userData.photo
                                };
                                                               
                                
                                if (error) {
                                    res.json({
                                        success: false,
                                        msg: "Failed to save token"
                                    });
                                    return;
                                    //res.send("Failed to save token");
                                } else {
                                	
                                    res.json({
                                        success: true,
                                        msg: "Login successfully",
                                        data: userGeneratedToken
                                    });
                                    return;
                                }
                            })
                        } else {
                            //------------
                            if (deviceToken != undefined) {
                                var updatedUserData = _.merge(userData, userData);
                                updatedUserData.save(function(err, data) {
                                    // console.log("deviceToken@loginByEmail->"+data);
                                })
                            } 
                            //------------------

                         
                            
                            var userUpdatedToken = {
                                'userId': userInfo.userId._id,
                                'token': userInfo.token,
                                'email': userInfo.userId.email,
                                'is_online': data.is_online,
                                'stripe_customer_id'  :data.stripe_customer_id,
                                'is_upgrade' : data.is_upgrade,
                                'fullname' : data.fullname,
                                'gender' : data.gender,
                                'about_user' : data.about_user,
                                'distance_setting' : data.distance_setting,
                                'show_ethnicity' : data.show_ethnicity,
                                'interest' : data.interest,
                                'rating' : data.rating,
                                'age' : data.age,
                                'date_of_birth' : data.date_of_birth,
                                'show_age' : data.show_age,
                                'show_searching_for' : data.show_searching_for,
                                'show_relationship_status' : data.show_relationship_status,
                                'height':data.height,
                                'weight':data.weight,
                                'unit_system':data.unit_system,
                                'ethnicity':data.ethnicity,
                                'relationship_status':data.relationship_status,
                                'photo' : data.photo,
                                'login_type' : data.login_type
                            };
                          
                            res.json({
                                success: true,
                                msg: "Login successfully",
                                data: userUpdatedToken
                            });
                            return;
                        }
                    });
                })
            } else {
                res.json({
                    success: false,
                    msg: "Please enter correct password"
                });
                return;
            }
        } else {
            res.send({
                success: false,
                msg: 'User not found with entered mail id.'
            });
            return;
        }
    }).catch(function(error){ console.log(error,"login error"); })
});

/*
 * User social signup
 * created by - Aniket Meshram
 * created on - 9th Nov 2017;
 */
router.post('/socialSignup', function(req, res, next) {
    // console.log(req.body)
    var facebookId = req.body.facebookId;
    var email = req.body.email;
    var fullname = req.body.fullName;
    var gender = req.body.gender;//newly added
    var device = deviceType = "ANDROID";
    var deviceToken = "qaz123wsx456rfv789";

    User.findOne({
        $and: [{
            'email': email.toLowerCase()
        }, {
            'facebookId': req.body.facebookId
        }]
    }).then(function(userData) {
        
        // console.log(userData)
        // return
        var deviceData={};
        deviceData.device_type = deviceType;
        deviceData.device_token = deviceToken;

        if (userData!= null && userData != '') {
            // Login

            var tokenData = {
                username: userData.email,
                timestamp: config.currentTimestamp,
                id: userData._id
            };

            //var secret = new Buffer(config.secret, "base64").toString();
            var generatedToken = jwt.sign(tokenData, config.secret);

            Token.findOne({
                userId: userData._id
            }).then(function(userInfo) {

                if (userInfo == null) {
                    
                    var newToken = new Token({
                        userId: userData._id,
                        token: generatedToken,
                        deviceType: "ANDROID"
                    });
            
                    newToken.save(function(error, info) {
                        
                        if (error) {
                            console.log(error)
                            res.json({
                                success: false,
                                msg: "Failed to add token"
                            })
                        } else {
                           
                            
                            var userGeneratedToken = {
                                    'userId': userData.userId,
                                    'token': userData.token,
                                    'email': userData.email,
                                    'is_online': userData.is_online,
                                    'latitude': userData.latitude,
                                    'longitude': userData.longitude,
                                    'login_type': userData.login_type,
                                    'stripe_customer_id'  :userData.stripe_customer_id,
                                    'is_upgrade': userData.is_upgrade,
                                    'fullname' : userData.fullname,
                                    'gender' : userData.gender,
                                    'about_user' : userData.about_user,
                                    'distance_setting' : userData.distance_setting,
                                    'show_ethnicity' : userData.show_ethnicity,
                                    'interest' : userData.interest,
                                    'rating' : userData.rating,
                                    'age' : userData.age,
                                    'date_of_birth' : userData.date_of_birth,
                                    'show_age' : userData.show_age,
                                    'show_searching_for' : userData.show_searching_for,
                                    'show_relationship_status' : userData.show_relationship_status,
                                    'height':userData.height,
                                    'weight':userData.weight,
                                    'unit_system':userData.unit_system,
                                    'ethnicity':userData.ethnicity,
                                    'relationship_status':userData.relationship_status,
                                    'photo' : userData.photo,
                                    'facebookId': userData.facebookId,
                                    'login_type': "facebook",
                                    'token': info.token
                                };

                            res.json({
                                success: true,
                                msg: "User login successfully with facebookId",
                                data: userGeneratedToken
                            });
                            return;
                        }
                    });

                } else {
                    
                     res.json({
                    'success': false,
                    'msg': "user token already exist"
                });
                return;
                }
            });

        } else {
            
            //SignUp

            var user = new User({
                'fullname': fullname,
                'email': email.toLowerCase(),
                'facebookId': req.body.facebookId,
                'gender': req.body.gender,
                'login_type': "facebook",
                'is_online': true
            });
            //------------
            //save device tokens in user table
            user.deviceTokens = [];
            user.deviceTokens.push(deviceData);
            //--------------
            user.save(function(err, data) {
                if (data) {
                    var tokenData = {
                        username: data.email,
                        timestamp: config.currentTimestamp,
                        id: data._id
                    };
                    //var secret = new Buffer(config.secret, "base64").toString();
                    var generatedToken = jwt.sign(tokenData, config.secret);
                    
                    Token.findOne({
                        userId: data._id
                    }).then(function(userInfo) {
                        
                        if (userInfo == null) {
                            var newToken = new Token({
                                userId: data._id,
                                token: generatedToken,
                                deviceType: "ANDROID"
                            });
                            
                            newToken.save(function(error, info) {
                                
                                if (error) {
                                    res.json({
                                        success: false,
                                        msg: "Failed to add token"
                                    })
                                } else {
                                   
                                     var userGeneratedToken = {
                                    'userId': data.userId,
                                    'token': data.token,
                                    'email': data.email,
                                    'is_online': data.is_online,
                                    'latitude': data.latitude,
                                    'longitude': data.longitude,
                                    'login_type': data.login_type,
                                    'stripe_customer_id'  :data.stripe_customer_id,
                                    'is_upgrade': data.is_upgrade,
                                    'fullname' : data.fullname,
                                    'gender' : data.gender,
                                    'about_user' : data.about_user,
                                    'distance_setting' : data.distance_setting,
                                    'show_ethnicity' : data.show_ethnicity,
                                    'interest' : data.interest,
                                    'rating' : data.rating,
                                    'age' : data.age,
                                    'date_of_birth' : data.date_of_birth,
                                    'show_age' : data.show_age,
                                    'show_searching_for' : data.show_searching_for,
                                    'show_relationship_status' : data.show_relationship_status,
                                    'height':data.height,
                                    'weight':data.weight,
                                    'unit_system':data.unit_system,
                                    'ethnicity':data.ethnicity,
                                    'relationship_status':data.relationship_status,
                                    'photo' : data.photo,
                                    'facebookId': data.facebookId,
                                    'login_type': "facebook",
                                    'token': info.token
                                };
                                    console.log("=>>",userGeneratedToken)
                                    res.json({
                                        success: true,
                                        msg: 'User created successfully with facebookId.',
                                        data: userGeneratedToken
                                    });
                                    return;
                                }
                            });
                        } else {
                            res.json({
                                'success': false,
                                'msg': "user token already exist"
                            });
                            return;
                            
                        }
                    });
                } else {
                    console.log(err);
                    res.json({
                        'success': false,
                        'msg': "User signup failed through facebookId"
                    });
                    return;
                }
            })

        }
    })

})

/*
 * Login from facebook or google 
 * created by - Aniket Meshram
 * created on - 9th Nov 2017;
*/
router.post('/socialLogin', function(req, res, next) {
    var device = deviceType = "ANDROID";
    var deviceToken = "qaz123wsx456rfv789";
    
    if (req.body.facebookId != null) {
        User.findOne({
            'facebookId': req.body.facebookId
        }).then(function(userData) {
            if (userData) {
                var flag=1;
                if(userData.deviceTokens)
                {
                    async.forEach(userData.deviceTokens,function (item,callback) {
                        if(item.device_token == deviceToken)
                        {
                            flag=0;
                        }
                        callback();
                    },function(){
                        if(flag==1){
                            var deviceData={};
                            deviceData.device_type = deviceType;
                            deviceData.device_token = deviceToken;                                        
                            userData.deviceTokens.push(deviceData);
                        }
                    });
                }else{
                    var deviceData={};
                    deviceData.device_type = deviceType;
                    deviceData.device_token = deviceToken;                                        
                    userData.deviceTokens.push(deviceData);
                }
                
                Token.findOne({
                    'userId': userData._id
                }).populate('userId').then(function(userInfo) {
                    
                    User.findOneAndUpdate({
                            _id: userData._id
                        }, {
                            $set: {
                                'login_type': "facebook"                                
                            }
                        }, {
                            'new': true
                        }, function(err, data1) {
                           
                        if (userInfo) {
                            // if (userInfo.userId.distance_setting.length) {
                            //     if (userInfo.userId.photo != null || userInfo.userId.photo != "") {
                            //         var picture = CONSTANTS.baseUrl + getImage + userInfo.userId.photo;
                            //         userInfo.userId.photo = picture;
                            //     }
                            // }
                            var userToken = {
                                'userId': userInfo.userId._id,
                                'token': userInfo.token,
                                'fullName': userInfo.userId.fullname,
                                'email': userInfo.userId.email,
                                'is_online': userData.is_online,
                                'gender': userInfo.userId.gender
                            };
                            //-------------------
                            var updatedUserData = _.merge(userData, userData);
                            
                            updatedUserData.save(function(err, data) {
                                // console.log("updatedTokenData"+data);
                            })
                            //------------

                            if (userData.photo) {
                                    if (userData.photo != null && userData.photo != "" && userData.photo != undefined) {
                                        var picture = CONSTANTS.baseUrl + getImage + userData.photo;
                                        userData.photo = picture;
                                    }
                                }
                                    
                                if (userData.unit_system==""||userData.unit_system=="Imperial") {
                                    console.log("Imperial")
                                    if(userData.height!=""&&userData.height!=undefined&&userData.height!=null){
                                        converted_height = userData.height * 0.3937;
                                        userData.height = converted_height.toFixed(2);
                                    }        
                                    if(userData.weight!=""&&userData.weight!=undefined&&userData.weight!=null){
                                        converted_weight = userData.weight * 2.2046;
                                        userData.weight = converted_weight.toFixed(2);
                                    }
                                };
                                var userGeneratedToken = {
                                    'userId': userData.userId,
                                    'token': userData.token,
                                    'email': userData.email,
                                    'is_online': userData.is_online,
                                    'latitude': userData.latitude,
                                    'longitude': userData.longitude,
                                    'login_type': userData.login_type,
                                    'stripe_customer_id'  :userData.stripe_customer_id,
                                    'is_upgrade': userData.is_upgrade,
                                    'fullname' : userData.fullname,
                                    'gender' : userData.gender,
                                    'about_user' : userData.about_user,
                                    'distance_setting' : userData.distance_setting,
                                    'show_ethnicity' : userData.show_ethnicity,
                                    'interest' : userData.interest,
                                    'rating' : userData.rating,
                                    'age' : userData.age,
                                    'date_of_birth' : userData.date_of_birth,
                                    'show_age' : userData.show_age,
                                    'show_searching_for' : userData.show_searching_for,
                                    'show_relationship_status' : userData.show_relationship_status,
                                    'height':userData.height,
                                    'weight':userData.weight,
                                    'unit_system':userData.unit_system,
                                    'ethnicity':userData.ethnicity,
                                    'relationship_status':userData.relationship_status,
                                    'photo' : userData.photo,

                                };
                            res.json({
                                success: true,
                                msg: "User login successfully with facebookId",
                                data: userToken
                            });
                            return;
                        } else {
                             var tokenData = {
                                username: userData.email,
                                timestamp: config.currentTimestamp,
                                id: userData._id
                            };
                            var generatedToken = jwt.sign(tokenData, config.secret);
                            var newToken = new Token({
                                userId: userData._id,
                                token: generatedToken,
                                deviceType: device
                            });
                            newToken.save(function(error, info) {
                               if (userData.photo) {
                                    if (userData.photo != null && userData.photo != "" && userData.photo != undefined) {
                                        var picture = CONSTANTS.baseUrl + getImage + userData.photo;
                                        userData.photo = picture;
                                    }
                                }
                                    
                                if (userData.unit_system==""||userData.unit_system=="Imperial") {
                                    console.log("Imperial")
                                    if(userData.height!=""&&userData.height!=undefined&&userData.height!=null){
                                        converted_height = userData.height * 0.3937;
                                        userData.height = converted_height.toFixed(2);
                                    }        
                                    if(userData.weight!=""&&userData.weight!=undefined&&userData.weight!=null){
                                        converted_weight = userData.weight * 2.2046;
                                        userData.weight = converted_weight.toFixed(2);
                                    }
                                };
                                var userGeneratedToken = {
                                    'userId': info.userId,
                                    'token': info.token,
                                    'email': userData.email,
                                    'is_online': data1.is_online,
                                    'latitude': data1.latitude,
                                    'longitude': data1.longitude,
                                    'login_type': data1.login_type,
                                    'stripe_customer_id'  :userData.stripe_customer_id,
                                    'is_upgrade': userData.is_upgrade,
                                    'fullname' : userData.fullname,
                                    'gender' : userData.gender,
                                    'about_user' : userData.about_user,
                                    'distance_setting' : userData.distance_setting,
                                    'show_ethnicity' : userData.show_ethnicity,
                                    'interest' : userData.interest,
                                    'rating' : userData.rating,
                                    'age' : userData.age,
                                    'date_of_birth' : userData.date_of_birth,
                                    'show_age' : userData.show_age,
                                    'show_searching_for' : userData.show_searching_for,
                                    'show_relationship_status' : userData.show_relationship_status,
                                    'height':userData.height,
                                    'weight':userData.weight,
                                    'unit_system':userData.unit_system,
                                    'ethnicity':userData.ethnicity,
                                    'relationship_status':userData.relationship_status,
                                    'photo' : userData.photo
                                };
                                
                                
                                if (error) {
                                    res.json({
                                        success: false,
                                        msg: "Failed to save token"
                                    });
                                    return;
                                    //res.send("Failed to save token");
                                } else {
                                    res.json({
                                        success: true,
                                        msg: "Login successfully",
                                        data: userGeneratedToken
                                    });
                                    return;
                                }
                            })
                         
                        }
                    });
                }).catch(function(error) {
                    res.json({
                        'success': false,
                        'msg': "Something went wrong getting user token"
                    });
                    return;
                })
            } else {
                res.json({
                    'success': false,
                    'msg': "User need to signup and then login with this facebookId"
                });
                return;
            }
        })
    }
})

/*
 * User logout from app
 * created by - Aniket Meshram
 * created on - 9th Nov 2017;
*/
router.post('/logout', function(req, res, next) {
    var userId = req.body.userId;
    
    var Device_Token = req.body.DeviceToken; 
    User.findOne({
        '_id': userId
    }).then(function(userData) {
        console.log(userData);
        if (userData != null) {
            //--------------
            if (Device_Token!=undefined && Device_Token!=null && Device_Token!="") {
                var flag=1;
                if(userData.deviceTokens)
                {
                    async.forEach(userData.deviceTokens,function (item,callback) {
                        // console.log("item.device_token->"+item.device_token);

                        if(item.device_token == Device_Token)
                        {
                            flag=0;
                            userData.deviceTokens.splice(userData.deviceTokens.indexOf(item),1);
                        }
                        callback();
                    },function(){
                        if(flag==1){
                            var deviceData={};
                            deviceData.device_type = userData.deviceTokens.deviceType;
                            deviceData.device_token = userData.deviceTokens.deviceToken; 
                            userData.deviceTokens.push(deviceData);
                        }
                    });
                }
            }
            //------------
            Token.findOneAndRemove({
                'userId': userId
            }).then(function(userTokenInfo) {

                if (Device_Token!=undefined && Device_Token!=null && Device_Token!="") {
                    
                    var logOutData = _.merge(userData, userData);
                    logOutData.save(function(err, data) {
                        // console.log("logOutData"+data);
                    })
                }

                User.findOneAndUpdate({
                            _id: userData._id
                        }, {
                            $set: {
                                'is_online': false
                            }
                        }, {
                            'new': true
                        }, function(err, data1) {
                            // console.log("updated->"+data);

                    // if (userTokenInfo != null) {
                        res.json({
                            'success': true,
                            'msg': "User logout successfully",
                            'data' : data1
                        })
                    // } else {
                    //     res.json({
                    //         'success': false,
                    //         'msg': "User dont have token"
                    //     });
                    //     return;
                    // }
                });
            }).catch(function(error) {
                res.json({
                    'success': false,
                    'msg': "Token not exist in dnr_token on user logout"
                });
                return;
            })
        } else {
            res.json({
                'success': false,
                'msg': "User id is not exists"
            });
            return;
        }
    }).catch(function(error){
        res.json({
            'success': true,
            'msg': "Invalid userId"
        });
        return;
    });
})

/*
 * Delete User Profile
 * created by - Aniket Meshram;
 * created on - 13th Nov 2017;
 */
router.post('/delete_account', function(req,res,next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        User.findOneAndRemove({
            '_id':req.body.userId
        }).then(function(deleted_data) {

            var userImage = deleted_data.photo;

            if (userImage != '') {
                if (fs.existsSync('./public/uploads/users/' + userImage)) {
                    //Delete hospital_logo from folder
                    fs.unlink('./public/uploads/users/' + userImage);
                    // console.log("deleted")
                }
            }

            var text = 'Hey There \n\n'+
                                       email_msgs.delete_account.delete_body;
            var subject = email_msgs.delete_account.delete_title;
            
            config.sendMail(deleted_data.email.toLowerCase(), text, subject).then(function(error,result) {
                if (error) {
                    console.log(error);
                }
            });
            if (deleted_data) {


                Token.findOneAndRemove({
                    'userId': req.body.userId
                }).then(function(userTokenInfo) {
                    if (userTokenInfo) {
                        res.json({
                            success:true,
                            msg:'User account successfully deleted'
                        });
                        return;
                    } else {
                        res.json({
                            success:true,
                            msg:'token not found'
                        });
                        return;
                    }
                }).catch(function(error) {
                    res.json({
                            success:true,
                            msg:'User account successfully deleted'
                    });
                    return;
                })
            } else {
                res.json({
                    success:false,
                    msg:'user already deleted'
                });
                return;
            };
        }).catch(function(error) {
            res.json({
                success:false,
                msg:'Please enter valid userId'
            });
            return;
        })
    }).catch(function(error) {
        res.json({
            success:false,
            msg:"Authentication failed",
            authStatus  :1
        });
        return;
    })
})

/*
 * Forget Password
 * created by - Aniket Meshram;
 * created on - 14th Nov 2017;
 */
router.post('/forgetPassword', function(req, res, next) {
    var email = req.body.email.toLowerCase();
    // console.log(email)
    var randomPassword;
    User.findOne({
        'email': email.toLowerCase()
    }).then(function(userData) {
        // console.log("=>",userData)
        if (userData) {
            randomPassword = randomString.generate(8);
            // randomPassword = "qaz123wsx";
            // randomPassword = Math.floor(1000 + Math.random() * 9000);
            // console.log("randomPassword=>" + randomPassword);
            User.findOneAndUpdate({
                '_id': userData._id
            }, {
                $set: {
                    // bcrypt.hashSync(req.body.password, salt);
                    password : bcrypt.hashSync(randomPassword, salt),
                    // oneTimePassword: true,
                    updatedAt: config.currentTimestamp
                }
            }, {
                'new': true
            }).then(function(updatedUserData) {
        
                // console.log("=>",updatedUserData)
        
                if (updatedUserData) {

                    var text = 'You are receiving this because you ' +
                        'have requested reset of ' +
                        'password for your account.\n\n Your new password' +
                        ' is ' + randomPassword;
                    var subject = 'Password Reset Notification';

                    // config.sendMail(req.body.email.toLowerCase(), text, subject).then(function(result, error) {
                    mailFunction.sendMail(subject, text, email,function(error,result) {
                        if (error) {
                            console.log(error);
                            res.json({
                            success: false,
                            msg: 'Something went wrong, password reset failed'
                        });
                        return;
                        }
                        res.json({
                            success: true,
                            msg: 'Notification sent to your ' +
                                'registered email ID.'
                        });
                        return;
                    });
                   
                }else{
                    res.json({
                        success: false,
                        msg: 'Something went wrong, password reset failed'
                    });
                    return;
                }
            }).catch(function(error) {
                console.log(error)
                res.json({
                    success: false,
                    msg: 'Something went wrong, password reset failed'
                });
                return;
            })
        } else {
            res.json({
                success: false,
                msg: "Email Id not found"
            });
            return;
        }
    }).catch(function(error) {
        console.log(error)
        res.json({
            success: false,
            msg: 'Please enter valid mail id'
        });
        return;
    });
})

/*
 * Change Password
 * created by - Aniket Meshram;
 * created on - 14th Nov 2017;
 */
router.post('/changePassword', function(req, res, next) {
    var password = req.body.newPassword;
    var newPassword = req.body.confirmNewPassword;
    var userId = req.body.userId;
    var password = req.body.password;

    if (!password || !req.body.newPassword || !req.body.confirmNewPassword || req.body.newPassword == undefined || req.body.confirmNewPassword == undefined) {
        res.json({
            success: false,
            msg: 'Please enter new password or confirm new password'
        })
    }
    if (req.body.newPassword != req.body.confirmNewPassword) {
        res.json({
            success: false,
            msg: 'New password and confirm new password should be same'
        })
    }
    
        User.findOne({
            '_id': userId
        }).exec().then(function(userData) {
            
            if (bcrypt.compareSync(password, userData.password)) {
            
            var hash_password = bcrypt.hashSync(newPassword, salt);
            if (userData) {
                    User.findOneAndUpdate({
                        _id: userData._id
                    }, {
                        $set: {
                            // password: config.encrypt(newPassword),
                            password: hash_password,
                            // oneTimePassword: false,
                            updatedAt: config.currentTimestamp
                        }
                    }, {
                        'new': true
                    }).then(function(updatedUserData) {
                        if (updatedUserData) {
                            res.json({
                                success: true,
                                msg: 'Password reset successfully'
                            })
                        } else {
                            res.json({
                                success: false,
                                msg: 'Password reset failed'
                            })
                        }
                    }).catch(function(error) {
                        res.send("Somthing went wrong in reset password");
                    })
            } else {
                res.json({
                    success: false,
                    msg: "User not found with user id"
                })
            }
        }
        else
        {
            res.json({
                success: false,
                msg: "Please enter current password correctly"
            });
        }
        }).catch(function(error) {
            console.log(error);
            res.json({
                success: false,
                msg: "Please enter userId"
            });
        })
})
/*
 * Get User Information
 * created by - Aniket Meshram;
 * created on - 14th Nov 2017;
 */
router.post('/getUser', function(req, res, next) {
    var token = req.headers['accesstoken'];
    console.log('in Function');
    jwtAuth.checkAuth(token).then(function(result) {
        var userId = req.body.userId;
        
        User.findOne({
            '_id': userId
        }).then(function(userData) {
            if (userData) {
        
                if (userData.photo) {
                    if (userData.photo != null && userData.photo != "" && userData.photo != undefined) {
                        var picture = CONSTANTS.baseUrl + getImage + userData.photo;
                        userData.photo = picture;
                    }
                }
                    
                if (userData.unit_system==""||userData.unit_system=="Imperial") {
                    console.log("Imperial")
                    if(userData.height!=""&&userData.height!=undefined&&userData.height!=null){
                        converted_height = userData.height * 0.3937;
                        userData.height = converted_height.toFixed(2);
                    }        
                    if(userData.weight!=""&&userData.weight!=undefined&&userData.weight!=null){
                        converted_weight = userData.weight * 2.2046;
                        userData.weight = converted_weight.toFixed(2);
                    }
                };
    
                userData = userData.toObject();
                delete userData.password;
                res.json({
                    success: true,
                    msg: "Fetched user record successfully",
                    data: userData
                });
            } else {
                res.json({
                    success: false,
                    msg: "Failed to get user record"
                });
                return;
            }
        }).catch(function(error) {
            console.log(error);
            res.json({
                success: false,
                msg: "Please enter valid userId"
            });
            return;
        })
    }).catch(function(error) {
        res.json({
            success: false,
            msg: "Authentication failed",
            authStatus  :1
        });
        return;
    })
})

/*
 * Edit User Profile
 * created by - Aniket Meshram;
 * created on - 10th Nov 2017;
 */
router.post('/editProfile', function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        console.log(req.body)
    
        var userId = req.body.userId;

        var calculate_age = function(birth_month, birth_day, birth_year) {
            return new Promise(function(resolve, reject) {
                var today_date = new Date();
                var today_year = today_date.getFullYear();
                var today_month = today_date.getMonth();
                var today_day = today_date.getDate();
                var age = today_year - birth_year;
                if (today_month < (birth_month - 1)) {
                    age--;
                }
                if (((birth_month - 1) == today_month) && (today_day < birth_day)) {
                    age--;
                }
                resolve(age);
            })
        }
        if (req.body.date_of_birth != null || req.body.date_of_birth != undefined) {
            var dob = req.body.date_of_birth.split('T');
            var splitDob = dob[0].split('-');
            calculate_age(splitDob[1], splitDob[2], splitDob[0]).then(function(userCalculateAge) {
                var userAge = userCalculateAge;
                req.body.age = parseInt(userAge);
            });
        }

        if (req.body.email != req.body.confirmemail) {
            res.json({
                success: false,
                msg: 'New email and confirm new email should be same'
            })
        }
        console.log(userId);
        User.findOne({
            '_id': userId
        }).then(function(userInfo) {
            console.log("data from db",userInfo);
            if (userInfo) {

                filter_setting = {};
                filter_setting.looking_for = req.body.looking_for;
                
                req.body.filter_setting = filter_setting;
                
                if(req.body.height && userInfo.unit_system=='Imperial'){
                    var height = req.body.height.split("'");                  
                    let centimeter=0;
                    if(height[0]){
                       centimeter = height[0] * 30.48;
                    }
                    if(height[1]){
                        centimeter+=height[1] * 2.54;
                    }                    
                    req.body.height = centimeter;
                }
                if(req.body.weight && userInfo.unit_system=='Imperial'){
                    req.body.weight = req.body.weight * 0.453592;
                }


               
                var updatedUser = _.extend(userInfo, req.body);
                // _.extend(userInfo, req.body);
                // delete updatedUser.password;
                // console.log("merge data",updatedUser)
                updatedUser.save(function(err, output) {
                     console.log("saved data",output);
                    if (err) {
                        res.json({
                            success: false,
                            msg: "Failed to update and add user data"
                        });
                        return;
                    } else {

                        if (output.unit_system==""||output.unit_system=="Imperial") {
                            //console.log("Imperial")
                            if(output.height!=""&&output.height!=undefined&&output.height!=null){
                                converted_height = req.body.height;
                                output.height = converted_height.toFixed(2);
                            }        
                            if(output.weight!=""&&output.weight!=undefined&&output.weight!=null){
                                converted_weight = req.body.weight;
                                output.weight = converted_weight.toFixed(2);
                            }
                        };
                          if (output.photo) {                                    
                                    if (output.photo != null && output.photo != "" && output.photo != undefined) {
                                        var picture = CONSTANTS.baseUrl + getImage + output.photo;
                                        output.photo = picture;
                                    }
                                }
                               
                        output = output.toObject();
                        delete output.password;
                        res.json({
                            success: true,
                            msg: "User profile updated successfully",
                            data: output
                        });
                        return;
                    }
                }).catch(function(error) {
                    console.log(error);
                    res.json({
                        success: false,
                        msg: "Something went wrong while updating user profile"
                    });
                    return;
                })
            } else {
                res.json({
                        success: false,
                        msg: "user not found with thos userId"
                });
                return;                
            }
        })
    }).catch(function(error) {
        res.json({
            success: false,
            msg: "Authentication failed",
            authStatus  :1
        });
        return;
    })
})

/*
 * Add User profile pic
 * created by - Aniket Meshram;
 * created on - 27th Nov 2017;
 */
router.post('/add_photo', fileUpload.uploadImage('photo', userImage), function(req,res,next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result){
        var userId = req.body.userId;
        
        User.findOne({
            '_id': req.body.userId
        }).then(function(userInfo) {
            if(userInfo.photo == ""){
                var originalName = req.files[0].filename;
            }else if (req.files == "") {
                var originalName = userInfo.photo;
            } else {
                if (req.files.length > 0 || req.files != "") {
                    if (userInfo.photo) {
                        if (userInfo.photo != null || userInfo.photo.length != 0) {
                            fs.unlink('./public/uploads/users/' + userInfo.photo);
                        }
                    }
                    var originalName = req.files[0].filename;
                }
            }
            if (userInfo) {
                User.findOneAndUpdate({
                    '_id':userInfo._id
                }, {
                    $set: {
                        photo: originalName,
                        updatedAt: config.currentTimestamp
                    }
                }, {
                    'new': true
                }, function(err, data) {
                   
                       if (data.photo) {
                                    
                                    if (data.photo != null && data.photo != "" && data.photo != undefined) {
                                        var picture = CONSTANTS.baseUrl + getImage + data.photo;
                                        data.photo = picture;
                                    }
                                }
                                console.log(data.photo)
                    if (err) {
                        res.json({
                            success:false,
                            msg:"photo not updated for userId"
                        });
                        return;
                    } else {
                        res.json({
                            success:true,
                            msg:"photo uploaded successfully",
                            data:data
                        });
                        return;
                    }
                })
            } else{
                res.json({
                    success:false,
                    msg:"Data not found with given userId"
                });
                return;
            }
        }).catch(function(error) {
            res.json({
                success:false,
                msg:"Enter Valid userId"
            });
            return;
        })
    }).catch(function(error) {
        res.json({
            success:false,
            msg:"Authentication failed",
            authStatus  :1
        });
        return;
    })
})

module.exports = router;
