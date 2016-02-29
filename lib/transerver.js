var jade = require('jade');
var stylus = require('stylus');
var nib = require('nib');

module.exports = function(filetree, options) {
  options = options || {};
  options.pretty = options.pretty || false;
  return {
    get: function(path) {
      if (filetree.files[path]) return filetree.files[path].content;
      if ('.html' == path.substr(-5)) {
        var base = path.substr(0, path.length-5);
        if (filetree.files[base + '.jade']) {
          return jade.compile(filetree.files[base + '.jade'].content, {
              filename: 'virtual-transerver',
              pretty: options.pretty,
            })();
        }
      } else if ('.css' == path.substr(-4)) {
        var base = path.substr(0, path.length-4);
        if (filetree.files[base + '.styl']) {
          return stylus(filetree.files[base + '.styl'].content)
              .use(nib())
              .render();
        }
      }
      return false;
    }
  };
}
