/**
 * DisplayObject
 * The base for all visual objects in the studio.
 */

Studio.Box = function(left, top, width, height) {
	this.left = left || 0;
	this.top = top || 0;
	this.right = left + width || 1;
	this.bottom = top + height || 1;
	return this;
}

Studio.Box.prototype = {
	constructor: Studio.Box,
	set: function(left, top, width, height) {
		this.left = left || this.left;
		this.top = top || this.top;
		this.right = left + width || this.right;
		this.bottom = top + height || this.bottom;
	},
	get_bounds: function(who) {
		// if(who._rotation){
		// this.get_rotated_bounds(who);
		// }else{
		this.get_straight_bounds(who);
		// }
	},
	get_straight_bounds: function(who) {
		this.left = who._dx - who._width * who.anchorX;
		this.right = this.left + who._width;
		this.top = who._dy - who._height * who.anchorY;
		this.bottom = this.top + who._height;
	},
	get_rotated_bounds: function(who) {
		this.left = who._x - who._width * who.anchorX * 2;
		this.right = this.left + who._width * 3;
		this.top = who._y - who._height * who.anchorY * 3;
		this.bottom = this.top + who._height * 2;
	},
};

Studio.Color = function(r, g, b, a) {
	this.r = r / 255 || 0;
	this.g = g / 255 || 0;
	this.b = b / 255 || 0;
	this.a = a || 1;
	this.style = "rgba(255,255,255,1)";

	this.build_style();

	return this;
}

Studio.Color.prototype = {
	constructor: Studio.Color,
	set: function(r, g, b, a) {
		this.r = r / 255;
		this.g = g / 255;
		this.b = b / 255;
		this.a = a;
		this.build_style();
	},
	build_style: function() {
		this.style = "rgba(" + parseInt(this.r * 255) + "," + parseInt(this.g * 255) + "," + parseInt(this.b * 255) + "," + this.a + ")";
	},
	hex: function(hex) {

	},
};

Studio.RED = new Studio.Color(204, 0, 17, 1);
Studio.YELLOW = new Studio.Color(255, 221, 34, 1);
Studio.BLUE = new Studio.Color(51, 170, 255, 1);

// Studio.DisplayProperty = function(attr){
// 	this.x        = 0;
// 	this.y        = 0;
// 	this.z        = 0;
// 	this.height   = 1;
// 	this.width    = 1;
// 	this.scaleX   = 1;
// 	this.scaleY   = 1;
// 	this.anchorX  = 0.5;
// 	this.anchorY  = 0.5;
// 	this.rotation = 0;

// 	this.alpha   = 1; // sets the opacity/alpha of an object
// 	this.visible = 1; // invisible items are ignored when rendering
// 	this.speed   = 1; // the local speed of an object
// 	this.active  = 1; // set as inactive, and we never try to render 
// 	// or update this or its children. Use this to
// 	// manually pool objects

// 	// Rotation Settings:
// 	this.orbits = true;
// 	this.inheritRotation = true;
// 	this.orbit_speed = 1;
	
// 	if (attr) {
// 		this.apply(attr);
// 	}
// }



