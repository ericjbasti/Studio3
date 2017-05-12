/**
 * DisplayObject
 * The base for all visual objects in the studio.
 */

Studio.DisplayObject = function(attr) {
	// Dimensional Settings:
	this.x        = 0
	this.y        = 0
	this.z        = 0
	this.height   = 1
	this.width    = 1
	this.scaleX   = 1
	this.scaleY   = 1
	this.anchorX  = 0.5
	this.anchorY  = 0.5
	this.rotation = 0
	this.skews 	  = 0
	// Display Settings:
	this.alpha   = 1 // sets the opacity/alpha of an object
	this.visible = 1 // invisible items are ignored when rendering
	this.speed   = 1 // the local speed of an object
	this.active  = 1 // set as inactive, and we never try to render
	// or update this or its children. Use this to
	// manually pool objects

	// Rotation Settings:
	this.orbits = true
	this.orbit = 0
	this.inheritRotation = true
	this.inheritScale = true
	this.orbitSpeed = 1

	// set attributes if provided.
	if (attr) {
		this.apply(attr)
	}
	this._boundingBox = new Studio.Box()
	//this._alpha = this.alpha;
	//this._visible = this.alpha * this.visible; // if either value = 0 we wont draw it to the screen... save some cycles.
	// Children Information
	// to save memory we don't include a default child container. This will be
	// created if one is need.
	this._parent = null
	this._hasChildren = 0 
	// we use this as a quick flag to let us know if we
	// should even think about looking for children
	// objects. It also stores our length.

	// set any of these to false if you know they will never be needed.
	// this will increase performace, by reducing calculations done per object per frame.

	// for interpolating fixed time steps
	this.__x = this._world.x
	this.__y = this._world.y
	this._dx = this._world.x
	this._dy = this._world.y
}

Studio.difference = {}

