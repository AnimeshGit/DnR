/*
* Created By : Aniket M. Meshram
* Created On : 6th Nov 2017
*/

const PushNotifications = new require('node-pushnotifications');
// var objMysql = require(appRoot + '/database.js');
// var constants = require(appRoot + '/controller/constants.js');
// var scorecardModel = require(appRoot + '/model/scorecardModel.js');
const settings = {
    gcm: {
        id: 'AAAAZo-IuRU:APA91bG5k3s_23SwzhUHNWEvC0bzKuqJJUEC4Z21QyZuY72aDxeI9rVI6IAuas0jWTFQ4yHyuwB0A0SZxqo_ulDEw8LRGeY2gb3gUJ-RyqZlNh_pDFja2S8xbHaq-onCuuQz_dh9X1RG' //  AIzaSyD0AEM7qMpbCWWxcHEOql-K1KQS7QCkLYo' //AIzaSyCuOM4XLfWR8Hq5nsxaUfJXTOrb48mNQj8
    },
    apn: {
        token: {
            key: appRoot+'/ios_push_notification/key.p12',  // optionally: fs.readFileSync('./certs/key.p8') 
            keyId: 'bendthebar123456',//
            teamId: 'EFGH',
        }
    },
    adm: {
        client_id: null,
        client_secret: null
    },
    wns: {
        client_id: null,
        client_secret: null,
        notificationMethod: 'sendTileSquareBlock'
    }
};
const push = new PushNotifications(settings);

exports.send_notification = function (req, res) {
// Single destination 
const registrationIds = 'dxzzvP2yIjw:APA91bEucQj_qXAqzieQCFh1cFgNG-yY2wXSlZhD69NEYHi7jtb0lm5TGdNCiga8G8p4L75EaYQQr7Gnepfutc_BMLH7uggKdSokfhs8e7MVUApWxdA02UY4Qygm2wDBmIo8sQdw2sfH';
    const data = {
        title: 'Dating n Rating', // REQUIRED 
        body: 'Hi Sariff...testing notification', // REQUIRED 
        custom: {
            sender: 'twohourbefore',
        },
        priority: 'high', // gcm, apn. Supported values are 'high' or 'normal' (gcm). Will be translated to 10 and 5 for apn. Defaults to 'high' 
        retries: 1 // gcm, apn 
    };
     
    // You can use it in node callback style 
    push.send(registrationIds, data, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            //console.log(result);
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({status: '1',statusinfo:result}));
            return;
        }
    });
};

exports.sendPushNotification = function(pushTitle, pushBody,pushDeviceTokens,pushCustoms,callback)
{
    const registrationIds = pushDeviceTokens;
    const data = {
        title: pushTitle, // REQUIRED 
        body: pushBody, // REQUIRED 
        custom: pushCustoms,
        priority: 'high', // gcm, apn. Supported values are 'high' or 'normal' (gcm). Will be translated to 10 and 5 for apn. Defaults to 'high' 
        retries: 1 // gcm, apn 
    };
    
    console.log();
    // You can use it in node callback style 
    push.send(registrationIds, data, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log(result);
           callback(null,result);
        }
    });
};
exports.testNotification = function(req, res)
{
    var pushTitle = 'Got new opinion';
    var pushBody = 'Received opinion for case no #12345';
    var pushDeviceTokens ='dxzzvP2yIjw:APA91bEucQj_qXAqzieQCFh1cFgNG-yY2wXSlZhD69NEYHi7jtb0lm5TGdNCiga8G8p4L75EaYQQr7Gnepfutc_BMLH7uggKdSokfhs8e7MVUApWxdA02UY4Qygm2wDBmIo8sQdw2sfH';
    var pushCustoms = {
          sender: 'opinionSubmitted'
    }
    exports.sendPushNotification(pushTitle, pushBody,pushDeviceTokens,pushCustoms,function(err,callback){

    });
};