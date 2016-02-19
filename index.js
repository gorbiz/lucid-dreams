var GitHubApi = require('github');
var jade = require('jade');

var github = new GitHubApi({version: '3.0.0'});

var render = {
  jade: function(content) {
    var fn = jade.compile(content, {pretty: true});
    var html = fn();
    console.log(html);
  }
};

github.gists.get({id: '252f5c6ac19879dfbda9'}, function(err, gist) {
  if (err) throw err;

  var index = gist.files['index.jade'] || gist.files['index.html'];
  if (!index) throw new Error('found no index');

  var extension = index.filename.split('.').pop();
  var renderer = render[extension];
  var html = renderer(index.content);
});
