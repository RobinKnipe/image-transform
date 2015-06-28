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
    var cropped = matches[1] + '_cropped' + matches[2];
    var croppedPath = path.join(path.dirname(__dirname), 'public', 'images', 'uploads', 'temp', cropped);
    var result = matches[1] + '_result' + matches[2];
    var resultPath = path.join(path.dirname(__dirname), 'public', 'images', 'uploads', 'temp', result);

    //gm(rotatedImage).size(function (err, originalSize) {
    //    if (err) error(err);
    //    else {
            rotate(imagePath, req.body.rotate, rotatePath, function (err) {
                if (err) error(err, next);
                else {
                    calculateCrop(rotatePath, /*originalSize,*/ req.body.editWidth, req.body.editHeight, req.body.width, req.body.height, req.body.left, req.body.top, function (err, cropBounds) {
                        if (err) error(err, next);
                        else {
                            crop(rotatePath, cropBounds, croppedPath, function (err) {
                                if (err) error(err, next);
                                else {
                                    binarize(croppedPath, '15%', resultPath, function (err) {
                                        if (err) error(err, next);
                                        else res.send({passport: 'images/uploads/temp/' + result});
                                    });
                                }
                            });
                        }
                    });
                }
            });
    //    }
    //});
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

function calculateCrop(rotatedImage, /*originalSize,*/ previewWidth, previewHeight, width, height, left, top, done) {
    var crop = {};
    gm(rotatedImage).size(function (err, rotatedSize) {
        if (err) error(err);
        else {
            //var originalRatio = previewResizeRatio(previewWidth, previewHeight, originalSize.Width, originalSize.Height);
            var rotatedRatio = previewResizeRatio(previewWidth, previewHeight, rotatedSize.width, rotatedSize.height);
            var previewOriginX = previewWidth/2, previewOriginY = previewHeight/2;
            var rotatedOriginX = rotatedSize.width/2, rotatedOriginY = rotatedSize.height/2;
            var previewCropLeftToOrigin = previewOriginX - left;
            var previewCropTopToOrigin = previewOriginY - top;
            var cropLeftToOrigin = previewCropLeftToOrigin / rotatedRatio;
            var cropTopToOrigin = previewCropTopToOrigin / rotatedRatio;
            //var widthDiff =
            //var topAdjust

            crop.x = rotatedOriginX - cropLeftToOrigin;
            crop.y = rotatedOriginY - cropTopToOrigin;
            crop.width = width / rotatedRatio;
            crop.height = height / rotatedRatio;
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

function binarize(image, threshold, result, done) {
    gm(image)
        .threshold(threshold)
        .write(result, done);
}

module.exports = router;
module.exports.previewBoundedByWidth = previewBoundedByWidth;
module.exports.previewResizeRatio = previewResizeRatio;
module.exports.calculateCrop = calculateCrop;
module.exports.rotate = rotate;
module.exports.crop = crop;

//321613945