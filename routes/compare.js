var fs = require('fs');
var path = require('path');
var express = require('express');
var router = express.Router();
var exec = require('child_process').exec;

function error(err, next, msg) {
    if (msg) console.error(msg);
    console.dir(err);
    if (next) next(err);
}

router.get('/', function (req, res) {
    res.render('compare', {title: 'Passport Image OCR Comparison'});
});

router.get('/ocr', function (req, res) {
    //res.
    var dir = path.join(__dirname, 'public', 'images', 'uploads', 'temp');
    console.debug('processing dir: '+dir);
    fs.readdir(dir, function(err, files) {
        if (err) error(err);
        else {
            console.debug('processing files: '+files);
            files.forEach(function (file) {
                console.debug('processing file: '+file);
                doOCR(file, function(err, text, errors) {
                    if (err) error(err, false, 'OCR could not process file: '+file+'\nErrors: '+errors);
                    res.json({img:file, ocr:text});
                })
            });
        }
    });
});

function doOCR(file, done) {
    done('process file: '+file);

    //var cmd = 'tesseract -l mrz '+file+' stdout';
    //exec(cmd, done);
};

module.exports = router;
