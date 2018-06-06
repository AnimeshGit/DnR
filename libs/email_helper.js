
var sendMail = function(subject, content, to,cb) {
// load aws sdk

var AWS = require('aws-sdk');

// aws.config.loadFromPath('config.json');
AWS.config.update({
    region:'us-east-2',		
    accessKeyId	  : 'AKIAIRQLE6DKJIHFX56Q',
    secretAccessKey  : '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',
    apiVersion : '2012-10-08'
});

// load AWS SES
var ses = new AWS.SES({apiVersion: '2010-12-01'});

// send to list
// var to = ['shital.pimpale@eeshana.com']
var to = ['shital.pimpale@eeshana.com']
//var to = [to]

// this must relate to a verified SES account
var from = 'shital.pimpale@eeshana.com';


// this sends the email
// @todo - add HTML version
ses.sendEmail( { 
   Source: from, 
   Destination: { ToAddresses: to },
   Message: {
       Subject: {
            Data: 'A Message To You Rudy'
        //   Data: subject
       },
       Body: {
           Text: {
                Data: 'Stop your messing around'
            // Data: content,
           }
        }   
   }
}
, function(err, data) {
    if(err){
        console.log("=err",err);
       cb(err,null);
    }else{
        console.log('Email sent:');
        console.log(data);
         cb(null,data);

    } 
 });
}

module.exports = {    
    'sendMail': sendMail
};