Studio.DisplayObject = function(attr) {
	// Dimensional Settings:
	this.x        = 0;
	this.y        = 0;
	this.z        = 0;
	this.height   = 1;
	this.width    = 1;
	this.scaleX   = 1;
	this.scaleY   = 1;
	this.anchorX  = 0.5;
	this.anchorY  = 0.5;
	this.rotation = 0;

	// Display Settings:
	this.alpha   = 1; // sets the opacity/alpha of an object
	this.visible = 1; // invisible items are ignored when rendering
	this.speed   = 1; // the local speed of an object
	this.active  = 1; // set as inactive, and we never try to render 
	// or update this or its children. Use this to
	// manually pool objects

	// Rotation Settings:
	this.orbits = true;
	this.inheritRotation = true;
	this.orbit_speed = 1;

	// set attributes if provided.
	if (attr) {
		this.apply(attr);
	}

	// Inherited Attributes:
	// if it starts with an _ it will be overwritten.
	// These are used by the engine and you to know exactly where an item is in
	// reference to the stage, not its parent. we will default all of these
	// varibales to their own property values. However once the engine starts
	// these variables will change.
	this._x = this.x;
	this._y = this.y;
	this._scaleX = this.scaleX;
	this._scaleY = this.scaleY;
	this._width  = this.width * this._scaleX;
	this._height = this.height * this._scaleY;
	this._anchoredX = this.anchorX * this._width;
	this._anchoredY = this.anchorY * this._height;

	this._boundingBox = new Studio.Box();

	this._rotation = this.rotation;
	this._speed  = this.speed;
	this._alpha = this.alpha;
	this._visible = this.alpha * this.visible; // if either value = 0 we wont draw it to the screen... save some cycles.
	// Children Information
	// to save memory we don't include a default child container. This will be 
	// created if one is need.
	this.parent = null;
	this.hasChildren = 0; // we use this as a quick flag to let us know if we 
	// should even think about looking for children 
	// objects. It also stores our length.

	// set any of these to false if you know they will never be needed.
	// this will increase performace, by reducing calculations done per object per frame.
	this.__update_XY = true;
	this.__update_SCALE = true;
	this.__update_DIMENSIONS = true;
	this.__update_SPEED = true;
	this.__update_ALPHA = true;
	this.__update_ROTATION = true;

	this.__x = this._x;
	this.__y = this._y;
};

