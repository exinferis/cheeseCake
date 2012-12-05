(function() {
  var CheeseCake,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  CheeseCake = (function() {

    function CheeseCake(options) {
      this.options = options;
      this.reset = __bind(this.reset, this);

      this._setUploadedVisible = __bind(this._setUploadedVisible, this);

      this._uploadError = __bind(this._uploadError, this);

      this._uploadFinished = __bind(this._uploadFinished, this);

      this._createUploadForm = __bind(this._createUploadForm, this);

      this._requestCredentials = __bind(this._requestCredentials, this);

      this.dataURItoBlob = __bind(this.dataURItoBlob, this);

      this._snapShotHandler = __bind(this._snapShotHandler, this);

      this.takeSnapShot = __bind(this.takeSnapShot, this);

      this.initUI = __bind(this.initUI, this);

      this.el = this.options.el || $("document");
      this.format = this.options.format || "image/jpeg";
      this.ext = this.options.ext || "jpg";
      this.s3provider = this.options.s3provider || "";
      this.cheese = new SayCheese(this.el);
      this.images = {};
      this.cheese.on("start", this.initUI);
      this.cheese.on("snapshot", this._snapShotHandler);
      $(".action-takepicture").on("click", this.takeSnapShot);
      $(".action-reset").on("click", this.reset);
      this.cheese.start();
      return;
    }

    CheeseCake.prototype.initUI = function() {
      $(".action-takepicture").fadeIn();
    };

    CheeseCake.prototype.takeSnapShot = function() {
      this.cheese.takeSnapshot();
    };

    CheeseCake.prototype._snapShotHandler = function(snapshot) {
      var _data, _id, _toRemoveid;
      _id = _.uniqueId("canvas_");
      _data = snapshot.toDataURL(this.format);
      this.images[_id] = this.dataURItoBlob(_data);
      if ($("#previewimages .thumbnail").length === 4) {
        _toRemoveid = $("#previewimages .thumblistitem:first").attr("id");
        this.images = _.omit(this.images, _toRemoveid);
        $("#previewimages .thumblistitem:first").remove();
      }
      $("#previewimages").append("<li class='thumblistitem' id='thumb_" + _id + "'><a href='#' class='thumbnail' id='" + _id + "'><span class='marker hide'></span></a></li>");
      $("#" + _id).append(snapshot);
      $("#" + _id).on("click", this._createUploadForm);
    };

    CheeseCake.prototype.dataURItoBlob = function(dataURI) {
      var array, binary, i;
      binary = atob(dataURI.split(",")[1]);
      array = [];
      i = 0;
      while (i < binary.length) {
        array.push(binary.charCodeAt(i));
        i++;
      }
      return new Blob([new Uint8Array(array)], {
        type: "image/jpeg"
      });
    };

    CheeseCake.prototype._requestCredentials = function(mimetype, file, cb) {
      var _this = this;
      $.ajax({
        type: "POST",
        url: "" + this.s3provider + "/credentials",
        data: {
          mimetype: mimetype,
          file: file
        },
        success: function(res) {
          cb(JSON.parse(res));
        },
        error: function(err) {
          alert("An error occurred receiving the S3 credentials from the server.");
        }
      });
    };

    CheeseCake.prototype._createUploadForm = function(event) {
      var _fName, _id,
        _this = this;
      _id = $(event.currentTarget).attr("id");
      $("#" + _id).append("<span class='ajaxloader'></span>");
      $(".action-takepicture").fadeOut();
      if (this.images[_id] != null) {
        _fName = "pic_" + (moment().valueOf().toString(16));
        this._requestCredentials(this.format, _fName, function(res) {
          var formData, xhr;
          formData = new FormData;
          formData.append("key", "" + res.FileDescriptor + "." + _this.ext);
          formData.append("acl", "public-read");
          formData.append("Content-Disposition", "");
          formData.append("Content-Type", res.ContentType);
          formData.append("success_action_status", res.ActionStatus);
          formData.append("AWSAccessKeyId", res.Key);
          formData.append("Policy", res.PolicyBase64);
          formData.append("Signature", res.Signature);
          formData.append("file", _this.images[_id]);
          try {
            xhr = new XMLHttpRequest;
            xhr.onreadystatechange = function() {
              if (xhr.readyState === 4) {
                if (xhr.status === 200 || xhr.status === 201) {
                  _this._uploadFinished(_id, "http://" + res.Bucket + ".s3.amazonaws.com/" + res.FileDescriptor + "." + _this.ext);
                } else {
                  _this._uploadError(_id, xhr.status);
                }
              }
            };
            xhr.onprogress = function(progress) {
              console.log("Progress!", progress);
            };
            xhr.open("POST", "http://" + res.Bucket + ".s3.amazonaws.com", true);
            xhr.send(formData);
          } catch (e) {
            _this._uploadError(_id, e);
          }
        });
      }
    };

    CheeseCake.prototype._uploadFinished = function(id, link) {
      this._setUploadedVisible(id);
      $("#" + id).find(".marker").css({
        "background-position": "left bottom",
        "display": "block"
      });
      $("#thumb_" + id).append("<div class='alert alert-success'>Your picture has been uploaded like a boss! <a href='" + link + "' target='blank'>Link</a></div>");
    };

    CheeseCake.prototype._uploadError = function(id, e) {
      this._setUploadedVisible(id);
      $("#" + id).find(".marker").css({
        "background-position": "right bottom",
        "display": "block"
      });
      $("#thumb_" + id).append("<div class='alert alert-error'>An error occurred while uploading the file.</div>");
    };

    CheeseCake.prototype._setUploadedVisible = function(id) {
      $(".thumblistitem").not("#thumb_" + id).fadeTo(500, 0.5);
      $("#previewimages .thumbnail").off();
      $("#" + id).find(".ajaxloader").remove();
      $(".action-reset").fadeIn();
    };

    CheeseCake.prototype.reset = function() {
      this.images = {};
      $("#previewimages").empty();
      $(".action-reset").fadeOut(function() {
        return $(".action-takepicture").fadeIn();
      });
    };

    return CheeseCake;

  })();

  window.CheeseCake = CheeseCake;

}).call(this);
