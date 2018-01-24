var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Express' });
    res.json({
        success: true,
        msg: 'Successfully hit sample api'
        // data: createdUser
    });
    return;
});

module.exports = router;
