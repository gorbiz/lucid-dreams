var GitHubApi = require('github');
var express = require('express');
var transerver = require('./lib/transerver');
var mime = require('mime');

const PORT = process.env.PORT || 3000;
var github = new GitHubApi({version: '3.0.0'});
var app = express();

// trailing slash; paramount to get relatvie resources (like a script.js) right
app.get('/gists/:id', function(req, res, next) {
  if (req.originalUrl.substr(-1) == '/') return next();
  res.redirect(req.originalUrl + '/');
});

// gist loading middleware & (in memory) cache
var cache = {};
app.get('/gists/:id/*', function (req, res, next) {
  var id = req.params.id;

  if (cache['gist#' + id]) {
    // TODO check cache headers...
    console.log('loading ' + id + ' from cache.');
    req.transerver = cache['gist#'+id];
    return next();
  }

  github.gists.get({id: id}, function(err, gist) {
    if (err) next(err);
    req.transerver = cache['gist#'+id] = transerver(gist);
    next();
  });
});

app.get('/gists/:id/:file?', function (req, res, next) {
  var file = req.params.file || 'index.html';
  var content = req.transerver.get(file);
  if (!content) res.status(404).send('Sorry, can\'t find that :/');

  var mim = mime.lookup(file),
      chr = mime.charsets.lookup(mim);
  res.writeHead(200, {'Content-Type': mim + (chr ? '; charset=' + chr : '')  });
  return res.end(content);
});

app.listen(PORT, function () {
  console.log('Server listening on: http://localhost:%s', PORT);
});
