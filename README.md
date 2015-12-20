Studio.js v3
=======

Canvas (and WebGL?) animation engine.

[Github.io page](http://ericjbasti.github.io/Studio3/)

It works. However the WebGL stuff is so new, it needs to be fleshed out a bit more.
The engine will progress as my projects progress. As such it probably isn't sutible for anyone besides me.
However feel free to look checkout the code, it impliments a lot of concepts (for better or worse). Again WebGL
support is new, so some of these concepts may only work with the 2d Context (until I need it with WebGL).

Studio (main engine).
- Stage (essentially your canvas with some logic added)
  - Scene (the Stage is a default Scene, however if will deligate to another Scene if you tell it to).
  - Camera (the view port, can have multiple for easy swapping)
- DisplayObject (everything that draws to the screen inherits from here)
  - Rect (a filled in displayObject)
  - Sprite (filled with an image)
  - DisplayList (a linked list version of a DisplayObject, used when children can come an go at anytime)

more info to come...


