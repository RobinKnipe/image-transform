var path = require('path');
var express = require('express');
var router = express.Router();
var formidable = require('formidable');

router.post('/', function(req, res, next) {
  var form = new formidable.IncomingForm();
  //Formidable uploads to operating systems tmp dir by default
  form.uploadDir = path.join(path.dirname(__dirname), 'public/images/uploads/temp');
  form.keepExtensions = true;
  form.parse(req, function(err, fields, files) {
    if (err) {
      console.dir(err);
      next(err);
    }
    else {
      console.dir(fields);
      console.dir(files);
      var temp = 'images/uploads/temp/'+path.basename(files.passport.path);
      res.send({ preview: temp })
    }
  });
});

module.exports = router;
