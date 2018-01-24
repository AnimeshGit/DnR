var moment = require('moment');
// var crypto = require('crypto'),
//     algorithm = 'aes-256-ctr',
//     password = 'd6F3Efeq';
var currentTimestamp = moment().format();
var Promise = require("promise");
var nodemailer = require('nodemailer');
var email = require("emailjs/email");

/*
function_name : encrypt
description : It is used for encrypt field
input_parameters :
field(string) : any field which you want to encrypt
response :
field(string) : encrypted field
*/

// var encrypt = function(text) {
//     var cipher = crypto.createCipher(algorithm, password);
//     var crypted = cipher.update(text, 'utf8', 'hex');
//     crypted += cipher.final('hex');
//     return crypted;
// }
/*
function_name : decrypt
description : It is used for decrypt field
input_parameters :
field(string) : any encrypted field which you want to decrypt
response :
field(string) : plain text field
*/
// var decrypt = function(text) {
//     var decipher = crypto.createDecipher(algorithm, password)
//     var dec = decipher.update(text, 'hex', 'utf8')
//     dec += decipher.final('utf8');
//     return dec;
// }
/*
function_name : sendEmail
description : It is used for sending password in mail
input_parameters :
email(string) : email of user
password : random new password for user
text : body text which we want to send in email body
response :
responseStatus(object) : status of email
*/
var sendMail = function(useremail, text, subject) {
    return new Promise(function(resolve, reject) {
        /* var transport = nodemailer.createTransport({
            service: 'gmail',
                auth: {
                    user: 'surabhi.kandi@eeshana.com',
                    pass: ''
                }
            });
            transport.sendMail({
                to: email,
                from: 'OpinionPlus <no-reply@acme.com>',
                subject: subject,
                html: text
            }, function(err, responseStatus) {
                if (err) {
                    reject(err);
                }
                resolve(responseStatus);
            });
            });
        */
        var server = email.server.connect({
            // user: "mspragso@gmail.com",
            // password: "GrapeGoat@980",
            user: "postmaster@eeshana.com",
            password: "BHS^&AHHAG6J8748JAKKA",
            host: "smtp.mailgun.org",
            ssl: true
        }, function(err, msg) {
            if (err) {
                console.log("error is" + err);
            }
            console.log(msg)
        });
        server.send({
            text: text,
            from: "DatingAndRating <support@datingandrating.com>",
            to: useremail,
            subject: subject
        }, function(err, message) {
            if (err) {
                reject(err);
            } else {
                console.log(message);
                resolve(message)
            }
        });
    });
}

var sendMsg = function(phoneNumber, text) {
    return new Promise(function(resolve, reject) {
        //abbas credentials
        // var twillowSId = 'ACb2f1d18964e8823c7091ca254d1c5011';
        //var twillowToken = '2d60a7944b9c0ac2c5f4903d9fafbe5a';
        //form:+1 650-481-8273

        var twillowSId = 'AC2823df0cb2d52d9f2d11a2bc379616b6';
        var twillowToken = '5c936dba069b762f6b7e30bbac2f0c38';
        
        // if (phoneNumber.includes(+)==true) {
        //     var res = phoneNumber;
        //     // .slice(phoneNumber.indexOf(+));
        //     console.log("if"+res);
        // } else{
        //     var res = "+91"+phoneNumber;
        //     console.log("else"+res);
        // };
        //     console.log(res);
        
        //var twillowSId = 'AC66492b78f30d994ef6b60dacb368f6cd';
        //var twillowToken = '602a34baf2d08d88171d01099a11633b';
        var client = require('twilio')( twillowSId, twillowToken);

        client.messages.create({
            // from: '+615-697-6373',
            from: '+18558660893',
            to: '+91' + phoneNumber,
            // to: res,
            body: text
        }, function(err, message) {
            if (err) {
                console.error(err.message);
                reject(err);
            } else {
                resolve(message);
            }
        });
    });
}

module.exports = {
    'secret': 'ilovenodejs',
    'currentTimestamp': currentTimestamp,
    // 'encrypt': encrypt,
    // 'decrypt': decrypt,
    'sendMail': sendMail,
    'sendMsg': sendMsg
};