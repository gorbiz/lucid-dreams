var express = require('express');
var path = require('path');
var jade = require('jade');
var stylus = require('stylus');
var nib = require('nib');

var GitHubApi = require('github');

const PORT = process.env.PORT || 3000;
const PRETTY_RENDER = true;

var github = new GitHubApi({version: '3.0.0'});

var render = {
  jade: function(str, cb) {
    str = jade.compile(str, {pretty: PRETTY_RENDER})();
    return cb && cb(str) || str;
  }
  ,html: function(str, cb) { return cb && cb(str) || str; }
  ,js:   function(str, cb) { return cb && cb(str) || str; }

  ,css:  function(str, cb) { return cb && cb(str) || str; }
  ,styl: function(str, cb) {
    stylus(str)
      .set('filename', 'derp.css')
      .use(nib())
      .render(function(err, css) {
        return cb(css);
      });
  }
};

var app = express();

// trailing slash; paramount to get relatvie resources (like a script.js) right
app.get('/gists/:id', function(req, res, next) {
  if (req.originalUrl.substr(-1) == '/') return next();
  res.redirect(req.originalUrl + '/');
});

// gist loading middleware
app.get('/gists/:id/*', function (req, res, next) {
  github.gists.get({id: req.params.id}, function(err, gist) {
    if (err) next(err);
    req.gist = gist;
    next();
  });
});

app.get('/gists/:id/', function (req, res) {
  var file = req.gist.files['index.jade'] || req.gist.files['index.html'];
  if (!file) throw new Error('found no index');
  var ext  = file.filename.split('.').pop();
  res.send(render[ext](file.content));
});

// TODO a simple path looking for only the file(name) requested
// app.get('/gists/:id/:file', function (req, res) {});

var headers = {js: 'application/javascript', css: 'text/css'};
app.get('/gists/:id/:file', function (req, res, next) {
  var urlPath = path.parse(req.params.file);
  if (urlPath.ext) urlPath.ext = urlPath.ext.substr(1); // remove prefix-dot
  var exts = ({html: ['html', 'jade'], css: ['css', 'styl'], js: ['js']})[urlPath.ext];
  for (var i in exts) {
    var ext = exts[i];
    var file = req.gist.files[urlPath.name + '.' + ext];
    if (!file) continue;
    return render[ext](file.content, function(content) {
      if (headers[urlPath.ext]) res.writeHead(200, {'Content-Type': headers[urlPath.ext] + '; charset=utf-8'});
      res.end(content);
    });
  }
  next('Could not handle: ' + req.params.file);
});


app.listen(PORT, function () {
  console.log('Server listening on: http://localhost:%s', PORT);
});
