var express = require('express');
var router = express.Router();
var config = require(appRoot + '/libs/config');
const CONSTANTS = require(appRoot + '/Constants/constant');
var jwt = require('jsonwebtoken');
var jwtAuth = require(appRoot + '/libs/jwtAuth');
var TermsAndConditions = require(appRoot + '/models/dnrAdminTerms');
//add terms and conditions
//created on : 10th Jan 2018
//updated on : 11th Jan 2018
router.post('/addTermsAndConditions', function(req,res,next){
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        //one method to insert data:-
        // newTnC = new TermsAndConditions({
        //     title: title,
        //     subject: subject,
        //     description: description
        // });
        // newTnC.save(function(err, data) {
        //     if (err) {
        //         res.json({
        //             success: false,
        //             msg: 'terms and conditions are not inserted'
        //         });
        //     } else {
        //         res.json({
        //             success: true,
        //             msg: 'Successful inserted new terms and conditions ',
        //             data: data
        //         });
        //         return;
        //     }
        // });
        //another mothed to insert data:-
        TermsAndConditions.create({ 
            title: req.body.title,
            subject: req.body.subject,
            description: req.body.description
        }, function (err, result) {
            if (err) {
                res.json({
                    success: false,
                    msg: 'terms and conditions are not inserted'
                });
            } else {
                res.json({
                    success: true,
                    msg: 'Successful inserted new terms and conditions ',
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
// Dnr get all terms and conditions
// created on - 11th Jan 2017;
router.get('/getAllTermsAndConditions', function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        
        TermsAndConditions.find().then(function(TnCdata) {
            if (TnCdata) {
                res.json({
                    success: true,
                    msg: "Fetched All TermsAndConditions Record Successfully",
                    data: TnCdata
                });
                return;
            } else {
                res.json({
                    success: false,
                    msg: "Failed to get TermsAndConditions record"
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
            msg: "Authentication failed"
        });
        return;
    })
})
// Dnr get Each TermsAndCondition users
// created on - 12th Jan 2017;
router.get('/getEachTermsAndCondition/:id',function(req,res,next) {
    var token = req.headers['accesstoken']
    jwtAuth.checkAuth(token).then(function(result) {
        TermsAndConditions.findById(req.params.id, function(err,result){
            if (result) {
                res.json({
                    success: true,
                    msg: "single TermsAndCondition data fetch successfully",
                    data: result
                });
                return;            
            } else{
                res.json({
                    success: false,
                    msg: "Please Enter valid Id"
                });
                return;
            };
        })
    }).catch(function(error) {
        res.json({
            success: false,
            msg: "Authentication failed"
        });
        return;
    })
})
// edit TermsAndConditions
// created on - 12th Jan 2017;
// updated on - 15th Jan 2017;
router.post('/editTermsAndCondition',function(req,res){
    var token = req.headers['accesstoken']
    jwtAuth.checkAuth(token).then(function(result){
        console.log(req.body)
        TermsAndConditions.findOneAndUpdate({
            _id: req.body.ID
        },{
                $set:{
                    title: req.body.title,
                    subject: req.body.subject,
                    description: req.body.description
                }
            },{new:true}, function(err, result) {
            if (result) {
                res.json({
                    success: true,
                    msg: "single TermsAndCondition data Update successfully",
                    data: result
                });
                return;            
            } else{
                res.json({
                    success: false,
                    msg: "Please Enter valid Id"
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
router.get('/removeTermsAndCondition/:id',function(req,res,next){
    var token = req.headers['accesstoken']
    jwtAuth.checkAuth(token).then(function(result) {
        TermsAndConditions.findByIdAndRemove(req.params.id, function(err,result){
            if (result) {
                res.json({
                    success: true,
                    msg: "TermsAndConditions data successfully Deleted",
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
