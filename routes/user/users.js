var express = require('express');
var router = express.Router();
var User = require(appRoot + '/models/dnr_users');
var Token = require(appRoot + '/models/dnr_token');
var config = require(appRoot + '/libs/config');
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
    var email = req.body.email;
    var password = req.body.password;
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
            deviceData.device_type = deviceType;
            deviceData.device_token = deviceToken;
            
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
                        email: email.toLowerCase()
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
                            
                            config.sendMail(req.body.email.toLowerCase(), text, subject).then(function(result, error) {
                                if (error) {
                                    console.log(error);
                                }
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
                                                    msg: 'Successful created new user.',
                                                    data: createdUser
                                                });
                                                return;
                                            }
                                        });
                                    } else {
                                        res.json("User token already exist");
                                        return;
                                    }
                                });
                            });
                        }
                    }).catch(function(error) {
                        res.send("User registration failed");
                        return;
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

                                    updatedUserData.save(function(err, data) {
                                        // console.log("deviceToken@loginByEmail->"+data);
                                    })
                                } 
                                //------------------
                                // if (userData.photo != null) {
                                //     if (userData.photo.length) {
                                //         var picture = CONSTANTS.baseUrl + getImage + userData.photo;
                                //         userData.photo = picture;
                                //     }
                                // }
                                
                                var userGeneratedToken = {
                                    'userId': info.userId,
                                    'token': info.token,
                                    'email': userData.email,
                                    'is_online': data.is_online,
                                    'latitude': data.latitude,
                                    'longitude': data.longitude,
                                    'login_type': data.login_type
                                    // 'photo': userData.photo
                                };
                                
                                
                                if (error) {
                                    res.send("Failed to save token");
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

                            // if (userInfo.userId.photo != null) {
                            //     if (userInfo.userId.photo.length) {
                            //         var picture = CONSTANTS.baseUrl + getImage + userInfo.userId.photo;
                            //         userInfo.userId.photo = picture;
                            //     }
                            // }
                            
                            var userUpdatedToken = {
                                'userId': userInfo.userId._id,
                                'token': userInfo.token,
                                'email': userInfo.userId.email,
                                'is_online': data.is_online
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
    })
});

/*
 * User social signup
 * created by - Aniket Meshram
 * created on - 9th Nov 2017;
 */