Studio.DisplayObject.prototype = {
	constructor: Studio.DisplayObject,
	_world: new Studio.DisplayProperty(),
	blendmode: 'source-over',
	// apply takes an object
	apply: Studio.apply,
	__update_XY: true,
	__update_SCALE: true,
	__update_DIMENSIONS: true,
	__update_SPEED: true,
	__update_ALPHA: true,
	__update_ROTATION: true,
	addChild: function(child) {
		// Adds a child to this object
		if (!this.hasOwnProperty('children')) {
			this.children = [] // if we didn't use 'hasOwnProperty', we would learn that JS treats [] like pointers and in this particular case will cause a crash.
		}
		if (!this.hasOwnProperty('_world')) {
			this._world = new Studio.DisplayProperty()
			this._initWorld()
		}
		if (!child.hasOwnProperty('_world')) {
			// This child is missing _world = new Studio.DisplayProperty(); the code will still run, but it is very likely to act in unexpected ways. Lets fix this.
			child._world = new Studio.DisplayProperty()
		}
		child._parent = this._world
		child._parent_box = this._boundingBox
		this.children[this._hasChildren] = child
		this._hasChildren++
		// child.z = child._world.z = -this._hasChildren*.000001;
		child.force_update()
		child._dset()
		// if(this.constructor == Studio.Stage){

		// }else{
		// 	child._world.z = (this.z*.000001)-(child.z*.000001)
		// }
		
		if (child._hasChildren) {
			child.force_update_children()
		}

		return this
	},
	removeChildAtIndex: function(child_index) {
		var length = this.children.length - 1
		for (var i = child_index; i < length; i++) {
			this.children[i] = this.children[i + 1]
		}
		this.children.length = length
		this._hasChildren = length
	},
	removeChild: function(child) {
		var length = this.children.length - 1
		for (var i = 0; i <= length; i++) {
			if (this.children[i] == child) {
				this.removeChildAtIndex(i)
				return
			}
		}
		console.log('child not found.')
	},
	_initWorld: function() {
		this._world.x = this.x
		this._world.y = this.y
		this._world.y = this.y
		this._world.z = this.z
		this._world.height = this.height
		this._world.width = this.width
		this._world.scaleX = this.scaleX
		this._world.scaleY = this.scaleY
		this._world.rotation = this.rotation
		this._world.angle = this.angle
		this._world.alpha = this.alpha
		this._world.speed = this.speed
	},
	addChildren: function() {
		// This will take a series of objects and add them to this object
		// as children. We simply call the addChild function multiple times.
		for (var i = 0; i !== arguments.length; i++) {
			this.addChild(arguments[i])
		}
		return this
	},
	getChildByName: function(name) {
		// this will look for a named object and return it. If your using
		// names (names are not required).
		for (var i = 0; i !== this._hasChildren; i++) {
			if (this.children[i].name === name) {
				return this.children[i]
			}
		}
		return null
	},
	_destroy: function() {
		for (var i in this) {
			if (!this.hasOwnProperty(i)) {
				delete this[i]
			}
		}
	},
	_order: function() {
		this.children.sort(Studio.z_index)
	},
	draw: function() {
	},
	snapPixels: function() {
		this._dx = this._dx + 0 | 0
		this._dy = this._dy + 0 | 0
		this._world.height = this._world.height + 0 | 0
		this._world.width = this._world.width + 0 | 0
	},
	hitTestPoint: function(x, y) {
		this._relativeX = x - this._world.x
		this._relativeY = y - this._world.y
		this.anchoredX = this.anchorX * this._world.width
		this.anchoredY = this.anchorY * this._world.height
		if (this._relativeX < -this.anchoredX && this._relativeY < -this.anchoredY) {
			return false
		}
		if (this._relativeX > this.width && this._relativeY > this.height) {
			return false
		}
		if (this._world.rotation) {
			x = (this._relativeX * Math.cos(-this.angle)) - (this._relativeY * Math.sin(-this.angle))
			y = (this._relativeX * Math.sin(-this.angle)) + (this._relativeY * Math.cos(-this.angle))
			this._relativeX = x
			this._relativeY = y
		}

		if ((this._relativeX > -this.anchoredX && this._relativeY > -this.anchoredY) && (this._relativeX < (this._world.width) - this.anchoredX && this._relativeY < (this._world.height) - this.anchoredY)) {
			return true
		}
		return false
	},
	hitTestRect: function(b) {
		Studio.difference.height = this._world.height + b._world.height
		Studio.difference.width = this._world.width + b._world.width
		Studio.difference.x = this._world.x - (this._world.width * this.anchorX) - b._world.x - (b._world.width * b.anchorX)
		Studio.difference.y = this._world.y - (this._world.height * this.anchorY) - b._world.y - (b._world.height * b.anchorY)

		// stage.ctx.strokeRect(Studio.difference.x,Studio.difference.y,Studio.difference.width,Studio.difference.height)

		if (Studio.difference.x < 0 && Studio.difference.y <= 0 && Studio.difference.height + Studio.difference.y >= 0 && Studio.difference.width + Studio.difference.x >= 0) {
			return true
		}
		return false
	},
	vertex_children: function(stage, ratio, interpolate) {
		if (this._hasChildren) {
			for (var i = 0; i < this._hasChildren; i++) {
				if(!this.children[i].buildElement){
					console.log('no build', this.children[i])
					return
				}
				this.children[i].buildElement(stage, ratio, interpolate)
				
				this.children[i].vertex_children(stage, ratio, interpolate)
			}
		}
	},
	buildElement : function(stage, ratio, interpolate) {
		
	},
	render_children: function(stage, ratio, interpolate) {
		if (this._hasChildren) {
			for (var i = 0; i < this._hasChildren; i++) {
				this.children[i].render(stage, ratio, interpolate)
			}
		}
	},
	render: function(stage, ratio, interpolate) {
		if (this._visible) {
			// Studio.objectDraw++;
			// if((this._x + (this._width*this.anchorX) >= 0) ||
			// 	(this._x - (this._width*this.anchorX) <= stage.width) ||
			// 	(this._y + (this._height*this.anchorY) >= 0) ||
			// 	(this._y - (this._height*this.anchorY) <= stage.height)
			// 	){
			if (interpolate) {
				this._delta(ratio)
			} else {
				this._dset()
			}
			if (stage.snap) {
				this.snapPixels()
			}
			this.draw(stage.ctx)
			// }
			this.render_children(stage, ratio, interpolate)
		}
		if (this.onExitFrame) {
			this.onExitFrame()
		}
	},
	update_visibility: function() {
		this._world.alpha = this.alpha * this._parent.alpha
		//if(this._alpha > 0){
		this._visible = this._world.alpha * this.visible
		// }else{
		// 	this._visible = false;
		// }

	},
	setAlpha: function(ctx) {
		if (this._world.alpha !== ctx.globalAlpha && this._visible) {
			ctx.globalAlpha = this._world.alpha
		}
		if (this.blendmode !== ctx.globalCompositeOperation && this._visible) {
			ctx.globalCompositeOperation = this.blendmode
		}
	},
	update_scale: function() {
		if (this.inheritScale) {
			this._world.scaleX  = this._parent.scaleX * this.scaleX
			this._world.scaleY  = this._parent.scaleY * this.scaleY
		}else{
			this._world.scaleX  = this.scaleX
			this._world.scaleY  = this.scaleY
		}
	},
	update_dimensions: function() {
		this._world.width = this.width * this._world.scaleX
		this._world.height = this.height * this._world.scaleY
	},
	update_angle: function() {
		this.angle = (this._world.rotation / 180 * 3.14159265)
	},
	update_speed: function() {
		this._world.speed = this.speed * this._parent.speed
	},
	orbitXY: function() {
		var x = this.x * this._world.scaleX
		var y = this.y * this._world.scaleY
		var sin = Math.sin((this._parent.angle + this.orbit) * this.orbitSpeed)
		var cos = Math.cos((this._parent.angle + this.orbit) * this.orbitSpeed)
		this._orbitX = (x * cos) - (y * sin)
		this._orbitY = (x * sin) + (y * cos)
	},
	update_rotation: function() {
		if (this.inheritRotation) {
			this._world.rotation = this._parent.rotation + this.rotation
		} else {
			this._world.rotation = this.rotation
		}
		if (this._world.rotation) {
			this.update_angle()
		} else {
			this.angle = 0
		}
	},
	update_orbit_xy: function() {
		this.orbitXY()
		this._world.x = this._orbitX + this._parent.x
		this._world.y = this._orbitY + this._parent.y
	},
	update_xy: function() {
		if (this.orbits && this._parent.angle) {
			this.update_orbit_xy()
		} else {
			this._world.x  = (this.x * this._parent.scaleX) + this._parent.x
			this._world.y  = (this.y * this._parent.scaleY) + this._parent.y
		}
	},
	snapshot: function() {
		this.__x = this._world.x
		this.__y = this._world.y
		if (this.__update_DIMENSIONS) {
			this.__width = this._world.width
			this.__height = this._world.height
		}
		if (this._world.rotation) {
			this._world.angle = this.angle
		}
	},
	__deltaXY: function(ratio) {
		if (this.__update_XY) {
			this._dx = this.__delta(this.__x, this._world.x, ratio)
			this._dy = this.__delta(this.__y, this._world.y, ratio)
		}
	},
	__deltaHW: function(ratio) {
		if (this.__update_DIMENSIONS) {
			this._dwidth = this.__delta(this.__width, this._world.width, ratio)
			this._dheight = this.__delta(this.__height, this._world.height, ratio)
		}
	},
	__deltaRotation: function(ratio) {
		if (this._world.rotation) {
			this._dAngle = this.__delta(this._world.angle, this.angle, ratio)
		}
	},
	__delta: function(snap, cur, ratio) {
		return snap + ((cur - snap) * ratio)
	},
	_delta: function(ratio) {
		this.__deltaXY(ratio)
		this.__deltaHW(ratio)
		this.__deltaRotation(ratio)
	},
	__dsetXY: function() {
		if (this.__update_XY) {
			this._dx = this._world.x
			this._dy = this._world.y
		}
	},
	__dsetHW: function() {
		this._dwidth = this._world.width
		this._dheight = this._world.height
	},
	__dsetRotation: function() {
		if (this._world.rotation) {
			// this._dAngle = this._parent.angle + this.angle
			this._dAngle = this._world.angle + this.angle
			// console.log(this._parent.angle )
		}
	},
	_dset: function() {
		this.__dsetXY()
		this.__dsetHW()
		this.__dsetRotation()
	},
	_snapback: function() {
		this.force_update()
	},
	force_update: function() {
		this.update_visibility()
		this.update_scale()
		this.update_speed()
		this.update_dimensions()
		this.update_rotation()
		this.update_xy()
		this.snapshot()
	},
	force_update_children: function(interpolate) {
		for (var i = 0; i < this._hasChildren; i++) {
			this.children[i].force_update()
		}
		for (var i = 0; i < this._hasChildren; i++) {
			this.children[i]._dset()
		}
	},
	_update: function(interpolate) {
		if (this.__update_ALPHA) {
			this.update_visibility()
		}
		if (this._visible) {
			if (this.__update_SCALE) {
				this.update_scale()
			}
			if (this.__update_SPEED) {
				this.update_speed()
			}
			if (this.__update_DIMENSIONS) {
				this.update_dimensions()
			}
			if (this.__update_ROTATION) {
				this.update_rotation()
			}
			if (this.__update_XY) {
				this.update_xy()
			}
			this.update_children(interpolate)
		}
	},
	update_children: function(interpolate) {
		if (!this._hasChildren) {
			return
		}
		for (var i = 0; i < this._hasChildren; i++) {
			this.children[i].update(interpolate)
		}
	},
	_logic: function() {
		if (this.logic) {
			this.logic()
		}

		if (this.onEnterFrame) {
			this.onEnterFrame()
		}
	},
	setAnchor: function(x, y) {
		this.anchorX = x
		this.anchorY = y || x
	},
	update: function(interpolate) {
		if (interpolate) {
			this.snapshot()
		}
		this._logic()
		this._update(interpolate)
	}
}
