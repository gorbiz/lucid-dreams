var assert = require('assert');

var transerver = require('../lib/transerver.js');

describe('transerver', function(){

  describe('basic', function(){
    it('should serve html', function(){
      var t = transerver({files: {
        'index.html': {content: '<h1>HAI!</h1>'}
      }});
      assert.equal('<h1>HAI!</h1>', t.get('index.html'));
    });

    it('should serve multiple files', function(){
      var t = transerver({files: {
        'index.html': {content: '<h1>HAI!</h1>'},
        'menu.html': {content: '<nav>menu</nav>'}
      }});
      assert.equal('<h1>HAI!</h1>',   t.get('index.html'));
      assert.equal('<nav>menu</nav>', t.get('menu.html'));
    });

    it('should serve jade', function(){
      var t = transerver({files: {
        'index.jade': {content: 'h1 HAI!'}
      }});
      assert.equal('<h1>HAI!</h1>', t.get('index.html'));
    });

    it('should serve stylus', function(){
      var t = transerver({files: {
        'style.styl': {content: 'body\n  padding: 50px'}
      }});
      assert.equal('body {\n  padding: 50px;\n}\n', t.get('style.css'));
    });

    it('should serve stylus with nib');
    it('should serve stylus with that other thing available @ CodePen...');
  });
});
