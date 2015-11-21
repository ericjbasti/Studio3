/**
 * DisplayProperty
 */

Studio.DisplayProperty = function() {
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
	this.angle 	  = 0;
	this.alpha 	  = 1;
	this.speed 	  = 1;
}

Studio.DisplayProperty.prototype = {
	constructor: Studio.DisplayProperty,
	apply: Studio.apply
}

/**
 * DisplayObject
 * The base for all visual objects in the studio.
 */

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
	this._boundingBox = new Studio.Box();
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

	this.__x = this._world.x;
	this.__y = this._world.y;
};

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

		if (!this.hasOwnProperty("children")) {
			this.children = []; // if we didn't use 'hasOwnProperty', we would learn that JS treats [] like pointers and in this particular case will cause a crash.
		}
		if (!this.hasOwnProperty("_world")) {
			console.log('added _world to me.')
			this._world = new Studio.DisplayProperty();
		}
		if (!child.hasOwnProperty("_world")) {
			console.log('added _world to my child.')
			// This child is missing _world = new Studio.DisplayProperty(); the code will still run, but it is very likely to act in unexpected ways. Lets fix this.
			child._world = new Studio.DisplayProperty();
		}
		child.parent = this._world;
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
	draw: function(ratio) {
	},
	snapPixels: function() {
		this._dx = this._dx + 0.5 | 0;
		this._dy = this._dy + 0.5 | 0;
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
			// if((this._x + (this._width*this.anchorX) >= 0) || 
			// 	(this._x - (this._width*this.anchorX) <= stage.width) ||
			// 	(this._y + (this._height*this.anchorY) >= 0) ||
			// 	(this._y - (this._height*this.anchorY) <= stage.height)
			// 	){
			this._delta(ratio);
			if (stage.snap) {
				this.snapPixels();
			}
			this.draw(stage.ctx);
			// }
			this.render_children(stage, ratio);
		}
		if (this.onExitFrame) {
			this.onExitFrame();
		}
	},
	update_children: function(ratio, delta) {
		if (!this.hasChildren) return;
		
		for (var i = 0; i !== this.hasChildren; i++) {
			this.children[i].update(ratio, delta);
		}
	},
	update_visibility: function() {
		this._world.alpha = this.alpha * this.parent.alpha;
		//if(this._alpha > 0){
		this._visible = this._world.alpha * this.visible;
		// }else{
		// 	this._visible = false;
		// }
		
	},
	setAlpha: function(ctx) {
		if (this._world.alpha !== ctx.globalAlpha && this._visible) {
			ctx.globalAlpha = this._world.alpha;
		}
		if (this.blendmode !== ctx.globalCompositeOperation && this._visible) {
			ctx.globalCompositeOperation = this.blendmode;
		}
	},
	update_scale: function() {
		this._world.scaleX  = this.parent.scaleX * this.scaleX;
		this._world.scaleY  = this.parent.scaleY * this.scaleY;
	},
	update_dimensions: function() {
		this._world.width = this.width * this._world.scaleX;
		this._world.height = this.height * this._world.scaleY;
	},
	update_angle: function() {
		this.angle = (this._world.rotation / 180 * 3.14159265);
	},
	update_speed: function() {
		this._world.speed = this.speed * this.parent.speed;
	},
	orbitXY: function() {
		var x = this.x * this._world.scaleX;
		var y = this.y * this._world.scaleY;
		var sin = Studio.sin(this.parent.angle * this.orbit_speed);
		var cos = Studio.cos(this.parent.angle * this.orbit_speed);
		this._orbitX = (x * cos) - (y * sin);
		this._orbitY = (x * sin) + (y * cos);
	},
	update_rotation: function() {
		if (this.inheritRotation) {
			this._world.rotation = this.parent.rotation + this.rotation;
		} else {
			this._world.rotation = this.rotation;
		}
		if (this._world.rotation) {
			this.update_angle();
		} else {
			this.angle = 0;
		}
	},
	update_orbit_xy: function() {
		this.orbitXY();
		this._world.x = this._orbitX + this.parent.x;
		this._world.y = this._orbitY + this.parent.y;
	},
	update_xy: function() {
		if (this.orbits && this.parent.angle) {
			this.update_orbit_xy();
		} else {
			this._world.x  = (this.x * this.parent.scaleX) + this.parent.x;
			this._world.y  = (this.y * this.parent.scaleY) + this.parent.y;
		}
	},
	snapshot: function() {
		this.__x = this._world.x;
		this.__y = this._world.y;
		this._world.angle = this.angle;
	},
	_delta: function(ratio) {
		this._dx = this.__x + ((this._world.x - this.__x) * ratio);
		this._dy = this.__y + ((this._world.y - this.__y) * ratio);
		this._dAngle = this._world.angle + ((this.angle - this._world.angle) * ratio);
	},
	_snapback: function() {
		this.force_update();
		this.snapshot();
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
