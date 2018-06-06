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
var stripe_customer = require(appRoot + '/libs/stripe/customer');
var stripe_plan = require(appRoot + '/libs/stripe/plan');
var stripe_customer = require(appRoot + '/libs/stripe/customer');
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
 * stripePayment
 * created by - Shital;
 * created on - 26.2.2017;
 */
router.post('/stripePayment', function(req, res, next) {
	let userId = req.body.userId;
	User.findOne({
    'email': email.toLowerCase()
	}).then(function(userData) {
    if (userData != null) {
    	let email = userData.email;  
    	let stripe_customer_id = userData.stripe_customer_id;
    	if(!stripe_customer_id)
    	{
    		//create new cusomer on stripe
    		let reqData = {
			  email: email,
			  description : "Stripe payment For "+email,
			  source: "tok_mastercard" // obtained with Stripe.js
			}

    	}
    	else
    	{

    	}
    }
    else
    {
    	res.send({
	        success: false,
	        msg: 'User not found with entered mail id.'
	    });
	    return;
    }
	}).catch(function(error){ 
		res.send({
            success: false,
            msg: 'User not found with entered mail id.'
        });
        return;
    });
});
// router.post('/getPlans', function(req, res, next) {
//     stripe_plan.list_plans(function(err,callback){
//         if(err)
//         {
//             res.json({
//                 success: false,
//                 msg: "Failed to get Packages record"
//             });
//             return;
//         }else
//         {
//             res.json({
//                 success: true,
//                 msg: "Fetched All Packages Record Successfully",
//                 data: callback
//             });
//             return;
//             console.log(callback);
//         }
//     });

// });

module.exports = router;