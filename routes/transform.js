var path = require('path');
var gm = require('gm').subClass({imageMagick: true});
var express = require('express');
var router = express.Router();

function error(err, next) {
    console.dir(err);
    next(err);
}

router.post('/', function (req, res, next) {
    console.dir(req.body);
    var image = path.basename(req.body.imagePath);
    var matches = /^(.+)(\.[^.]+)$/.exec(image);
    var imagePath = path.join(path.dirname(__dirname), 'public', 'images', 'uploads', 'temp', image);
    var rotated = matches[1] + '_rotated' + matches[2];
    var rotatePath = path.join(path.dirname(__dirname), 'public', 'images', 'uploads', 'temp', rotated);
    var result = matches[1] + '_result' + matches[2];
    var resultPath = path.join(path.dirname(__dirname), 'public', 'images', 'uploads', 'temp', result);

    rotate(imagePath, req.body.rotate, rotatePath, function (err) {
        if (err) error(err, next);
        else {
            calculateCrop(rotatePath, req.body.editWidth, req.body.editHeight, req.body.width, req.body.height, req.body.left, req.body.top, function (err, cropBounds) {
                if (err) error(err, next);
                else {
                    crop(rotatePath, cropBounds, resultPath, function (err) {
                        if (err) error(err, next);
                        else res.send({passport: 'images/uploads/temp/' + result});
                    });
                }
            });
        }
    });
});

function previewBoundedByWidth(previewWidth, previewHeight, imageWidth, imageHeight) {
    var previewRatio = previewWidth / previewHeight;
    var imageRatio = imageWidth / imageHeight;

    return previewRatio < imageRatio;
}

function previewResizeRatio(previewWidth, previewHeight, imageWidth, imageHeight) {
    var imageRatio = imageWidth / imageHeight;
    var previewRatio = previewWidth / previewHeight;

    return (imageRatio < previewRatio)
        ? previewHeight / imageHeight
        : previewWidth / imageWidth;
}

function calculateCrop(rotatedImage, previewWidth, previewHeight, width, height, left, top, done) {
    var crop = {};
    gm(rotatedImage).size(function (err, rotatedSize) {
        if (err) error(err);
        else {
            var ratio = previewResizeRatio(previewWidth, previewHeight, rotatedSize.width, rotatedSize.height);

            crop.width = width / ratio;
            crop.height = height / ratio;
            crop.x = left / ratio;
            crop.y = top / ratio;
        }

        done(err, crop);
    });
}

function rotate(image, degrees, result, done) {
    gm(image)
        .rotate('white', degrees)
        .write(result, done);
}

function crop(image, crop, result, done) {
    gm(image)
        .crop(crop.width, crop.height, crop.x, crop.y)
        .write(result, done);
}

module.exports = router;
module.exports.previewBoundedByWidth = previewBoundedByWidth;
module.exports.previewResizeRatio = previewResizeRatio;
module.exports.calculateCrop = calculateCrop;
module.exports.rotate = rotate;
module.exports.crop = crop;

//321613945