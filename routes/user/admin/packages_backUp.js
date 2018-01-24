var express = require('express');
var router = express.Router();
var config = require(appRoot + '/libs/config');
const CONSTANTS = require(appRoot + '/Constants/constant');
var jwt = require('jsonwebtoken');
var jwtAuth = require(appRoot + '/libs/jwtAuth');
var Packages = require(appRoot + '/models/dnrAdminPackages');
//add terms and conditions
//created on : 15th Jan 2018
//updated on : --th Jan 2018
router.post('/addPackages', function(req,res,next){
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        Packages.create({ 
            title: req.body.title,
            tag: req.body.tag,
            price: req.body.price,
            duration: req.body.duration
        }, function (err, result) {
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
        })
    }).catch(function(error) {
        res.json({
            success: false,
            msg: "Authentication failed"
        });
        return;
    })
})

// Dnr get all Packages
// created on - 15th Jan 2017;
router.get('/getAllPackages', function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        
        Packages.find().then(function(Packagesdata) {
            if (Packagesdata) {
                res.json({
                    success: true,
                    msg: "Fetched All Packages Record Successfully",
                    data: Packagesdata
                });
                return;
            } else {
                res.json({
                    success: false,
                    msg: "Failed to get Packages record"
                });
                return;
            }
        }).catch(function(error) {
            console.log(error);
            res.json({
                success: false,
                msg: "Something went wrong"
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

// Dnr get Each Packages 
// created on - 15th Jan 2017;
router.get('/getEachPackage/:id',function(req,res,next) {
    var token = req.headers['accesstoken']
    jwtAuth.checkAuth(token).then(function(result) {
        Packages.findById(req.params.id, function(err,result){
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
// created on - 15th Jan 2017;
// updated on - --th Jan 2017;
router.post('/editPackages',function(req,res){
    var token = req.headers['accesstoken']
    jwtAuth.checkAuth(token).then(function(result){
        console.log(req.body)
        Packages.findOneAndUpdate({
            _id: req.body.ID
        },{
                $set:{
                    title: req.body.title,
                    tag: req.body.tag,
                    price: req.body.price,
                    duration: req.body.duration
                }
            },{new:true}, function(err, result) {
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
// created on - 15th Jan 2017;
router.get('/removePackages/:id',function(req,res,next){
    var token = req.headers['accesstoken']
    jwtAuth.checkAuth(token).then(function(result) {
        Packages.findByIdAndRemove(req.params.id, function(err,result){
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
