var assert = require('assert');

var transerver = require('../lib/transerver.js');

describe('transerver', function(){

  describe('serves', function(){
    it('html', function(){
      var t = transerver({files: {
        'index.html': {content: '<h1>HAI!</h1>'}
      }});
      assert.equal('<h1>HAI!</h1>', t.get('index.html'));
    });

    it('multiple files', function(){
      var t = transerver({files: {
        'index.html': {content: '<h1>HAI!</h1>'},
        'menu.html': {content: '<nav>menu</nav>'}
      }});
      assert.equal('<h1>HAI!</h1>',   t.get('index.html'));
      assert.equal('<nav>menu</nav>', t.get('menu.html'));
    });

    it('jade', function(){
      var t = transerver({files: {
        'index.jade': {content: 'h1 HAI!'}
      }});
      assert.equal('<h1>HAI!</h1>', t.get('index.html'));
    });

    it('stylus', function(){
      var t = transerver({files: {
        'style.styl': {content: 'body\n  padding: 50px'}
      }});
      assert.equal('body {\n  padding: 50px;\n}\n', t.get('style.css'));
    });

    it('stylus with nib', function(){
      var t = transerver({files: {
        'style.styl': {content:
            '@import nib\n'+
            '#right\n'+
            '  fixed: right'}
      }});
      assert.equal(
        '#right {\n'+
        '  position: fixed;\n'+
        '  right: 0;\n'+
        '}\n',
        t.get('style.css'));
    });

    it('jade with includes');

  });
});
