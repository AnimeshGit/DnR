var express = require('express');
var router = express.Router();
var config = require(appRoot + '/libs/config');
var randomstring = require("randomstring");
bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);
const session = require('express-session');
const CONSTANTS = require(appRoot + '/Constants/constant');
var jwt = require('jsonwebtoken');
var jwtAuth = require(appRoot + '/libs/jwtAuth');
var DnrAdminUser = require(appRoot + '/models/dnrMasterAdmin');
var Token = require(appRoot + '/models/dnr_token');
var User = require(appRoot + '/models/dnr_users');
var Dates = require(appRoot + '/models/dnr_dates');
var Contacts = require(appRoot + '/models/dnrContacts');
var Contents = require(appRoot + '/models/dnrContents');

// Dnr Admin Singup
// created by - AniMesh;
// created on - 14th Dec 2017;
router.post('/admin_signup', function(req, res, next) {
    var adminFirstName  = req.body.adminFirstName;
    var adminLastName   = req.body.adminLastName;
    var adminEmail      = req.body.adminEmail;
    var adminPassword   = req.body.adminPassword;

    if (!req.body.adminEmail || !req.body.adminPassword) {
        res.json({
            success: false,
            msg: 'Please fill all Details.'
        });
        return;
    }else{
        if (req.body.adminEmail) {
            DnrAdminUser.findOne({
                'adminEmail': adminEmail.toLowerCase()
            }).then(function(DnrAdminData) {
                
                if (DnrAdminData == null || DnrAdminData == '') {
                    password = bcrypt.hashSync(req.body.adminPassword, salt);
                    newUser = new DnrAdminUser({
                        adminPassword: password,
                        adminFirstName: adminFirstName,
                        adminLastName: adminLastName,
                        adminEmail: adminEmail.toLowerCase()
                    });
                    newUser.save(function(err, data) {
                        if (err) {
                            res.json({
                                success: false,
                                msg: 'Username already exists'
                            });
                        } else {
                            res.json({
                                success: true,
                                msg: 'Successful created new user.',
                                data: data
                            });
                            return;
                        }
                    }).catch(function(error) {
                        console.log(error)
                        res.json({
                            msg:"User registration failed"
                        })
                        return
                    })
                } else {
                    res.json({
                        success: false,
                        msg: "Email id is already exist"
                    })
                    return
                }
            })
        }else{
            res.json({
                success: false,
                msg: "Please enter email"
            })
            return
        }
    }
})
// Dnr Admin login
// created on - 14th Dec 2017;
// updated on - 20th Dec 2017;
router.post('/admin_login', function(req, res, next) {
    var sess = req.session;
    // console.log(req.body)
    var email = req.body.username;
    var password = req.body.password;
    console.log(email);
    if (email != null) {
        DnrAdminUser.findOne({
            'adminEmail': email
        }).then(function(adminData) {
            if (adminData) {
                if(bcrypt.compareSync(password, adminData.adminPassword)){
                    
                    sess.adminId        = adminData._id;
                    sess.adminEmail     = adminData.adminEmail;
                    sess.adminFirstName = adminData.adminFirstName;
                    sess.adminLastName  = adminData.adminLastName;

                    var tokenData = {
                        username: adminData.adminEmail,
                        timestamp: config.currentTimestamp,
                        id: adminData._id
                    };
                    var generatedToken = jwt.sign(tokenData, config.secret);
                    
                    Token.findOne({
                        userId: adminData._id
                    }).then(function(userInfo) {
                        
                        if (userInfo == null) {
                            var newToken = new Token({
                                userId: adminData._id,
                                token: generatedToken
                            });
                            newToken.save(function(error, info) {
                                if (error) {
                                    res.json({
                                        success: false,
                                        msg: "Failed to add token"
                                    })
                                } else {
                    
                                    var createdUser = {
                                        'userId': adminData._id,
                                        'adminEmail': adminData.adminEmail,
                                        'token': info.token
                                    };
                                    res.json({
                                        success:true,
                                        msg:"Login Successfully",
                                        data: createdUser
                                    })
                                    return
                                }
                            });
                        } else {
                            var userUpdatedToken = {
                                'userId': userInfo.userId,
                                'token': userInfo.token,
                                'email': adminData.adminEmail
                            };
                            res.json({
                                success: true,
                                msg: "Login successfully",
                                data: userUpdatedToken
                            });
                            return;
                        }
                    });
                } else {
                    res.json({
                        success:false,
                        msg:"password do not match"
                    })
                    return
                }
            } else {
                res.json({
                    success:false,
                    msg:"not getting data"
                })
                return
            }
        })
    } else {
        res.json({
            success:false,
            msg:"email not found"
        })
        return
    }
});
// sample
router.get('/getAdminList', function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        DnrAdminUser.find().then(function(userData) {
            if (userData) {
                res.json({
                    success: true,
                    msg: "Fetched All Admin Record Successfully",
                    data: userData
                });
            } else {
                res.json({
                    success: false,
                    msg: "Failed to get user record"
                })
            }
        }).catch(function(error) {
            console.log(error);
            res.json({
                success: false,
                msg: "Please enter valid adminId"
            })
        })
    }).catch(function(error) {
        res.json({
            success: false,
            msg: "Authentication failed"
        });
    })
})
// Dnr get all users
// created on - 21th Dec 2017;
router.get('/getAllUsers', function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        User.find().then(function(userData) {
            if (userData) {
                res.json({
                    success: true,
                    msg: "Fetched All Users Record Successfully",
                    data: userData
                });
            } else {
                res.json({
                    success: false,
                    msg: "Failed to get user record"
                })
            }
        }).catch(function(error) {
            console.log(error);
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
// Dnr get single users
// created on - 25th Dec 2017;
router.get('/getEachUser/:id',function(req,res,next) {
    var token = req.headers['accesstoken']
    jwtAuth.checkAuth(token).then(function(result) {
        User.findOne({_id:req.params.id}, function(err,result){
            if (result) {
                res.json({
                    success: true,
                    msg: "User data successfully fetch",
                    data: result
                })
                return            
            } else{
                res.json({
                    success: false,
                    msg: "Please Enter valid Id"
                })
                return
            };
        })
    }).catch(function(error) {
        res.json({
            success: false,
            msg: "Authentication failed"
        })
        return
    })
})
//get latest 10 users
//created on : 16th jan 2018
router.get('/getDashBoardData',function(req,res,next) {
    var token = req.headers['accesstoken']
    jwtAuth.checkAuth(token).then(function(result) {
        User.find().limit(10).sort({'createdAt':-1}).then(function(latestTenUsers) {
            User.count().then(function(totalUsers) {
                Dates.find().limit(5).sort({'createdAt':-1}).populate('date_requester_id','fullname').populate('date_receiver_id','fullname').then(function(latestTenDates) {
                    Dates.count().then(function(totalDates) {
                        
                        res.json({
                            success: true,
                            msg: "Dashboard Data",
                            data:{
                                latestTenUsers: latestTenUsers,
                                latestTenDates: latestTenDates,
                                totalUsers:totalUsers,
                                totalDates:totalDates
                            }
                        });
                        return
                    })
                })
            })
        })
    }).catch(function(error) {
        res.json({
            success: false,
            msg: "Authentication failed"
        })
        return
    })
})
// Dnr Contacts
// created by - AniMesh;
// created on - 24th April 2018;
router.post('/addContacts', function(req, res, next) {
    var fullName  = req.body.fullName;
    var email   = req.body.email;
    var phoneNumber      = req.body.phoneNumber;
    var subject   = req.body.subject;
    var textMessage   = req.body.textMessage;
    newContacts = new Contacts({
        fullName: fullName,
        email: email.toLowerCase(),
        phoneNumber: phoneNumber,
        subject: subject,
        textMessage: textMessage
    });    
    newContacts.save(function(err, data) {
        console.log(err)
        if (err) {
            res.json({
                success: false,
                msg: 'Please fill all fields'
            });
        } else {
            res.json({
                success: true,
                msg: 'Successful add your information',
                data: data
            });
            return;
        }
    });
})
// Dnr Contacts get
// created by - AniMesh;
// created on - 24th April 2018;
router.get('/getContacts', function(req, res, next) {
    Contacts.find().then(function(contactData) {
        if (contactData) {
            res.json({
                success: true,
                msg: "Fetched All Contacts Successfully",
                data: contactData
            });
        } else {
            res.json({
                success: false,
                msg: "Failed to get Contacts"
            })
        }
    }).catch(function(error) {
        console.log(error);
        res.json({
            success: false,
            msg: "Please enter valid params"
        })
    })
})
// Dnr Contacts get Each
// created by - AniMesh;
// created on - 24th April 2018;
router.get('/getContacts/:id', function(req, res, next) {
    Contacts.findOne({_id:req.params.id}, function(err,result){
        if (result) {
            res.json({
                success: true,
                msg: "Fetched Each Contact Successfully",
                data: result
            })
            return            
        } else{
            res.json({
                success: false,
                msg: "Please Enter valid Id"
            })
            return
        };
    })
})
// Dnr Contents
// created by - AniMesh;
// created on - 27th April 2018;
router.post('/addContent', function(req, res, next) {
    Contents.create({ 
        title: req.body.title,
        description: req.body.description,
        conType:req.body.conType
    }, function (err, result) {
        if (err) {
            res.json({
                success: false,
                msg: 'Content are not inserted'
            });
        } else {
            res.json({
                success: true,
                msg: 'Successfully inserted new Content',
                data: result
            });
            return;
        }
    })
})
// Dnr Contents get
// created by - AniMesh;
// created on - 24th April 2018;
router.get('/getContents', function(req, res, next) {
    Contents.find().then(function(contentData) {
        if (contentData) {
            res.json({
                success: true,
                msg: "Fetched All Contents Successfully",
                data: contentData
            });
        } else {
            res.json({
                success: false,
                msg: "Failed to get Contents"
            })
        }
    }).catch(function(error) {
        console.log(error);
        res.json({
            success: false,
            msg: "Please enter valid params"
        })
    })
})
// Dnr Contents Edit
// created by - AniMesh;
// created on - 27th April 2018;
router.post('/editContents', function(req,res,next){
    Contents.findOneAndUpdate({
        _id: req.body.ID
        },{
            $set:{
                description: req.body.description
            }
        },{new:true}, function(err, result) {
        if (result) {
            res.json({
                success: true,
                msg: "Each Content data Updated successfully",
                data: result
            });
            return;            
        } else{
            res.json({
                success: false,
                msg: "Please Enter valid id"
            });
            return;
        };
    })
})
// Dnr Content get Each
// created by - AniMesh;
// created on - 27th April 2018;
router.get('/getContents/:id', function(req, res, next) {
    Contents.findOne({_id:req.params.id}, function(err,result){
        if (result) {
            res.json({
                success: true,
                msg: "Fetched Each Contents Successfully",
                data: result
            })
            return            
        } else{
            res.json({
                success: false,
                msg: "Please Enter valid Id"
            })
            return
        };
    })
})

module.exports = router;