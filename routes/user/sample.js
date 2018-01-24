var express = require('express');
var router = express.Router();
var User = require(appRoot + '/models/sampleUsers');
var config = require(appRoot + '/libs/config');
var _ = require('lodash');
const CONSTANTS = require(appRoot + '/Constants/constant');

router.post('/registration', function(req, res, next) {
    if (!req.body.fullname || !req.body.email) {
        res.json({
            success: false,
            msg: 'Please fill all Details.'
        });
        return;
    }else{
        if (req.body.email || req.body.fullname) {
            User.findOne({
                    'email': req.body.email.toLowerCase()
            }).then(function(userData) {
                if (userData == null || userData == '') {
                    newUser = new User({
                        fullname: req.body.fullname,
                        email: req.body.email.toLowerCase(),
                        phoneNumber:req.body.phoneNumber,
                        dateOfBirth:req.body.dateOfBirth,
                        age:req.body.age,
                    });
                    newUser.save(function(err, data) {
                        if (err) {
                            res.send({
                                success: false,
                                msg: 'Email or phoneNumber already exists.'
                            });
                        } else {
                            res.json({
                                success: true,
                                msg: 'Successful created new user.',
                                data: data
                            });
                            return;
                        }
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

router.post('/deleteUser', function(req,res,next) {
    User.findOneAndRemove({
        '_id':req.body.userId
    }).then(function(deleted_data) {
        if (deleted_data) {
            res.json({
                success:true,
                msg:'User account successfully deleted',
                data:deleted_data
            });
            return;
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
})

router.get('/getAllUsers', function(req, res, next) {
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
})

router.post('/editEachUser', function(req, res, next) {
    var userId = req.body.userId;

    User.findOne({
        $or: [{
            'email': req.body.email
        }, {
            'phoneNumber': req.body.phoneNumber
        }]
    }).then(function(userInfo) {

        if (userInfo) {
            var updatedUser = _.extend(userInfo, req.body);

            updatedUser.save(function(err, output) {
                if (err) {
                    res.json({
                        success: false,
                        msg: "Failed to update and add user data"
                    });
                    return;
                } else {
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
})

router.post('/getEachUser', function(req, res, next) {
    User.findOne({
        'phoneNumber': req.body.phoneNumber
    }).then(function(userData) {
        if (userData) {
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
        console.log(error);
        res.json({
            success: false,
            msg: "Failed to get user data"
        })
    })
})


module.exports = router;