var http = require('http');
var jade = require('jade');
var stylus = require('stylus');
var nib = require('nib');

var GitHubApi = require('github');

const PORT = process.env.PORT || 3000;
const PRETTY = true;

var github = new GitHubApi({version: '3.0.0'});

var render = {
  jade: function(str) {
    var html = jade.compile(str, {pretty: PRETTY})();
    return html;
  }
  ,html: function(str) { return str; }
  ,js:   function(str) { return str; }
  ,css:  function(str) { return str; }

  ,styl: function(str, cb) {

    stylus(str)
      .set('filename', 'derp.css')
      .use(nib())
      .render(function(err, css) {
        return cb(css);
      });
  }
};

var gist = {};
function handleRequest(req, res) {

  function notFound() {
    res.writeHead(404);
    res.end();
  }

  var id = req.url.split('/').pop();

  if (/^[0-9a-f]{20}$/.test(id)) {
    console.log('fetching gist: ' + id);
    github.gists.get({id: id}, function(err, gistJson) {
      if (err) throw err;
      gist = gistJson;

      // consider looking for index.* then: if (render[ext]) ...
      var file = gist.files['index.jade'] || gist.files['index.html'];
      if (!file) throw new Error('found no index');

      var ext  = file.filename.split('.').pop();
      res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
      res.end(render[ext](file.content));
    });

  } else if(/\.js$/.test(id)) {
    if (!gist.files || !gist.files[id]) return notFound();

    var file = gist.files[id];
    var ext = file.filename.split('.').pop();
    res.writeHead(200, {'Content-Type': 'application/javascript; charset=utf-8'});
    res.end(render[ext](file.content));

  } else if(/\.css$/.test(id)) {
    var base = id.match(/^(.+)\.css$/)[1];
    var file = gist.files[base + '.styl'] || gist.files[base + '.css'];
    if (!id) return notFound();

    var ext = file.filename.split('.').pop();
    render[ext](file.content, function(css) {
      res.writeHead(200, {'Content-Type': 'text/css; charset=utf-8'});
      res.end(css);
    });

  } else {
    notFound();
  }
}

var server = http.createServer(handleRequest);
server.listen(3000, function() {
  console.log('Server listening on: http://localhost:%s', PORT);
});