Studio.DisplayObject.prototype = {

	constructor: Studio.DisplayObject,

	// apply takes an object
	apply: Studio.apply,
	
	addChild: function(child) {
		// Adds a child to this object

		if (!this.hasOwnProperty("children")) {
			this.children = []; // if we didn't use 'hasOwnProperty', we would learn that JS treats [] like pointers and in this particular case will cause a crash.
		}
		child.parent = this;
		this.children[this.hasChildren] = child;
		this.hasChildren++;

		// child.force_update();
		return this;
	},
	addChildren: function() {
		// This will take a series of objects and add them to this object
		// as children. We simply call the addChild function multiple times.
		for (var i = 0; i !== arguments.length; i++) {
			this.addChild(arguments[i]);
		}
		return this;
	},
	getChildByName: function(name) {
		// this will look for a named object and return it. If your using 
		// names (names are not required).
		for (var i = 0; i !== this.hasChildren; i++) {
			if (this.children[i].name === name) {
				return this.children[i];
			}
		}
		return null;
	},
	_destroy: function() {
		for (var i in this) {
			if (!this.hasOwnProperty(i)) {
				delete this[i];
			}
		}
	},
	_order: function() {
		this.children.sort(Studio.z_index);
	},
	orbitXY: function() {
		var x = this.x;
		var y = this.y;
		var sin = Studio.sin(this.parent.angle * this.orbit_speed);
		var cos = Studio.cos(this.parent.angle * this.orbit_speed);
		this._orbitX = (x * cos) - (y * sin);
		this._orbitY = (x * sin) + (y * cos);
	},
	draw: function(ratio) {
	},
	snapPixels: function() {
		this._x = this._x + 0.5 | 0;
		this._y = this._y + 0.5 | 0;
		this._height = this._height + 0.5 | 0;
		this._width = this._width + 0.5 | 0;
	},
	hitTestPoint: function(x, y) {
		this._relativeX = x - this._x;
		this._relativeY = y - this._y;
		this.anchoredX = this.anchorX * this._width;
		this.anchoredY = this.anchorY * this._height;
		if (this._relativeX < -this.anchoredX && this._relativeY < -this.anchoredY) return false
		if (this._relativeX > this.width && this._relativeY > this.height) return false
		if (this._rotation) {
			x = (this._relativeX * Math.cos(-this.angle)) - (this._relativeY * Math.sin(-this.angle));
			y = (this._relativeX * Math.sin(-this.angle)) + (this._relativeY * Math.cos(-this.angle));
			this._relativeX = x;
			this._relativeY = y;
		}

		if ((this._relativeX > -this.anchoredX && this._relativeY > -this.anchoredY) && (this._relativeX < (this._width) - this.anchoredX && this._relativeY < (this._height) - this.anchoredY)) {
			return (true);
		}
		return (false);
	},
	vertex_children: function(stage, ratio) {
		if (this.hasChildren) {
			for (var i = 0; i !== this.hasChildren; i++) {
				this.children[i].buildElement(stage, ratio);
				// this.children[i].buildTriangles(stage,ratio);
			}
		}
	},
	render_children: function(stage, ratio) {
		if (this.hasChildren) {
			for (var i = 0; i !== this.hasChildren; i++) {
				this.children[i].render(stage, ratio);
			}
		}
	},
	render: function(stage, ratio) {
		if (this._visible) {
			// Studio.objectDraw++;
			if (stage.snapPixels) {
				this.snapPixels();
			}
			// if((this._x + (this._width*this.anchorX) >= 0) || 
			// 	(this._x - (this._width*this.anchorX) <= stage.width) ||
			// 	(this._y + (this._height*this.anchorY) >= 0) ||
			// 	(this._y - (this._height*this.anchorY) <= stage.height)
			// 	){
			this._delta(ratio);
			this.draw(stage.ctx);
			// }
			this.render_children(stage, ratio);
		}
		if (this.onExitFrame) {
			this.onExitFrame();
		}
	},
	update_children: function(ratio, delta) {
		if (this.hasChildren) {
			for (var i = 0; i !== this.hasChildren; i++) {
				this.children[i].update(ratio, delta);
			}
		}
	},
	update_visibility: function() {
		this._alpha = this.alpha * this.parent._alpha;
		//if(this._alpha > 0){
		this._visible = this._alpha * this.visible;
		// }else{
		// 	this._visible = false;
		// }
		
	},
	setAlpha: function(ctx) {
		if (this._alpha !== ctx.globalAlpha && this._visible) {
			ctx.globalAlpha = this._alpha;
		}
	},
	update_scale: function() {
		this._scaleX  = this.parent._scaleX * this.scaleX;
		this._scaleY  = this.parent._scaleY * this.scaleY;
	},
	update_dimensions: function() {
		this._width = this.width * this._scaleX;
		this._height = this.height * this._scaleY;
	},
	update_angle: function() {
		this.angle = (this._rotation / 180 * 3.14159265);
	},
	update_speed: function() {
		this._speed = this.speed * this.parent._speed;
	},
	update_rotation: function() {
		if (this.inheritRotation) {
			this._rotation = this.parent._rotation + this.rotation;
		}else {
			this._rotation = this.rotation;
		}
		if (this._rotation) { // jsperf says not being strict about the type is fastest
			// so this._rotation > this._rotation !=0 || this._rotation !== 0
			this.update_angle();
		}else {
			this.angle = 0;
		}
	},
	update_orbit_xy: function() {
		this.orbitXY();
		this._x = (this._orbitX * this.parent._scaleX) + this.parent._x;
		this._y = (this._orbitY * this.parent._scaleY) + this.parent._y;
	},
	update_xy: function() {
		if (this.orbits && this.parent.angle) {
			this.update_orbit_xy();
		}else {
			this._x  = (this.x * this.parent._scaleX) + this.parent._x;
			this._y  = (this.y * this.parent._scaleY) + this.parent._y;
		}
	},
	snapshot: function() {
		this.__x = this._x;
		this.__y = this._y;
	},
	_delta: function(ratio) {
		this._dx = this.__x + ((this._x - this.__x) * ratio);
		this._dy = this.__y + ((this._y - this.__y) * ratio);
	},
	force_update: function() {
		this.update_visibility();
		this.update_scale();
		this.update_speed();
		this.update_dimensions();
		this.update_rotation();
		this.update_xy();
	},
	update: function() {
		this.snapshot();
		// lets apply any changes before we update the object.
		if (this.onEnterFrame) {
			this.onEnterFrame();
		}
		// now that those changes have been applied lets update our stats.

		if (this.__update_ALPHA) {
			this.update_visibility();
		}
		if (this._visible) {
			if (this.__update_SCALE) {
				this.update_scale();
			}
			if (this.__update_SPEED) {
				this.update_speed();
			}
			if (this.__update_DIMENSIONS) {
				this.update_dimensions();
			}
			if (this.__update_ROTATION) {
				this.update_rotation();
			}
			if (this.__update_XY) {
				this.update_xy();
			}
			this.update_children();
		}
	},
};
