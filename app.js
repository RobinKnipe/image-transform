var express = require('express');
var path = require('path');
var logger = require('morgan');
//var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var uploads = path.join(__dirname, 'public', 'images', 'uploads', 'temp');
var fs = require('fs-extra');
fs.mkdir(uploads, '0755', function (err) {
    if (err && err.errno!=47 && err.errno!=-17) { // 47, -17 -> already existing
        console.error('Failed to create missing image directory at: %s\nThis directory must be created before files can be uploaded!', uploads);
        console.dir(err);
    }
});


var index = require('./routes/index');
var upload = require('./routes/upload');
var transform = require('./routes/transform');
var compare = require('./routes/compare');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended: false}));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/upload', upload);
app.use('/transform', transform);
app.use('/compare', compare);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: err
    });
});


//module.exports = app;

// start the app
var port = 7100;
app.listen(port);
console.log('App started on port ' + port);
