var express = require('express');
var router = express.Router();
var config = require(appRoot + '/libs/config');
const CONSTANTS = require(appRoot + '/Constants/constant');
var jwt = require('jsonwebtoken');
var jwtAuth = require(appRoot + '/libs/jwtAuth');
var stripePlans = require(appRoot + '/libs/stripe/plan');
var Packages = require(appRoot + '/models/dnrAdminPackages');

var rn = require('random-number');

//add packages
//created on : 15th Jan 2018
//updated on : 23th Jan 2018
router.post('/addPackages', function(req,res,next){
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        var options = {
            min:  0, 
            max:  99, 
            integer: true
        }
        //   rn(options)
        reqData = {
            name: req.body.name,
            amount: req.body.amount,
            interval: req.body.interval,
            currency: req.body.currency,
            id: rn(options)
        }
        stripePlans.create_plan(reqData,function(err, result) {
            if (err) {
                res.json({
                    success: false,
                    msg: 'Packages are not inserted'
                });
            } else {
                res.json({
                    success: true,
                    msg: 'Successful inserted new Packages',
                    data: result
                });
                return;
            }
        });
        //stripe end
    }).catch(function(error) {
        console.log(error)
        res.json({
            success: false,
            msg: "Authentication failed"
        });
        return;
    })
})

// Dnr get all Packages
// created on - 15th Jan 2018;
// updated on : 23th Jan 2018
router.get('/getAllPackages', function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        stripePlans.list_plans(function(err, result) {
            if (result) {
                res.json({
                    success: true,
                    msg: "Fetched All Packages Record Successfully",
                    data: result.data
                });
                return;
            } else {
                res.json({
                    success: false,
                    msg: "Failed to get Packages record"
                });
                return;
            }
        });
    }).catch(function(error) {
        res.json({
            success: false,
            msg: "Authentication failed"
        });
        return;
    })
})

// Dnr get Each Packages 
// created on - 15th Jan 2018;
// updated on : 23th Jan 2018
router.get('/getEachPackage/:id',function(req,res,next) {
    var token = req.headers['accesstoken']
    jwtAuth.checkAuth(token).then(function(result) {

        stripePlans.retrieve_plan(req.params.id,function(err, result) {
            if (result) {
                res.json({
                    success: true,
                    msg: "single Package data fetch successfully",
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

// edit Packages
// created on - 15th Jan 2018;
// updated on : 23th Jan 2018
router.post('/editPackages',function(req,res){
    var token = req.headers['accesstoken']
    jwtAuth.checkAuth(token).then(function(result){
        id = req.body.ID

        reqData = {
            name: req.body.name
        }
        stripePlans.update_plan(id, reqData, function(err, result) {
            if (result) {
                res.json({
                    success: true,
                    msg: "single Package data Update successfully",
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

// delete Packages
// created on - 15th Jan 2018;
// updated on : 23th Jan 2018
router.get('/removePackages/:id',function(req,res,next){
    var token = req.headers['accesstoken']
    jwtAuth.checkAuth(token).then(function(result) {

        stripePlans.delete_plan(req.params.id, function(err, result) {
            if (result) {
                res.json({
                    success: true,
                    msg: "Packages data successfully Deleted",
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
