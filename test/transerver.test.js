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
  });
});
