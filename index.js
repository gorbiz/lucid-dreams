var http = require('http');
var GitHubApi = require('github');
var jade = require('jade');

const PORT = 3000;
const PRETTY = true;

var github = new GitHubApi({version: '3.0.0'});

var render = {
  jade: function(content) {
    var html = jade.compile(content, {pretty: PRETTY})();
    return html;
  }
  ,html: function(content) {
    return content;
  }
};


function handleRequest(req, res) {
  var id = req.url.split('/').pop();
  if (!/^[0-9a-f]{20}$/.test(id)) return console.log('ignoring request: ' + id);
  console.log('fetching gist: ' + id);


  github.gists.get({id: id}, function(err, gist) {
    if (err) throw err;

    var file = gist.files['index.jade'] || gist.files['index.html'];
    if (!file) throw new Error('found no index');

    var ext  = file.filename.split('.').pop();
    var html = render[ext](file.content);

    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(html);
  });
}

var server = http.createServer(handleRequest);
server.listen(3000, function() {
  console.log('Server listening on: http://localhost:%s', PORT);
});
