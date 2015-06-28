/**
 * Created by robin on 23/06/15.
 */

var expect = require('expect.js');
var rewire = require('rewire');
var transform = rewire('../routes/transform');

var imageWidth = 100, imageHeight = 80;

describe('Image Transformation', function() {

    describe('end point test', function() {

    });

    describe('previewBoundedByWidth', function() {
        it('should be true if the preview is bounded by the width', function () {
            var ratio = transform.previewBoundedByWidth(imageWidth/2, imageHeight, imageWidth, imageHeight);
            expect(ratio).to.be.ok();
            expect(ratio).to.equal(true);
        });

        it('should be false if the preview is bounded by the height', function () {
            var ratio = transform.previewBoundedByWidth(imageWidth, imageHeight/2, imageWidth, imageHeight);
            expect(ratio).not.to.be.ok();
            expect(ratio).to.equal(false);
        });
    });

    describe('previewResizeRatio', function() {
        it('should take the sizes of the preview and the source image and return a numeric ratio', function() {
            var ratio = transform.previewResizeRatio(1, 1, 1, 1);
            expect(ratio).to.be.ok();
            expect(ratio).to.be.a('number');
        });
        
        var tests = [{
            message: 'should be 1 if the preview and image are the same size',
            previewWidth: imageWidth, previewHeight: imageHeight,
            expected: 1
        }, {
            message: 'should be less than 1 if the preview is bigger than the image',
            previewWidth: imageWidth*2, previewHeight: imageHeight*2,
            expected: 2
        }, {
            message: 'should be greater than 1 if the preview is smaller than the image',
            previewWidth: imageWidth/2, previewHeight: imageHeight/2,
            expected: 0.5
        }, {
            message: 'should be calculated against the bounding dimension (width) of the preview',
            previewWidth: imageWidth/2, previewHeight: imageHeight,
            expected: 0.5
        }, {
            message: 'should be calculated against the bounding dimension (height) of the preview',
            previewWidth: imageWidth*10, previewHeight: imageHeight*2,
            expected: 2
        }];
        tests.forEach(function(t) {
            it(t.message, function() {
                var ratio = transform.previewResizeRatio(t.previewWidth, t.previewHeight, imageWidth, imageHeight);
                expect(ratio).to.equal(t.expected);
            });
        });
    });

    describe('calculateCrop', function() {
        function GM(image) {
            expect(image).to.be.a('string');
            expect(image).not.to.be.empty();
            return {
                image: image,
                size: function(callback) {
                    if (image == 'test') {
                        expect(callback).to.be.a('function');
                        callback(undefined, { width: 0, height: 0 });
                    }
                    else if (image == 'test.jpg') callback(undefined, { width: imageWidth, height: imageHeight });
                    else callback(new Error('imagemagick error'));
                }
            };
        };
        transform.__set__('gm', GM);

        it('should take an image file, some numbers, and a callback function', function(done) {
            transform.calculateCrop('test', 1, 1, 1, 1, 0, 0, function(err, crop) {
                expect(err).not.to.be.ok();
                expect(err).to.be(undefined);
                expect(crop).to.be.an('object');
                expect(crop).to.have.property('width');
                expect(crop).to.have.property('height');
                expect(crop).to.have.property('x');
                expect(crop).to.have.property('y');
                done();
            });
        });

        var tests = [{
            message: 'is unchanged when crop is same size as preview and the image',
            previewWidth:imageWidth, previewHeight:imageHeight, width:imageWidth, height:imageHeight, left:0, top:0,
            expected: { width:imageWidth, height:imageHeight, x:0, y:0 }
        }, {
            message: 'is unchanged when crop is same size as preview, and same ratio as the image',
            previewWidth:50, previewHeight:40, width:50, height:40, left:0, top:0,
            expected: { width:imageWidth, height:imageHeight, x:0, y:0 }
        }, {
            message: 'is unchanged when bounding crop dimension (width) is same as preview, and crop has same ratio as the image',
            previewWidth:imageWidth*2, previewHeight:imageHeight*10, width:imageWidth*2, height:imageHeight*2, left:0, top:0,
            expected: { width:imageWidth, height:imageHeight, x:0, y:0 }
        }, {
            message: 'is unchanged when bounding crop dimension (height) is same as preview, and crop has same ratio as the image',
            previewWidth:imageWidth*10, previewHeight:imageHeight/2, width:imageWidth/2, height:imageHeight/2, left:0, top:0,
            expected: { width:imageWidth, height:imageHeight, x:0, y:0 }
        }, {
            message: 'should crop to top-left quarter of image',
            previewWidth:imageWidth, previewHeight:imageHeight, width:imageWidth/2, height:imageHeight/2, left:0, top:0,
            expected: { width:imageWidth/2, height:imageHeight/2, x:0, y:0 }
        }, {
            message: 'should crop to top-right quarter of image',
            previewWidth:imageWidth, previewHeight:imageHeight, width:imageWidth/2, height:imageHeight/2, left:imageWidth/2, top:0,
            expected: { width:imageWidth/2, height:imageHeight/2, x:imageWidth/2, y:0 }
        }, {
            message: 'should crop to bottom-left quarter of image',
            previewWidth:imageWidth, previewHeight:imageHeight, width:imageWidth/2, height:imageHeight/2, left:0, top:imageHeight/2,
            expected: { width:imageWidth/2, height:imageHeight/2, x:0, y:imageHeight/2 }
        }, {
            message: 'should crop to bottom-right quarter of image',
            previewWidth:imageWidth, previewHeight:imageHeight, width:imageWidth/2, height:imageHeight/2, left:imageWidth/2, top:imageHeight/2,
            expected: { width:imageWidth/2, height:imageHeight/2, x:imageWidth/2, y:imageHeight/2 }
        //}, {
        //    message: 'should crop to top-left quarter of image',
        //    previewWidth:100, previewHeight:80, width:50, height:40, left:0, top:0,
        //    expected: { width:imageWidth, height:imageHeight, x:0, y:0 }
        //}, {
        //    message: 'should crop to top-left quarter of image',
        //    previewWidth:100, previewHeight:80, width:50, height:40, left:0, top:0,
        //    expected: { width:imageWidth, height:imageHeight, x:0, y:0 }
        }];
        tests.forEach(function(t) {
            it(t.message, function(done) {
                transform.calculateCrop('test.jpg', t.previewWidth, t.previewHeight, t.width, t.height, t.left, t.top, function(err, crop) {
                    expect(err).to.be(undefined);
                    expect(crop).to.eql(t.expected);
                    done();
                });
            });
        });
    });

    //describe('transform', function() {
    //    transform.__set__('gm', function(image) {
    //        expect(image).to.equal('test.jpg');
    //        this.rotate = function(colour, degress) {
    //            expect(colour).to.equal('white');
    //            expect(degress).to.equal(38);
    //            this.rotateCalled = true;
    //        }.bind(this);
    //        this.crop = function(width, height, x, y) {
    //            expect(width).to.equal();
    //            expect(height).to.equal();
    //            expect(x).to.equal();
    //            expect(y).to.equal();
    //            this.cropCalled = true;
    //        }.bind(this);
    //        this.write = function(result, done) {
    //            expect(image).to.equal('white');
    //            expect(image).to.equal(38);
    //            this.writeCalled = true;
    //        }.bind(this);
    //    });
    //
    //});

});