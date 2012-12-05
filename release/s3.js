(function() {
  var S3Vending, crypto,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  crypto = require("crypto");

  module.exports = new (S3Vending = (function() {

    function S3Vending() {
      this.createS3Policy = __bind(this.createS3Policy, this);

      this.createCredentials = __bind(this.createCredentials, this);
      this.Secret = root.config.s3.secret;
      this.Key = root.config.s3.key;
      this.Bucket = root.config.s3.bucket;
      return;
    }

    S3Vending.prototype.createCredentials = function(mimetype, file, cb) {
      var _this = this;
      this.createS3Policy(mimetype, file, function(err, policy) {
        var s3CredObj;
        if (!err) {
          s3CredObj = {
            PolicyBase64: policy,
            Signature: crypto.createHmac("sha1", _this.Secret).update(policy).digest("base64"),
            Key: _this.Key,
            ActionStatus: "201",
            FileDescriptor: file,
            ContentType: "" + mimetype,
            Bucket: _this.Bucket
          };
        }
        cb(err, s3CredObj);
      });
    };

    S3Vending.prototype.createS3Policy = function(mimetype, file, cb) {
      var PolicyBase64, pBuffer, _date, _s3Policy;
      _date = new Date();
      _s3Policy = {
        "expiration": "" + (_date.getFullYear()) + "-" + (_date.getMonth() + 1) + "-" + (_date.getDate()) + "T" + (_date.getHours() + 1) + ":" + (_date.getMinutes()) + ":" + (_date.getSeconds()) + "Z",
        "conditions": [
          {
            "bucket": this.Bucket
          }, ["starts-with", "$Content-Disposition", ""], ["starts-with", "$key", "pic_"], {
            "acl": "public-read"
          }, {
            "success_action_status": "201"
          }, ["content-length-range", 0, 1024 * 200], ["eq", "$Content-Type", mimetype]
        ]
      };
      pBuffer = new Buffer(JSON.stringify(_s3Policy));
      PolicyBase64 = pBuffer.toString("base64");
      cb(null, PolicyBase64);
    };

    return S3Vending;

  })());

}).call(this);
