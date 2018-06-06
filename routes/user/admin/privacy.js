var express = require('express');
var router = express.Router();
var config = require(appRoot + '/libs/config');
const CONSTANTS = require(appRoot + '/Constants/constant');
var jwt = require('jsonwebtoken');
var jwtAuth = require(appRoot + '/libs/jwtAuth');
var PrivacyPolicy = require(appRoot + '/models/dnrAdminPP');

//add PrivacyPolicy
//created on : 24th April 2018
//updated on : 
router.post('/addPrivacyPolicy', function(req,res,next){
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        PrivacyPolicy.create({ 
            title: req.body.title,
            description: req.body.description
        }, function (err, result) {
            if (err) {
                res.json({
                    success: false,
                    msg: 'Privacy Policy are not inserted'
                });
            } else {
                res.json({
                    success: true,
                    msg: 'Successfuly inserted new Privacy Policy ',
                    data: result
                });
                return;
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
// Dnr get all PrivacyPolicy
// created on - 24th April 2017;
router.get('/getAllPrivacyPolicy', function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        PrivacyPolicy.find().then(function(TnCdata) {
            if (TnCdata) {
                res.json({
                    success: true,
                    msg: "Fetched All Privacy Policy Record Successfully",
                    data: TnCdata
                });
                return;
            } else {
                res.json({
                    success: false,
                    msg: "Failed to get Privacy Policy record"
                });
                return;
            }
        }).catch(function(error) {
            console.log(error);
            res.json({
                success: false,
                msg: "Please enter valid parameters"
            });
            return;
        })
    }).catch(function(error) {
        res.json({
            success: false,
            msg: "Authentication failed"
        });
        return;
    })
})
// Dnr get Each PrivacyPolicy users
// created on - 24th April 2018;
router.get('/getPrivacyPolicy/:id',function(req,res,next) {
    // var token = req.headers['accesstoken']
    // jwtAuth.checkAuth(token).then(function(result) {
        PrivacyPolicy.findById(req.params.id, function(err,result){
            if (result) {
                res.json({
                    success: true,
                    msg: "single Privacy Policy data fetch successfully",
                    data: result
                });
                return;            
            } else{
                res.json({
                    success: false,
                    msg: "Please Enter valid Parameters"
                });
                return;
            };
        })
    // }).catch(function(error) {
    //     res.json({
    //         success: false,
    //         msg: "Authentication failed"
    //     });
    //     return;
    // })
})
// edit PrivacyPolicy
// created on - 24th April 2018;
// updated on - ;
router.post('/editPrivacyPolicy',function(req,res){
    var token = req.headers['accesstoken']
    jwtAuth.checkAuth(token).then(function(result){
        console.log(req.body)
        PrivacyPolicy.findOneAndUpdate({
            _id: req.body.ID
        },{
                $set:{
                    title: req.body.title,
                    description: req.body.description
                }
            },{new:true}, function(err, result) {
            if (result) {
                res.json({
                    success: true,
                    msg: "Single Privacy Policy data Update successfully",
                    data: result
                });
                return;            
            } else{
                res.json({
                    success: false,
                    msg: "Please Enter valid params"
                });
                return;
            };
        })
    }).catch(function(error){
        req.json({
          success:false,
          msg:"Authentcation failed"  
        });
        return;
    })

})
// delete users
// created on - 10th Jan 2017;
router.get('/removePrivacyPolicy/:id',function(req,res,next){
    var token = req.headers['accesstoken']
    jwtAuth.checkAuth(token).then(function(result) {
        PrivacyPolicy.findByIdAndRemove(req.params.id, function(err,result){
            if (result) {
                res.json({
                    success: true,
                    msg: "PrivacyPolicy data successfully Deleted",
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
/***************EOF************/
module.exports = router;
