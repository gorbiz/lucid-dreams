# Transerver
Web server serving Gists & GitHub repos,  
also supports [Jade](http://jade-lang.com/) & [Stylus](http://stylus-lang.com/).

Supported forms:
```
http://host/GIST_ID/[filename]
http://host/USER/REPO/[filename]
http://host/USER/REPO/commit/SHA/[filename]
```

## Examples
https://gist.github.com/gorbiz/252f5c6ac19879dfbda9  
→ http://gorbiz.com/gists/252f5c6ac19879dfbda9/

https://github.com/gorbiz/touchart  
→ http://gorbiz.com/gorbiz/touchart

https://github.com/gorbiz/touchart/commit/c4dd0995213a18a9dffc029906537d308988bb5a  
→ http://gorbiz.com/gorbiz/touchart/commit/c4dd0995213a18a9dffc029906537d308988bb5a

PS.
This is running on *gorbiz.com*.

## Ideas
### Browser extension like bl.ocks’
See: https://github.com/mbostock/bl.ocks.org/tree/master/chrome/bl.ocks.chrome

### /edit => brings editor with real-time feedback
Imagine a side-by-side editor (~[CodePen](https://codepen.io)).  
Use ex. [CodeMirror](https://codemirror.net/); precompile & reload on change.

Also allow initiating **pull request** (save changes).

This would, could or should:
 - ease quick fixes
 - ease development & testing for normal humans
 - [ and there was a third thing?.. ]
