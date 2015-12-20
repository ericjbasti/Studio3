Studio.js v3
=======

Canvas (and WebGL?) animation engine.

[Github.io page](http://ericjbasti.github.io/Studio3/)

It works. It's small. As far as I can tell it's fast.
Uses a fixed timestep (defaults to 60fps).

*WebGL is essentially just Rects and Sprites at this point, but in some instances thats enough.
WebGL code only does 1 draw call, so we are limited to ~16,000 objects and 1 spritesheet.*

Studio.js v3

- Stage
  - Scene
  - Camera

- DisplayObject
  - Rect
  - Sprite
    - ImageSlice
    - SpriteAnimation
    - SpriteSheet
  - DisplayList
  - TextBox
  - Circle
  - Clip
    - ClipCircle
    - Restore
  - Tween

- Components
  - DisplayProperties
  - Box
  - Color
  - Image
  - Cache

- Input
  - Keyboard
  - Mouse
  - Touch
  - Tilt
  - Gamepad

- Effects

more info to come...


