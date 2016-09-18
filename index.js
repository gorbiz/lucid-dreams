var GitHubApi = require('github');
var express = require('express');
var transerver = require('./lib/transerver');
var mime = require('mime');
var async = require('async');

const PORT = process.env.PORT || 3000;
var github = new GitHubApi({version: '3.0.0'});
if (process.env.GIT_USER && process.env.GIT_PASS) {
  github.authenticate({
      type: 'basic',
      username: process.env.GIT_USER,
      password: process.env.GIT_PASS
  });
}

var app = express();

var cache = {};

var trailingSlash = function(req, res, next) {
  if (req.originalUrl.substr(-1) == '/') return next();
  res.redirect(req.originalUrl + '/');
};

// gists

// trailing slash; paramount to get relatvie resources (like a script.js) right
app.get('/gists/:id', trailingSlash);
// gist loading middleware & (in memory) cache
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

var transerverServer = function (req, res, next) {
  var file = req.params.file || 'index.html';
  var content = req.transerver.get(file);
  if (!content) res.status(404).send('Sorry, can\'t find that :/');

  var mim = mime.lookup(file),
      chr = mime.charsets.lookup(mim);
  res.writeHead(200, {'Content-Type': mim + (chr ? '; charset=' + chr : '')  });
  return res.end(content);
};

app.get('/gists/:id/:file?', transerverServer);

// repos

// trailing slash; paramount to get relatvie resources (like a script.js) right
app.get(['/:user/:repo/commit/:sha', '/:user/:repo'], trailingSlash);
app.get(['/:user/:repo/commit/:sha/*', '/:user/:repo/*'], function (req, res, next) {
  var user = req.params.user, repo = req.params.repo;

  (function (cb) {
    if (req.params.sha) return cb(req.params.sha);
    github.repos.getCommits({user: user, repo: repo}, function(err, commits) {
      if (err) return next(err);
      if (!commits.length) return res.status(204).send('No Content');
      // ex https://api.github.com/repos/gorbiz/latin-book/git/trees/70e964e8dadbc84eb5250648b70f53c82d046318
      cb(commits[0].sha);
    });
  })(function (sha) {
    if (cache[user+'#'+repo+'#'+sha]) {
      // TODO check cache headers...
      console.log('loading ' + user+'/'+repo+'#'+sha + ' from cache.');
      req.transerver = cache[user+'#'+repo+'#'+sha];
      return next();
    }

    github.gitdata.getTree({ user: user, repo: repo, sha: sha, recursive: true }, function(err, tree) {
      if (err) return next(err);
      var files = {};
      async.map(tree.tree, function(node, cb) {
        if (node.type == 'tree') return cb(); // don't need folders
        if (node.type != 'blob') cb(new Error('Not sure what to do with a "' + node.type + '"'));
        node.filename = node.path;
        // ex https://api.github.com/repos/gorbiz/latin-book/git/blobs/a25df821ae7ac0f135d9f455b9987457f1d4e01f
        github.gitdata.getBlob({user: user, repo: repo, sha: node.sha}, function(err, blob) {
          if (err) return cb(err);
          node.content = '' + new Buffer(blob.content, 'base64');
          files[node.path] = node;
          cb();
        });
      }, function(err) {
        if (err) return next(err);
        req.transerver = cache[user+'#'+repo+'#'+sha] = transerver({files: files});
        next();
      });
    });
  });
});

app.get(['/:user/:repo/commit/:sha/:file(*)', '/:user/:repo/:file(*)'], transerverServer);

app.listen(PORT, function () {
  console.log('Server listening on: http://localhost:%s', PORT);
});
