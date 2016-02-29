var assert = require('assert');

var transerver = require('../lib/transerver');

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

    it('jade with includes', function(){
      var t = transerver({files: {
        'index.jade': {content: 'body: include time.jade'},
        'time.jade':  {content: 'time Hammer!'}
      }});
      assert.equal('<body><time>Hammer!</time></body>', t.get('index.html'));
    });

    it('jade with filters', function(){
      var t = transerver({files: {
        'index.jade': {content: 'style: include:stylus style.styl'},
        'style.styl': {content: 'body\n  color: #2cc48a'}
      }});
      assert.equal('<style>body {\n  color: #2cc48a;\n}\n</style>', t.get('index.html'));
    });

    it('jade with extends & relative paths', function(){
      var t = transerver({files: {
        'a/layout.jade': {content: 'body\n  block content'},
        'a/index.jade':  {content: 'extends layout.jade\nblock content\n  p index'},
        'a/index2.jade': {content: 'extends ./layout.jade\nblock content\n  p index'}
      }});
      assert.equal('<body><p>index</p></body>', t.get('a/index.html'));
      assert.equal('<body><p>index</p></body>', t.get('a/index2.html'));
    });
  });
});
