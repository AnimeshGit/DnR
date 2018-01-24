var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
global.appRoot = path.resolve(__dirname);


var cors = require('cors')
const session = require('express-session');
var flash = require('connect-flash');
var fetch = require('node-fetch');

const mongoose = require('./libs/mongoose-connection')();

var app = express();
app.use(cors());

//session:
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: 'ssshhhhh'
}));

//Create mongoDb connection
mongoose.connection.on('openUri', () => {
    console.log("connection opened");
});

mongoose.connection.on('error', function(err) {
    console.log(err);
    console.log('Could not connect to mongo server!');
});

app.use(bodyParser.json({
    limit: '50mb'
}));

app.use(bodyParser.urlencoded({
    extended: true,
    limit: '50mb',
    parameterLimit: 1000000
}));

app.use(morgan("dev"));
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});

// all environments
app.set('view engine', 'ejs');

//app.set('socketio', io);
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.use(flash());

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Declearation of constant
global.globalConsTant = require('./Constants/constant');

// require(appRoot + '/routes/admin/feedback')(app);

//Users_Apis
var index = require('./routes/user/index');
app.use('/index', index);

var users = require('./routes/user/users');
app.use('/users', users);

var user_actions = require('./routes/user/user_actions');
app.use('/user_actions', user_actions);

//Admin Panel
var admin_index = require('./routes/user/admin/index');
app.use('/admin_index', admin_index);

var admin_terms = require('./routes/user/admin/terms');
app.use('/admin_terms', admin_terms);

var admin_packages = require('./routes/user/admin/packages');
app.use('/admin_packages', admin_packages);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


module.exports = app;