router.post('/socialSignup', function(req, res, next) {
    console.log(req.body)
    var facebookId = req.body.facebookId;
    var email = req.body.email;
    var fullname = req.body.fullName;
    var gender = req.body.gender;//newly added
    // var device = deviceType = req.body.deviceType;
    var device = deviceType = "ANDROID";
    // var deviceToken = req.body.deviceToken;
    var deviceToken = "qaz123wsx456rfv789";

    if (email != null && email != '' ) {
        User.findOne({
            'email': email
        }).then(function(userData) {
            if (userData) {
                res.json({
                    'success': false,
                    'msg': "Email id is already exist"
                })
            } else {
                //-------------------------------------
                var deviceData={};
                deviceData.device_type = deviceType;
                deviceData.device_token = deviceToken;
                //-------------------------------------    
                if (facebookId != null) {
                    User.findOne({
                        'facebookId': facebookId
                    }).then(function(userData) {
                        
                        // User.findOneAndUpdate({
                        //         _id: userData._id
                        //     }, {
                        //         $set: {
                        //             'login_type': "facebook_login",
                        //             'is_online': true                                }
                        //     }, {
                        //         'new': true
                        //     }, function(err, data) {
                        //     // console.log("updated->"+data);
                        // });
                        
                        if (userData) {
                            var tokenData = {
                                username: userData.email,
                                timestamp: config.currentTimestamp,
                                id: userData._id
                            };
                            //var secret = new Buffer(config.secret, "base64").toString();
                            var generatedToken = jwt.sign(tokenData, config.secret);
                            
                            Token.findOneAndUpdate({
                                _id: userData._id
                            }, {
                                $set: {
                                    token: generatedToken,
                                    updatedAt: config.currentTimestamp
                                }
                            }, {
                                'new': true
                            }).exec().then(function(updatedToken) {
                                
                                // if (userData.photo != null) {
                                //     if (userData.photo.length) {
                                //         var picture = CONSTANTS.baseUrl + getImage + userData.photo;
                                //         userData.photo = picture;
                                //     }
                                // }
                                var userUpdatedToken = {
                                    'userId': updatedToken.userId,
                                    'token': updatedToken.token,
                                    'fullName': userData.fullname,
                                    'email': userData.email,
                                    // 'phoneNumber': userData.phoneNumber,
                                    'gender': userData.gender,//new field
                                    // 'photo': userData.photo
                                };
                                if (updatedToken) {
                                    // console.log(userUpdatedToken);
                                    res.json({
                                        success: true,
                                        msg: "Token updated successfully",
                                        data: userUpdatedToken
                                    });
                                    return;
                                } else {
                                    res.send("something went wrong");
                                }
                            }).catch(function(error) {
                                console.log(error);
                            })
                        } else {
                            
                            var user = new User({
                                'fullname': fullname,
                                'email': email.toLowerCase(),
                                'facebookId': req.body.facebookId,
                                'gender': req.body.gender,
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
                                                    var createdUser = {
                                                        'userId': data._id,
                                                        'fullName': data.fullname,
                                                        'email': data.email,
                                                        'facebookId': data.facebookId,
                                                        'gender': data.gender,
                                                        'token': info.token
                                                    };
                                                    res.json({
                                                        success: true,
                                                        msg: 'User created successfully with facebookId.',
                                                        data: createdUser
                                                    });
                                                    return;
                                                }
                                            });
                                        } else {
                                            res.json("user token already exist");
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
                } else {
                    res.json({
                        'success': false,
                        'msg': "Please enter facebookId and email"
                    });
                    return;
                }
            }
        })
    }else{
        res.json({
            'success': false,
            'msg': "Please enter email id"
        });
        return;
    }
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
                                'login_type': "facebook_login",
                                'is_online': true
                            }
                        }, {
                            'new': true
                        }, function(err, data1) {
                            // console.log("updated->"+data1);

                        if (userInfo) {
                            // if (userInfo.userId.photo.length) {
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

                            res.json({
                                success: true,
                                msg: "User login successfully with facebookId",
                                data: userToken
                            });
                            return;
                        } else {
                            res.json({
                                'success': false,
                                'msg': "User does not have token"
                            });
                            return;
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

                    if (userTokenInfo != null) {
                        res.json({
                            'success': true,
                            'msg': "User logout successfully",
                            'data' : data1
                        })
                    } else {
                        res.json({
                            'success': false,
                            'msg': "User dont have token"
                        });
                        return;
                    }
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
                        success:false,
                        msg:'unable to remove token'
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
            msg:"Authentication failed"
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
    var email = req.body.email;
    var randomPassword;
    User.findOne({
        'email': email.toLowerCase()
    }).then(function(userData) {
        if (userData) {
            randomPassword = randomString.generate(6);
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
                if (updatedUserData) {
                    var text = 'You are receiving this because you ' +
                        'have requested reset of ' +
                        'password for your account.\n\n Your new password' +
                        ' is ' + randomPassword;
                    var subject = 'Password Reset Notification';
                    config.sendMail(req.body.email.toLowerCase(), text, subject).then(function(result, error) {
                        if (error) {
                            console.log(error);
                        }
                        res.json({
                            success: true,
                            msg: 'Notification sent to your ' +
                                'registered email ID.'
                        });
                        return;
                    });
                }
            }).catch(function(error) {
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
    // var phoneNumber = req.body.phoneNumber;

    if (!req.body.newPassword || !req.body.confirmNewPassword || req.body.newPassword == undefined || req.body.confirmNewPassword == undefined) {
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
    // if (email) {
        User.findOne({
            '_id': userId
        }).exec().then(function(userData) {
            // console.log(userData);
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
                if(userData.height!=""&&userData.height!=undefined&&userData.height!=null){
                    converted_height = userData.height * 0.3937;
                    userData.height = converted_height;
                }
                if(userData.weight!=""&&userData.weight!=undefined&&userData.weight!=null){
                    converted_weight = userData.weight * 2.2046;
                    userData.weight = converted_weight;
                }
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
                })
            }
        }).catch(function(error) {
            res.json({
                success: false,
                msg: "Please enter valid userId"
            })
        })
    }).catch(function(error) {
        res.json({
            success: false,
            msg: "Authentication failed"
        });
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
        // console.log(req.body)
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
        if (req.body.dateOfBirth != null || req.body.dateOfBirth != undefined) {
            var dob = req.body.dateOfBirth.split('T');
            var splitDob = dob[0].split('-');
            calculate_age(splitDob[1], splitDob[2], splitDob[0]).then(function(userCalculateAge) {
                var userAge = userCalculateAge;
                req.body.age = userAge;
            });
        }

        User.findOne({
            '_id': userId
        }).then(function(userInfo) {
            // console.log("->"+userInfo);
            if (userInfo) {
                var updatedUser = _.extend(userInfo, req.body);
                // delete updatedUser.password;
                updatedUser.save(function(err, output) {
                    // console.log("->"+output);
                    if (err) {
                        res.json({
                            success: false,
                            msg: "Failed to update and add user data"
                        });
                        return;
                    } else {
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
                res.send("user not found with thos userId");
            }
        })
    }).catch(function(error) {
        res.json({
            success: false,
            msg: "Authentication failed"
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
                    if (data.photo != null && data.photo != "" && data.photo != undefined) {
                        var picture = CONSTANTS.baseUrl + getImage + data.photo;
                        data.photo = picture;
                    }
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
            msg:"Authentication failed"
        });
        return;
    })
})

module.exports = router;