const multer = require('multer');
const path = require('path');
var fs = require("fs");
const crypto = require('crypto');
const mimetype = require('mime-types');
//-----------------File Upload ----------------------------
exports.uploadImage = function(filename, dest) {
    var storage = multer.diskStorage({ //multers disk storage settings
        destination: function(req, file, cb) {
            cb(null, appRoot + dest);
        },
        filename: function(req, file, cb) {
            console.log("*******" + JSON.stringify(file));
            /*if (file.mimetype != null || file.mimetype != undefined) {
                crypto.pseudoRandomBytes(16, function(err, raw) {
                    if (err) {
                        console.log(err);
                    }
                    cb(null, raw.toString('hex') + Date.now() + '.' + mimetype.extension(file.mimetype));
                });
            } else {*/
                crypto.pseudoRandomBytes(16, function(err, raw) {
                    if (err) {
                        console.log(err);
                    }
                    cb(null, raw.toString('hex') + Date.now() + '.' + "png");
                });
            //}
        }
    });

    var upload = multer({ //multer settings
        storage: storage
    }).array(filename, 10);

    return upload;
};

//-----------------File Upload ----------------------------
exports.uploadImageProfile = function(dest, filename) {
    var storage = multer.diskStorage({ //multers disk storage settings
        destination: function(req, file, cb) {
            cb(null, appRoot + '/public/uploads/');
        },
        filename: function(req, file, cb) {
            crypto.pseudoRandomBytes(16, function(err, raw) {
                cb(null, raw.toString('hex') + Date.now() + '.' + mimetype.extension(file.mimetype));
            });
        }
    });

    var upload = multer({ //multer settings
        storage: storage
    }).single(filename);

    return upload;
};