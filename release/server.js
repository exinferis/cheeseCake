(function() {
  var app, express, s3;

  express = require("express");

  root.config = require("./config");

  s3 = require("./s3");

  app = express();

  app.use(express.compress({
    level: 7
  }));

  app.use(express.bodyParser());

  app.use(express.multipart());

  app.set("views", "" + __dirname + "/views");

  app.set("view engine", "ejs");

  app.use("/static/", express["static"]("" + __dirname + "/static"));

  app.post("/credentials", function(req, res) {
    var file, mimetype;
    if ((req.body.mimetype != null) && (req.body.file != null)) {
      mimetype = req.body.mimetype;
      file = req.body.file;
      s3.createCredentials(mimetype, file, function(err, result) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Content-Type", "application/JSON");
        res.end(JSON.stringify(result));
      });
    } else {
      res.statusCode = 400;
      res.end();
    }
  });

  app.get("/", function(req, res) {
    return res.redirect("/static/index.html");
  });

  app.get("/image", function(req, res) {
    res.end("<img src='http://letestbucket.s3.amazonaws.com/" + req.query["key"] + "'>");
  });

  app.listen(3333);

}).call(this);
