var express = require('express');
var router = express.Router();
var config = require(appRoot + '/libs/config');
const CONSTANTS = require(appRoot + '/Constants/constant');
var jwt = require('jsonwebtoken');
var jwtAuth = require(appRoot + '/libs/jwtAuth');
var TemplateMassage = require(appRoot + '/models/dnrAdminMessages');
//add Template Message
//created on : 28th May 2018
//updated on : 29th May 2018
router.post('/addTemplateMessage', function(req,res,next){
    TemplateMassage.create({//emailTemplate 
        emailTemplate: req.body.emailTemplate
    }, function (err, result) {
        if (err) {
            res.json({
                success: false,
                msg: 'Template Messages are not inserted'
            });
        } else {
            res.json({
                success: true,
                msg: 'Successfully inserted new Template Messages',
                data: result
            });
            return;
        }
    })
})
//get all Template Message
//created on : 29th May 2018
//updated on : 30th May 2018
router.get('/getAllTemplateMessage', function(req, res, next) {
    TemplateMassage.find().then(function(TMdata) {
        if (TMdata) {
            res.json({
                success: true,
                msg: "Fetched All Template Message Successfully",
                data: TMdata[0]
            });
            return;
        } else {
            res.json({
                success: false,
                msg: "Failed to get Template Message record"
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
})
//get each Template Message
//created on : 29th May 2018
//updated on : 30th May 2018
router.get('/getEachTemplateMessage/:id',function(req,res,next) {
    // TemplateMassage.findById(req.params.id, function(err,result){
    // TemplateMassage.find({'emailTemplate.id': req.params.id} , function(err,result){
    TemplateMassage.find().then(function(result){
        var data = result[0].emailTemplate.id(req.params.id)//getting subDocument data by id 
        if (result) {
            res.json({
                success: true,
                msg: "single TemplateMessage data fetch successfully",
                data: data
            });
            return;
        } else{
            res.json({
                success: false,
                msg: "Please Enter valid Id"
            });
            return;
        };
    }).catch(function(err){
        res.send(err)
    })
})
// edit TermsAndConditions
// created on - 30th May 2018;
// updated on - ---- May 2018;
router.post('/editTemplateMessage',function(req,res){
    //db.getCollection('dnr_messages').update({'emailTemplate._id' : ObjectId("5b0e6c5e5d6f47558e1addf1") },
    //{ $set: { "emailTemplate.$.emailSubject" : 'OK' } })
    TemplateMassage.update({
        'emailTemplate._id': req.body.tempId
    },{
        $set:{
            'emailTemplate.$.emailSubject':req.body.emailSubject, 
            'emailTemplate.$.emailBody':req.body.emailBody,
            'emailTemplate.$.emailType':req.body.emailType
        }
    },{new:true}, function(err, result) {
        if (result) {
            res.json({
                success: true,
                msg: "single TemplateMessage data Update successfully",
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
})
/***************EOF************/
module.exports = router;
