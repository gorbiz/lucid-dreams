var jade = require('jade');

module.exports = function(filetree, options) {
  options = options || {};
  options.pretty = options.pretty || false;
  return {
    get: function(path) {
      if (filetree.files[path]) return filetree.files[path].content;
      if ('.html' == path.substr(-5)) {
        var base = path.substr(0, path.length - 5);
        if (filetree.files[base + '.jade']) {
          return jade.compile(filetree.files[base + '.jade'].content, {
              filename: 'virtual-transerver',
              pretty: options.pretty,
            })();
        }
      }
    }
  };
}
