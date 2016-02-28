var express = require('express');
var jade = require('jade');
var stylus = require('stylus');
var nib = require('nib');

var GitHubApi = require('github');

const PORT = process.env.PORT || 3000;
const PRETTY_RENDER = true;

var github = new GitHubApi({version: '3.0.0'});

var transformers = [{
      input: /(.+)(\.jade)/
    , output: 'html'
    , type: 'text/html'
    , transform: function(str) {
        return jade.compile(str, {pretty: PRETTY_RENDER || false})();
    }}
  , {
      input: /(.+)(\.styl)/
    , output: 'css'
    , type: 'text/css'
    , transform: function(str) {
        return stylus(str)
          .use(nib())
          .render();
    }
}];

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

// pre-render all transpilable files
app.get('/gists/:id/*', function (req, res, next) {
  Object.keys(req.gist.files).map(function(file) {
    transformers.filter(function(t) { return t.input.test(file);
    }).map(function(t) { // should really only be CALLED ONCE (or 0 times)
      var newFile = t.input.exec(file)[1] + '.' + t.output; // Yeah, we might overwrite an existing one; fuck it!
      req.gist.files[newFile] = {
        content: t.transform(req.gist.files[file].content),
        type: t.type
      };
    });
  });
  next();
});

app.get('/gists/:id/:file?', function (req, res, next) {
  if (!req.params.file) req.params.file = 'index.html';
  if (!req.gist.files[req.params.file]) return next();
  var file = req.gist.files[req.params.file];
  res.writeHead(200, {'Content-Type': file.type + '; charset=utf-8'});
  return res.end(file.content);
});

app.listen(PORT, function () {
  console.log('Server listening on: http://localhost:%s', PORT);
});
