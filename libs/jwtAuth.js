var config = require('./config.js');
var jwt = require('jsonwebtoken');
var Promise = require("promise");
var userToken = require(appRoot + '/models/dnr_token');

module.exports = {
    checkAuth: function(req, err) {
        var token = req;
        return new Promise(function(resolve, reject) {
            // decode token
            if (token) {
                // verifies secret and checks exp
        
                jwt.verify(token, config.secret, function(err, decoded) {
                    if (err) {
                        reject(err);
                    } else {
                        //console.log("here is user id " + JSON.stringify(decoded));
                        var userId = decoded.id;
                        userToken.findOne({
                            userId: decoded.id
                        }).then(function(userTokenDetails) {
                            // console.log("=>"+userTokenDetails);
                            if (userTokenDetails.token == token) {
                                var response = {
                                    success: true,
                                    message: 'User Authenticated',
                                    userId: userTokenDetails.userId
                                };
                                resolve(response);
                            } else {
                                console.log("here is err " + err);
                                //reject(new Error);
                                reject(err);
                            }
                        }).catch(function(error){
                            reject(err);
                        });
                    }
                });
            } else {
                console.log(err);
                reject(err);
            }
        });
    }
};