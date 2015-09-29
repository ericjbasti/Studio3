// These are used to enable compatablity with older browsers.
// The canvas rendering engine will even work on an original iPhone running iOS 3.1 (13 sprites / 24 fps)
// 

// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
	console.warn("This browser does not support Object.keys() . Using polyfill instead.");
	Object.keys = (function() {
		var hasOwnProperty = Object.prototype.hasOwnProperty,
			hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
			dontEnums = [
				'toString',
				'toLocaleString',
				'valueOf',
				'hasOwnProperty',
				'isPrototypeOf',
				'propertyIsEnumerable',
				'constructor'
			],
			dontEnumsLength = dontEnums.length;

		return function(obj) {
		if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
			throw new TypeError('Object.keys called on non-object');
		}

		var result = [], prop, i;

		for (prop in obj) {
			if (hasOwnProperty.call(obj, prop)) {
				result.push(prop);
			}
		}

		if (hasDontEnumBug) {
			for (i = 0; i < dontEnumsLength; i++) {
				if (hasOwnProperty.call(obj, dontEnums[i])) {
					result.push(dontEnums[i]);
				}
			}
		}
		return result;
	};
	}());
}

if (typeof Object.create != 'function') {
	console.warn("This browser does not support Object.create() . Using polyfill instead.");
	Object.create = (function() {
		var Temp = function() {};
		return function(prototype) {
			if (arguments.length > 1) {
				throw Error('Second argument not supported');
			}
			if (typeof prototype != 'object') {
				throw TypeError('Argument must be an object');
			}
			Temp.prototype = prototype;
			var result = new Temp();
			Temp.prototype = null;
			return result;
		};
	})();
}

(function() {
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
	}
	if (!window.requestAnimationFrame) {
		console.warn("This browser does not support requestAnimationFrame() . Using setTimeout() instead.");
		window.requestAnimationFrame = function(callback) {
			var id = window.setTimeout(function() {
				callback(Date.now());
			}, 1000 / 30);
			return id;
		};
	}
	if (!window.cancelAnimationFrame) {
		window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
	}
}());


// @codekit-prepend "requirements.js"

// @codekit-append "display/displayObject.js"
// @codekit-append "display/LinkedList.js"
// @codekit-append "display/DisplayList.js"
// @codekit-append "display/Plugin.js"
// @codekit-append "display/rect.js"
// @codekit-append "display/circle.js"
// @codekit-append "display/image.js"
// @codekit-append "display/sprite.js"
// @codekit-append "display/camera.js"
// @codekit-append "display/scene.js"
// @codekit-append "display/stage.js"
// @codekit-append "engines/webgl.js"
// @codekit-append "engines/canvas.js"
// @codekit-append "display/tween.js"
// @codekit-append "display/font.js"
// @codekit-append "display/textbox.js"
// @codekit-append "input/keyboard.js"
// @codekit-append "input/touch.js"

'use strict';

// Copyright  Vincent Piel 2013.
// https://github.com/gamealchemist/Javascript-Pooling
// setupPool.
// setup a pool on the function, add a pnew method to retrieve objects
// from the pool, and add a hidden pdispose method to the instances so
// they can be sent back on the pool.
// use : MyPureJSClass.setupPool(100);
// then : var myInstance = MyPureJSClass.pnew(23, 'arg 2', ..)
function setupPool(newPoolSize) {
	//debugger;
	if (!(newPoolSize >= 0)) throw('setupPool takes a size >= 0 as argument.');
	this.pool                = this.pool || []    ;
	this.poolSize            = this.poolSize || 0 ;
	this.pnew                = pnew               ;
	if (Object.defineProperty) {
		Object.defineProperty(this.prototype, 'pdispose', {value: pdispose}) ;
	}else {
		Object.prototype.pdispose = pdispose;
	}
	// pre-fill the pool.
	while (this.poolSize < newPoolSize) { (new this()).pdispose(); }
	// reduce the pool size if new size is smaller than previous size.
	if (this.poolSize > newPoolSize) {
		this.poolSize    =  newPoolSize ;
		this.pool.length =  newPoolSize ; // allow for g.c.
	}
}

// pnew : method of the constructor function.
//        returns an instance, that might come from the pool
//        if there was some instance left,
//        or created new, if the pool was empty.
// 		  instance is initialized the same way it would be when using new
function  pnew() {
	var pnewObj  = null     ;
	if (this.poolSize !== 0) {              // the pool contains objects : grab one
		this.poolSize--  ;
		pnewObj = this.pool[this.poolSize];
		this.pool[this.poolSize] = null   ;
	} else {
		pnewObj = new this() ;             // the pool is empty : create new object
	}
	this.apply(pnewObj, arguments);           // initialize object
	return pnewObj;
}

// pdispose : release on object that will return in the pool.
//            if a dispose method exists, it will get called.
//            do not re-use a pdisposed object.
function pdispose() {
	var thisCttr = this.constructor;
	if (this.dispose) this.dispose()          ;  // Call dispose if defined
	thisCttr.pool[thisCttr.poolSize++] = this ;  // throw the object back in the pool
}

if (Object.defineProperty) {
	Object.defineProperty(Function.prototype, 'setupPool', {value: setupPool});
}else {
	Function.prototype.setupPool = setupPool;
}

if (!window.Studio) {
	window.Studio = {  // alt+S = ß just for those that hate writing things out.
		stages: [],
		stage: null,
		tko: null,
		assets: {length: 0},
		queue: 0,
		progress: 0,
		sin: Math.sin,
		cos: Math.cos,
		random: Math.random,
		abs: Math.abs,
		my: {ratio: 1},
		temp: {},
		info: {displayObjects: 0},
		active: true,
		cap: 34,
		draws: 0,
		loaded: true,
		version: '0.5.1',
		now: 0, // to get around Safari not supporting performance.now() you can pull in the timestap with this property.
		delta: 0,
	};
	Studio.time = 1;
	Studio.interval = null;
	Studio.browser = navigator.userAgent.toLowerCase();
	Studio.disableRAF = false;
}

Studio.start = function(time_stamp) {
	//Studio.stage=Studio.stages[0];
	if (time_stamp) {
		Studio.time = time_stamp;
		requestAnimationFrame(Studio.loop);

	}else {
		requestAnimationFrame(Studio.start);
	}
};

Studio.loop = function(time_stamp) {
	requestAnimationFrame(Studio.loop);

	Studio.tick(time_stamp);
	Studio.draws = 0;

	// for(var m = 0; m!== Studio.stages.length; m++){
	// 	Studio.stage = Studio.stages[m];
	// 	if(Studio.stage.active){
	Studio.stage.loop(Studio.delta);
	// }
	// }
};

Studio.capped = function(time_stamp) {
	// var time_stamp = Date.now();
	this.delta      = time_stamp - this.now;
	this.now       = time_stamp;
	this.delta = this.cap > this.delta ? this.delta : this.cap;
	// this.frameRatio = this.delta/16.666666666666668; // vs 60fps
};

Studio.uncapped = function(time_stamp) {
	this.delta      = time_stamp - this.now;
	this.now       = time_stamp;
	// this.frameRatio = this.delta/16.666666666666668; // vs 60fps
};

Studio.tick = Studio.capped;

Studio.stopTime = function() {
	//this.time = this.now();
	//this.delta = this.frameRatio = 0;
	//this.active=false;
	// console.log('STOP');
};

Studio.resetTime = function() {
	//this.active=true;
	//this.start();
	// console.log('START');
};

Studio.z_index = function(a, b) {
	if (a.z < b.z) {
		return -1;
	}
	if (a.z > b.z) {
		return 1;
	}
	return 0;
};

Studio.round = function(x) {
	return x + 0.5 | 0;
};

// apply(obj:Object)
// this will modify or add the current object to contain the contents of the object (obj) being passed in.

Studio.apply = function(obj) { // Display Object and a few others share this function. All children of displayObject inherit this function.
	Studio.temp.keys = Object.keys(obj); // we use Studio.temp.keys to avoid creating more garbage.
	Studio.temp.keys_i = Studio.temp.keys.length;
	while (Studio.temp.keys_i) {
		Studio.temp.key = Studio.temp.keys[Studio.temp.keys_i - 1];
		this[Studio.temp.key] = obj[Studio.temp.key];
		Studio.temp.keys_i--;
	}
	return this;
}

// addTo()

Studio.addTo = function(a, b) {
	for (var attr in b) {
		if (b.hasOwnProperty(attr) && !a.hasOwnProperty(attr)) {
			a[attr] = b[attr];
		}
	}
}

Studio.infoStyle = 'background-color: #3af; padding: 2px 4px; color: #fff';
Studio.errorStyle = 'background-color: #c01; padding: 2px 4px;';
Studio.warningStyle = 'background-color: #fd2; padding: 2px 4px;';
Studio.engineStyle = 'background-color: #eee; color: #3af; padding: 1px 4px; border: 1px solid #3af';



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


var LinkedList = function() {
	this.first 	= 	null;
	this.last	= 	null;
	this.length = 	0;
};

LinkedList.prototype = {
	add: function(who) {
		who.parent = this.parent;

		this.length++; // add to our length so we can easily tell how big our list is.
		if (this.length <= 1 && this.first === null && this.last === null) {
			this.first = who;
			this.last = who;
			who.prev = null;
			this.length = 1
			return who;
		}
		this.last.next = who; // we add the new item to the previously last item.
		who.prev = this.last; // we mark the new items previous to be the last item in the list.
		this.last = who; // we have a new last item now.
		return who;
	},
	insert: function(a, b) {
		this.length++;
		a.prev = b;
		if (b != this.last) {
			b.next = a;
		}else {
			this.last = a;
			a.next = this.first;
		}
	},
	init: function() {
		this.next	=	null;
		this.prev	=	null;
		this.first 	= 	null;
		this.last	= 	null;
		this.length = 	0;
	},
	remove: function(who) {
		if (this.length === 1) {
			this.init();
			who.next = null;
			who.prev = null;
			return; // nothing to see here lets move on.
		}
		// check for the begining or the end of the list
		if (this.first === who) {
			this.first = this.first.next;
		}else if (this.last === who) {
			this.last = this.last.prev;
		}

		// debugger;
		if (who.prev) {
			who.prev.next = who.next;
		}
		if (who.next) {
			who.next.prev = who.prev;
		}

		who.next = null;
		who.prev = null;

		if (this.first === null) {
			this.last = null;
		}
		this.length--;
	},
	update: function(r, d) {
		var listItem = this.first;
		while (listItem) {
			// while we still have a list item lets do some fun stuff.

			this.next = listItem.next;
			// we need to hold on to the next in line. 
			// WHY: I've been known to delete an object in the list
			// thus causing listItem.next to return null.
			// By saving this reference we can always continue on
			// through the list.

			listItem.update(r, d);
			// lets perform the objects update function.

			listItem = listItem.next || this.next;
			// if the item has a next lets use it. otherwise lets use the one we saved
			// just for this occassion. If both are null thats fine to.
			// we really are at the end of the list.
		}
	},
	render: function(e, f) {
		var listItem = this.first;
		while (listItem) {
			this.next = listItem.next;
			listItem._delta(f);
			listItem.render(e, f);
			listItem = listItem.next || this.next;
		}
	},
	action: function(what) {
		var listItem = this.first;
		while (listItem) {
			this.next = listItem.next;
			listItem[what]();
			listItem = listItem.next || this.next;
		}
	},
	removeAll: function(exception) {
		var listItem = this.first;
		while (listItem) {
			this.next = listItem.next;
			if (this.pdispose) {
				this.pdispose();
			}
			this.remove(listItem);
			listItem = listItem.next || this.next;
		}
		listItem = null;
		if (exception) {
			this.add(exception);
		}
	},
	print_f: function() {
		var listItem = this.first;
		var toString = "linked list : [";
		while (listItem) {
			toString += listItem;
			listItem = listItem.next;
		}
		toString += '];';
	}
};

LinkedList.prototype.constructor = LinkedList;


Studio.DisplayList = function(attr) {
	this.cache = null;
	this.ctx = null;
	this.cached = false;
	this.first 	= null;
	this.last	= null;
	this.length = 0;
	this.marked = [];
	this.autoCache = true;
	if (attr) {
		this.apply(attr); 
	}
}

Studio.DisplayList.prototype = new Studio.DisplayObject();
Studio.DisplayList.prototype.constructor = Studio.DisplayList;

Studio.DisplayList.prototype.cacheAsBitmap = function(who) {
	this.cache = document.createElement('canvas');
	this.cache.height = this.height * who.resolution || 400;
	this.cache.width = this.width * who.resolution  || 320;
	this.ctx = this.cache.getContext('2d');
	this.ctx.scale(who.resolution, who.resolution);
	// document.body.appendChild(this.cache);
}

Studio.DisplayList.prototype.updateCache = function() {
	this.cached = false;
	this.ctx.clearRect(0, 0, this.width, this.height);
	this.render(this);
	this.cached = true;
}
Studio.DisplayList.prototype._cacheIt = function() {
	this.ctx.clearRect(0, 0, this.width, this.height);
	this.render(this);
}
Studio.DisplayList.prototype.updateElement = function(who) {
	who.render(this);
}

Studio.DisplayList.prototype.clearCachedElement = function(who) {
	this.ctx.clearRect(who._x - who.width / 2, who._y - who.height / 2, who.width, who.height);
}

Studio.DisplayList.prototype.markedForRemoval = function(who) {
	this.marked[this.marked.length] = who;
	// this.marked.length++;
}

Studio.DisplayList.prototype.removeMarked = function() {
	for (var i = 0; i != this.marked.length; i++) {
		if (this.marked[i]) {
			this.clearCachedElement(this.marked[i]);
		}
		this.marked[i] = null;
	}
	this.marked.lengh = 0;
}

Studio.DisplayList.prototype.deactivateCache = function() {
	this.cached = false;
}

Studio.DisplayList.prototype.update = function(e, f) {
	if (this.marked.length) {
		this.removeMarked();
	}
	//if(this.cache){
	this.update_visibility();
	this.update_scale();
	this.update_dimensions();
	this.update_xy();
	this.update_speed();
	//}
	var listItem = this.first;
	while (listItem) {
		this.next = listItem.next;
		listItem.update(e, f);
		listItem = listItem.next || this.next;
	}
	if (!this.cached && this.autoCache && this.ctx) {
		this.updateCache();
	}
}

Studio.DisplayList.prototype.render = function(e, f) {
	if (this.cached) {
		if (this._alpha !== e.ctx.globalAlpha) {
			e.ctx.globalAlpha = this._alpha;
		}
		this.draw(e.ctx);
	}else {
		
		var listItem = this.first;
		while (listItem) {
			this.next = listItem.next;
			listItem._delta(f);
			listItem.render(e, f);
			listItem = listItem.next || this.next;
		}
	}
}
Studio.DisplayList.prototype.add = function(who) {
	who.parent = this;

	this.length++; // add to our length so we can easily tell how big our list is.
	if (this.length <= 1 && this.first === null && this.last === null) {
		this.first = who;
		this.last = who;
		who.prev = null;
		this.length = 1
		return who;
	}
	this.last.next = who; // we add the new item to the previously last item.
	who.prev = this.last; // we mark the new items previous to be the last item in the list.
	this.last = who; // we have a new last item now.
	return who;
}

Studio.DisplayList.prototype.draw = function(ctx) {
	ctx.drawImage(this.cache, 0, 0, this.cache.width, this.cache.height, this._x, this._y, this._width, this._height);
};

Studio.addTo(Studio.DisplayList.prototype, LinkedList.prototype);



Studio.Plugin = function(attr) {
	this.init = null;
	this.options = {};
	this.action = null;

	this.apply(attr);
}

Studio.Plugin.constructor = Studio.Plugin;

Studio.Plugin.prototype.apply = Studio.DisplayObject.prototype.apply;

Studio.Plugin.prototype._options = function(a) {
	for (var i in a) {
		this.options[i] = a[i];
	}
}



/**
 * Rect
 */

Studio.Rect = function(attr) {
	this.color = new Studio.Color(1, 0, 0, 0);
	this.slice = new Studio.Box(10, 0, 0, 0);
	if (attr) {
		this.apply(attr); 
	}
};

Studio.Rect.prototype = new Studio.DisplayObject();
Studio.Rect.prototype.constructor = Studio.Rect;

Studio.Rect.prototype.setTexture = function(tx, ty, tX, tY) {

}

Studio.Rect.prototype.addVert = function(gl, x, y, z, tx, ty) {
	gl._batch[gl._count++] = x;
	gl._batch[gl._count++] = y;
	// gl._batch[gl._count+2] = 1;
	gl._batch[gl._count++] = this.color.r;
	gl._batch[gl._count++] = this.color.g;
	gl._batch[gl._count++] = this.color.b;
	gl._batch[gl._count++] = this.color.a;
	gl._batch[gl._count++] = (tx);
	gl._batch[gl._count++] = (ty);
	// gl._count +=8;
}

Studio.Rect.prototype.buildElement = function(gl, ratio) {
	this._delta(ratio);
	this._boundingBox.get_bounds(this);
	this.addVert(gl, this._boundingBox.left, this._boundingBox.top, this._z, this.slice.left, this.slice.top);
	this.addVert(gl, this._boundingBox.right, this._boundingBox.top, this._z, this.slice.right, this.slice.top);
	this.addVert(gl, this._boundingBox.left, this._boundingBox.bottom, this._z, this.slice.left, this.slice.bottom);
	this.addVert(gl, this._boundingBox.right, this._boundingBox.bottom, this._z, this.slice.right, this.slice.bottom);
};

Studio.Rect.prototype.buildTriangles = function(gl, ratio) {
	this._delta(ratio);
	this._boundingBox.get_bounds(this);
	this.addVert(gl, this._boundingBox.left, this._boundingBox.top, this._z, this.slice.left, this.slice.top);
	this.addVert(gl, this._boundingBox.right, this._boundingBox.top, this._z, this.slice.right, this.slice.top);
	this.addVert(gl, this._boundingBox.left, this._boundingBox.bottom, this._z, this.slice.left, this.slice.bottom);
	this.addVert(gl, this._boundingBox.right, this._boundingBox.top, this._z, this.slice.right, this.slice.top);
	this.addVert(gl, this._boundingBox.left, this._boundingBox.bottom, this._z, this.slice.left, this.slice.bottom);
	this.addVert(gl, this._boundingBox.right, this._boundingBox.bottom, this._z, this.slice.right, this.slice.bottom);
};

Studio.Rect.prototype.setStyle = function(ctx) {
	if (this.color !== ctx.fillStyle) {
		ctx.fillStyle = this.color.style;
	}
};

Studio.Rect.prototype.prepAngled = function(ctx) {
	if (this._x || this._y) {
		ctx.translate(this._x, this._y);
	}
	ctx.rotate(this.angle || 0);

	if (this._scaleX !== 1 || this._scaleY !== 1) {
		ctx.scale(this._scaleX, this._scaleY);
	}
};

Studio.Rect.prototype.drawAngled = function(ctx) {
	ctx.save();
	this.prepAngled(ctx);
	ctx.fillRect(-(this.width * this.anchorX), -(this.height * this.anchorY), this.width, this.height);
	ctx.restore();
};

Studio.Rect.prototype.draw = function(ctx, ratio) {
	this.setStyle(ctx);
	this.setAlpha(ctx);
	if (this.angle) {
		this.drawAngled(ctx);
	}else {
		ctx.fillRect(this._dx - (this._width * this.anchorX), this._dy - (this._height * this.anchorY), this._width, this._height);
	}
};

Studio.difference = {};

Studio.Rect.prototype.hitTestRect = function(b) {
	Studio.difference.height = this._height + b._height;
	Studio.difference.width = this._width + b._width;
	Studio.difference.x = this._x - (this._width * this.anchorX) - b._x - (b._width * b.anchorX);
	Studio.difference.y = this._y - (this._height * this.anchorY) - b._y - (b._height * b.anchorY);
	if (Studio.difference.x < 0 && Studio.difference.y <= 0 && Studio.difference.height + Studio.difference.y >= 0 && Studio.difference.width + Studio.difference.x >= 0) {
		return true;
	}
	return false;
};



Studio.Clip = function(attr) {
	if (attr) {
		this.apply(attr); 
	}
};

Studio.Clip.prototype = new Studio.Rect();
Studio.Clip.prototype.constructor = Studio.Clip;

Studio.Clip.prototype.draw = function(ctx, ratio) {
	ctx.save();
    ctx.beginPath();
    if (this.angle) {
		this.drawAngled(ctx);
	}else {
		ctx.rect(this._dx - (this._width * this.anchorX), this._dy - (this._height * this.anchorY), this._width, this._height)
	}
	ctx.stroke();
	ctx.clip();
};
Studio.Clip.prototype.drawAngled = function(ctx) {
	this.prepAngled(ctx);
	ctx.rect(-(this.width * this.anchorX), -(this.height * this.anchorY), this.width, this.height);
};

Studio.CircleClip = function(attr) {
	if (attr) {
		this.apply(attr); 
	}
};

Studio.CircleClip.prototype = new Studio.Rect();
Studio.CircleClip.prototype.constructor = Studio.CircleClip;

Studio.CircleClip.prototype.draw = function(ctx, ratio) {
	ctx.save();
    ctx.beginPath();
	ctx.arc(this._dx, this._dy ,this._width/2, 0,2*Math.PI)
	// ctx.stroke();
	ctx.clip();
};

Studio.Restore = function(attr) {
};

Studio.Restore.prototype = new Studio.Rect();
Studio.Restore.prototype.constructor = Studio.Restore;

Studio.Restore.prototype.draw = function(ctx, ratio) {
	ctx.restore();
};



/**
 * Image
 */

Studio.Image = function(path) {
	this.image = new Image();
	this.path = path;
	this.ready = false;
	this.height = 1;
	this.width = 1;
	if (path) {
		this.loadImage(path);
	}
};

Studio.Image.prototype.constructor = Studio.Image;

Studio.Image.prototype.loadImage = function(who) {
	if (Studio.assets[who]) {
		console.warn('Already loaded : ', who, Studio.assets[who])
		this.image = Studio.assets[who];
		this.ready = true;
		if (this.onLoadComplete) {
			this.onLoadComplete();
		}
		return this;
	} else {
		//Studio.loaded=Studio.loadOnDemand;
		Studio.assets[who] = new Image();
		Studio.assets.length++;
		var newAsset = this;
		Studio.assets[who].onload = function() { // could have Event passed in
			Studio.queue++;
			Studio.progress = Studio.queue / Studio.assets.length;
			newAsset.ready = true;
			newAsset.height = this.height;
			newAsset.width = this.width;
			
			if (Studio.queue === Studio.assets.length) {
				Studio.loaded = true;
			}
			if (newAsset.onLoadComplete) {
				newAsset.onLoadComplete();
			}
			return newAsset;
		};
		Studio.assets[who].src = who;
		this.image = Studio.assets[who];
	}
};

// Studio.EmbededImage = function(data){
// 	this.image.src = data;
// 	this.ready = true;
// 	this.height = this.image.height;
// 	this.width = this.image.width;
// };

// Studio.EmbededImage.prototype = new Studio.Image();
// Studio.EmbededImage.prototype.constructor = Studio.EmbededImage;


/**
 * Sprite
 */

Studio.Sprite = function(attr) {
	this.image = null;
	this.color = new Studio.Color(1, 1, 1, 1); 
	this.slice = new Studio.Box(0, 0, 1, 1);
	this._boundingBox = new Studio.Box();
	if (attr) {
		this.apply(attr);
	}
};

Studio.Sprite.prototype = new Studio.Rect();
Studio.Sprite.prototype.constructor = Studio.Sprite;

Studio.Sprite.prototype.drawRotated = function(ctx) {
	ctx.save();
	this.prepAngled(ctx);
	ctx.drawImage(this.image.image, 0, 0, this.image.width, this.image.height, -(this.width * this.anchorX), -(this.height * this.anchorY), this.width, this.height);
	ctx.restore();
};

Studio.Sprite.prototype.draw = function(ctx, ratio) {
	if (!this.image) {
		return;
	}
	if (!this.image.ready) {
		return;
	}
	this.setAlpha(ctx);
	if (this.angle) {
		this.drawRotated(ctx);
	}else {
		
		ctx.drawImage(this.image.image, 0, 0, this.image.width, this.image.height, this._dx - (this._width * this.anchorX), this._dy - (this._height * this.anchorY), this._width, this._height);
	}
};

// Studio.DisplayGroup = function(){
// 	this.image ={ready:true};
// 	this.image.image = document.createElement('canvas');
// 	this.imageCTX = this.image.image.getContext('2d');
// };

// Studio.DisplayGroup.prototype = new Studio.Sprite();
// Studio.DisplayGroup.prototype.constructor = Studio.DisplayGroup;

// Studio.DisplayGroup.prototype.update = function(ctx){
	
// }

// Studio.DisplayGroup.prototype.render = function(ctx){

// }
// Studio.DisplayGroup.prototype.draw = function(ctx){
	
// }

Studio.ImageSlice = function(attr) {
	this.image = null;
	this.rect = {x: 0, y: 0, height: 32, width: 32};
	if (attr) {
		this.apply(attr);
	}
}

Studio.ImageSlice.prototype = new Studio.Sprite();
Studio.ImageSlice.prototype.constructor = Studio.ImageSlice;

Studio.ImageSlice.prototype.draw = function(ctx) {
	if (!this.image) {
		return;
	}
	if (!this.image.ready) {
		return;
	}
	this.setAlpha(ctx);
	ctx.drawImage(this.image.image, this.rect.x, this.rect.y, this.rect.width, this.rect.height, this._dx - (this._width * this.anchorX), this._dy - (this._height * this.anchorY), this._width, this._height);
};

// SPRITEANIMATION --- just like a Sprite but uses a SpriteSheet to render, and as such has frames, framerates etc...

Studio.SpriteAnimation = function(attr) {
	this.sheet = new Studio.SpriteSheet();
	this.loop = [[0, 0]];
	this.fps = 12;
	this.frame = 0;
	this.sliceX = 0;
	this.sliceY = 0;
	this.repeat = true;
	this.startTime = 0;
	if (attr) {
		this.apply(attr);
	}
	this.setStartingFrame(this.frame);
};

Studio.SpriteAnimation.prototype = new Studio.Rect();
Studio.SpriteAnimation.prototype.constructor = Studio.SpriteAnimation;

Studio.SpriteAnimation.prototype.setStartingFrame = function(a) {
	this.frame = a;
	this.startTime = Studio.time;
	this.myTime = this.startTime + (a * (1000 / this.fps));
};

Studio.SpriteAnimation.prototype.draw = function(ctx, ratio) {
	if (!this.sheet) {
		return;
	}
	if (!this.sheet.ready) {
		return;
	}
	this.setAlpha(ctx);
	ctx.drawImage(this.sheet.image, this.sheet.rect.width * this.sliceX, this.sheet.rect.height * this.sliceY, this.sheet.rect.width, this.sheet.rect.height, this._dx - (this._width * this.anchorX), this._dy - (this._height * this.anchorX), this._width, this._height);
	if (this.loop.length) {
		this.updateFrame();
	}
};

Studio.SpriteAnimation.prototype.setSlice = function() {
	this.sliceX = this.loop[this.frame][0];
	this.sliceY = this.loop[this.frame][1];
};

Studio.SpriteAnimation.prototype.updateFrame = function() {
	this.myTime += Studio.delta;

	this.frame = (((this.myTime - this.startTime) * this._speed) / (1000 / this.fps)) | 0;

	if (this.frame >= this.loop.length) {
		this.startTime = this.myTime;
		this.frame = 0;
		if (this.onLoopComplete) {
			this.onLoopComplete.call(this);
		}
	}
	this.setSlice();
};

Studio.SpriteSheet = function(path, attr) {
	this.image = new Studio.Image();
	this.rect = {height: 32, width: 32};
	if (path) {
		this.loadImage(path);
	}
	if (attr) {
		this.apply(attr);
	}
};
Studio.SpriteSheet.prototype = new Studio.Image();
Studio.SpriteSheet.prototype.constructor = Studio.SpriteSheet;

Studio.SpriteSheet.prototype.apply = function(obj) {
	var keys = Object.keys(obj);
	var i = keys.length;
	var key;
	while (i) {
		key = keys[i - 1];
		this[key] = obj[key];
		i--;
	}
};



/**
* Camera
* This sets what parts we should see, and how we should see them.
*/

Studio.Camera = function(stage) {
	this.stage 		= {width: stage.width, height: stage.height};
	this.tracking 	= null ;
	this.bound 		= null ;
	this.active		= true ;
	//this.width 	= stage.width;
	//this.height 	= stage.height;
};

Studio.Camera.prototype = new Studio.DisplayObject();
Studio.Camera.prototype.constructor = Studio.Camera;

Studio.Camera.prototype.updateRect = function() {
	this.left	= this.bound._x ;
	this.top	= this.bound._y ;
	this.right	= this.bound._width * this.scaleX - this.stage.width ;
	this.bottom	= this.bound._height * this.scaleY - this.stage.height ; 
};

Studio.Camera.prototype.update = function(stage) {
	if (this.tracking) { // are we following a DisplayObject?
		this.x     = (this.tracking._x * this.scaleX) - this.stage.width / 2 ;
		this.y     = (this.tracking._y * this.scaleY) - this.stage.height / 2 ;
		// this.angle = this.tracking.angle || 0 ;
	}
	if (this.bound) { // are we bound to a DisplayObject? this can be the main stage if you want.
		this.updateRect() ;
		if (this.x < this.left) { // checking the bounds of the X coord.
			this.x = this.left ;
		}else if (this.x > this.right) {
			this.x = this.right ;
		}
		if (this.y < this.top) { // checking the bounds of the Y coord.
			this.y = this.top ;
		}else if (this.y > this.bottom) {
			this.y = this.bottom ;
		}
	} 
};

Studio.Camera.prototype.render = function(stage) {
	if (this.x || this.y || this.scaleX !== 1 || this.scaleY !== 1) {
		stage.ctx.setTransform(stage.resolution * this.scaleX, 0, 0, stage.resolution * this.scaleY, -this.x * stage.resolution, -this.y * stage.resolution);
	}
};

Studio.Camera.prototype.track = function(who) { 
	this.tracking = who;
};

Studio.Camera.prototype.bindTo = function(who) {
	this.bound = who;
};

Studio.Camera.prototype.unBind = function() {
	this.bindTo(null);
};

Studio.Camera.prototype.stopTracking = function() {
	this.track(null);
};


/**
 * Scene
 */

Studio.Scene = function(attr) {
	this.color = null;
	this.active = false;
	this.image = null;
	this.loader = null;
	this.assets = [];
	this.children = [];
	if (attr) {
		this.apply(attr); 
	}
	if (this.build) {
		this.build();
	}
	if (this.init) {
		this.init();
	}
};

Studio.Scene.prototype = new Studio.DisplayObject();
Studio.Scene.prototype.constructor = Studio.Scene;

Studio.Scene.prototype.loadAssets = function() {
	for (var i = 0; i !== arguments.length; i++) {
		this.assets.push(new Studio.Image(arguments[i]));
	}
};

Studio.Scene.prototype.setStyle = function(ctx) {
	if (this.color !== ctx.fillStyle) {
		ctx.fillStyle = this.color.style;
	}
};

Studio.Scene.prototype.draw = function(ctx) {
	this.setAlpha(ctx);
	// return;
	if (this.image) {
		ctx.drawImage(this.image.image, this._x, this._y, this.width, this.height);
		return;
	}
	if (this.color) {
		if (this.color.a === 0) {
			ctx.clearRect(this._x, this._y, this.width, this.height);
			return;
		}
		this.setStyle(ctx);
		ctx.fillRect(this._x, this._y,  this.width, this.height);
		return;
	}
};


/**
 * Stage
 * Where everything plays out.
 */
Studio.Stage = function(domID, attr) {

	// a very basic check for webgl support.
	// this will probably change later.
	this.webgl = false//!!window.WebGLRenderingContext;
	this.fullscreen = false;
	this.color = new Studio.Color(0, 0, 0, 1); // defaults to black

	// Before we do anything we should apply any attached attributes.
	// to disable webgl even if the browser supports it:
	// you would send an object like this { webgl : false }
	// That will force the 2d context.
	if (attr) {
		this.apply(attr);
	}

	this._getCanvasElement(domID);
	this._count = 0;
	this._maxCount = 16050;

	this.dur = 1000 / 60;
	this._d = 0;

	if (attr) {
		this.apply(attr);
	}
	this._sizeCanvas(this.fullscreen);
	this.setPixelRatio(1);
	if (this.webgl) {
		this.engine = Studio.Stage.prototype.WEBGL;
	}
	this.allowPlugins();

	// We need to prepare the canvas element for use.
	// First we need to grab the appropriate context based on the engine type
	this.engine.getContext.call(this);

	// Once the context is obtained we need to fire some actions on it
	// this is mainly for webgl, since it needs shaders and programs created 
	this.engine.init.call(this, this.ctx);

	// One the basic are competed by the init we can apply more changes through
	// a prep call. Again mainly used by webgl to create holders for buffers and such.
	this.engine.prep.call(this, this.ctx);

	this.render = this.engine.render;
	// This is a universal init. These are items that need to be attached to the stage
	// regardless of engine type. These include items like buttons, cameras, scenes etc...
	this._init();
	console.log('%cStudio3 v' + Studio.version + '%c' + this.engine.type, Studio.infoStyle, Studio.engineStyle);
	this.verts = 0;
	return this;
};

Studio.Stage.prototype = new Studio.Scene();
Studio.Stage.prototype.constructor = Studio.Stage;

Studio.Stage.prototype._getCanvasElement = function(domElementID) {

	if (!domElementID) { 
		// If an ID is not passed to us.
		// We will find the first Canvas element and use that.
		var temp = document.body.getElementsByTagName('canvas');
		if (!temp[0]) {
			// If we can't find a Canvas element on the page, we create one.
			this.canvas = document.createElement('canvas');
			document.body.appendChild(this.canvas);
		}else {
			// Otherwise we use the first one we see.
			this.canvas = temp[0];
		}
	}else {
		// this is the expected behavior, please provide an ID
		// it gives you control of what happens.
		this.canvas = document.getElementById(domElementID);
	}
}


Studio.Stage.prototype.setColor = function(r, g, b, a) {
	this.color.set(r, g, b, a);
	if (this.ctx.clearColor) {
		this.ctx.clearColor(this.color.r, this.color.g, this.color.b, this.color.a);
	}
}

Studio.Stage.prototype._init = function(a) {
	this.ready = false;
	this.autoPause = false;
	this._watching = false;
	this.children = [];
	this.buttons = [];
	this.activeScene = null;
	this.previousScene = null;
	this.camera = new Studio.Camera(this);
	this.tweens = Object.create(null);
	this.tween_length = 0;
	this.nextID = 0;
	this.anchorX = 0 ;
	this.anchorY = 0 ;
	this.active = true;
	this._pause_buttons = false;

	// Studio.stages.push(this);
	Studio.stage = this;
	return this;
}

Studio.Stage.prototype.allowPlugins = function(a) {
	this.plugins = Object.create(null);
	this.plugins.input = [];
	this.plugins.effect = [];
	this._effects = 0;
}

Studio.Stage.prototype._sizeCanvas = function(fullscreen) {
	console.log(fullscreen)
	this.height = this.canvas.height;
	this.width = this.canvas.width;
	this.canvas.style.height = this.height + 'px';
	this.canvas.style.width = this.width + 'px';
	this._scaleRatio = 1;
	if(fullscreen){
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		this.canvas.style.height= '100%';
		this.canvas.style.width= '100%';
	}
}

Studio.Stage.prototype.pauseButtons = function(a) {
	this._pause_buttons = a;
}

Studio.Stage.prototype.setPixelRatio = function(pixelRatio) {
	this.resolution = pixelRatio || window.devicePixelRatio;
	this.canvas.width = this.width * this.resolution;
	this.canvas.height = this.height * this.resolution;
};
Studio.Stage.prototype.fillScreen = function(type) {
	// this._scaleRatio = window.innerHeight/this.height;
	// this.canvas.style.height = (this.height*this._scaleRatio) +'px';
	// this.canvas.style.width = (this.width*this._scaleRatio) +'px';

};
Studio.Stage.prototype.addInput = function(fn) {
	this.plugins.input.push(fn);
};

Studio.Stage.prototype.addEffect = function(fn, options) {
	if (options) {
		fn._options(options);
	}
	fn.init(this);
	this.plugins.effect.push(fn);
	this._effects++;
};

Studio.Stage.prototype.checkDataAttributes = function() {
	// if(this.canvas.getAttribute('data-auto-pause')){
	// 	this.autoPause=(this.canvas.getAttribute('data-auto-pause')).toLowerCase()==='true';
	// }

	// if(this.canvas.getAttribute('data-watch')){
	// 	this.watch=(this.canvas.getAttribute('data-watch')).toLowerCase()==='true';
	// }
};

Studio.Stage.prototype.setScene = function(who) {
	who.parent = this;
	if (this.activeScene && Studio.progress === 2) {
		if (this.activeScene.onDeactivate) {
			this.activeScene.onDeactivate();
		}
	}
	this.previousScene = this.activeScene;
	this.activeScene = who;
	this.activeScene.active = true;
	if (who.onActivate) {
		who.onActivate();
	}
};

Studio.Stage.prototype.watch = function(who) {
	this._watching = who;
	this.children = who.children;
	this.hasChildren = who.hasChildren;
};

Studio.Stage.prototype.addButton = function(who) {
	this.buttons.unshift(who);
};

Studio.Stage.prototype.update_children = function(ratio, delta) {
	for (this.i = 0; this.i !== this.hasChildren; this.i++) {
		if (this.children[this.i].active) {
			this.children[this.i].update(ratio, delta);
		}
	}
};
Studio.Stage.prototype.render_children = function(lag) {
	for (this.i = 0; this.i !== this.hasChildren; this.i++) {
		if (this.children[this.i].active) {
			this.children[this.i].render(this, lag);
		}
	}
};
Studio.Stage.prototype.update_visibility = function() {
	this._alpha = this.alpha;
}
/**
 * stage.update
 * This is different from the displayObject.update() because a stage will never have a parent.
 * Yet it should still update its private variables.
 */

Studio.Stage.prototype.update = function(ratio, delta) {
	this.update_tweens();
	if (this.onEnterFrame) {
		this.onEnterFrame();
	}
	this._width = this.width;
	this._height = this.height;
	this._scaleX  = this.scaleX;
	this._scaleY  = this.scaleY;
	this._speed = this.camera.speed;
	this.update_visibility();
	if (Studio.progress === 2) {
		// if(this.camera.active){
		// 	this.camera.update(this);
		// }
		if (this.activeScene) {
			this.activeScene.update(ratio, delta);
		}
		if (this.previousScene) {
			if (this.previousScene.active) {
				this.previousScene.update(ratio, delta);
			}
		}
		if (this.hasChildren || this._watching) {
			// if(!this._watching){
			this.update_children();
			// }else{
			// 	this.hasChildren=this._watching.hasChildren;
			// }
		}
		if (this.beforeDraw) {
			this.beforeDraw();
		}
	}
	// this.camera.update(this);
};

Studio.Stage.prototype.runEffects = function(delta) {
	// this.setAlpha(this.ctx);
	// this.ctx.setTransform(this.resolution, 0, 0,this.resolution,0,0);
	for (this.i = 0; this.i !== this._effects; this.i++) {
		this.plugins.effect[this.i].action(this);
	}
}

Studio.Stage.prototype.loading = function(delta) {
	if (Studio.loaded == true) { // BAD DESIGN! This should be based on each stage. 
		// as it stands loading an image for one canvas will cause all to pause. oops.
		if (this.onReady) {
			this.onReady(delta);
		}
		this.loop = this.activeloop;
	}
}

Studio.Stage.prototype.activeloop = function(delta) {
	if (Studio.progress === 2) {
		if(!this.webgl) this.ctx.setTransform(this.resolution, 0, 0, this.resolution, 0, 0);
		this.draw(this.ctx);
		this.timeStep(delta);
		if (this._effects) {
			this.runEffects(delta);
		}
		return;
	}else {
		if(this.overlay_progress){
			this.update_children();
			this.draw(this.ctx);
			this.timeStep(delta);
		}
		this.drawProgress(this.ctx,delta);

		if (Studio.progress === 1) {
			if (this.onReady) {
				this.onReady(delta);
			}
			Studio.progress = 2; // we set this to 2 so we can fire this event once.
			if (!this.activeScene) {
				return; // lets check to see if we have a scene to draw. otherwise lets just draw the stage.
			}
			if (this.activeScene.onActivate) {
				this.activeScene.onActivate();
			}
		}
	}
}

Studio.Stage.prototype.loop = Studio.Stage.prototype.loading;

Studio.Stage.prototype.drawProgress = function(ctx) {
	ctx.setTransform(this.resolution, 0, 0, this.resolution, 0, 0);
	this.progressBar(ctx, Studio.progress);
	ctx.restore();
};

// default progress bar. overwire this to create your own.
Studio.Stage.prototype.progressBar = function(ctx, progress) {
	ctx.fillStyle = 'rgba(255,255,255,.8)';
	ctx.fillRect((this.width - 202) / 2, (this.height - 22) / 2, 202, 22);
	ctx.fillStyle = 'rgba(0,0,0,1)';
	ctx.fillRect(2 + (this.width - 202) / 2, 2 + (this.height - 22) / 2, progress * 198, 18);
};



var FRAGMENTSHADER = [  'precision lowp float;',
						'uniform sampler2D u_image;',
						'varying vec4 v_color;',
						'varying vec2 v_texture;',
						'void main(void) {',
						'   if(v_texture.x==10.0){',
						'		gl_FragColor = v_color;',
						'	}else{',
						'		gl_FragColor = texture2D(u_image, v_texture) * v_color;',
						'	}',
						'}'].join('\n');

var VERTEXSHADER = [  	'attribute vec3 a_position;',
						'attribute vec4 a_color;',
						'attribute vec2 a_texture;',
						'uniform vec2 u_resolution;',
						'varying vec4 v_color;',
						'varying vec2 v_texture;',
						'void main(void) {',
						'	vec2 canvas_coords = ((vec2(a_position.x,a_position.y)/ u_resolution)*2.0) - 1.0;',
						'	gl_Position = vec4(canvas_coords * vec2(1.0,-1.0), a_position.z, 1.0);',
						'	v_color = a_color;',
						'	v_texture = a_texture;',
						'}'].join('\n');
						

Studio.Stage.prototype.loadShader = function(who, shader) {
	//var shaderScript = document.getElementById(shader);
	//var str = '';
	// var k = shaderScript.firstChild ;
	// while (k) {
	// 	if (k.nodeType == 3) {
	// 		str += k.textContent;
	// 	}
	// 	k = k.nextSibling;
	// }
	this.ctx.shaderSource(who, shader);
}


Studio.Stage.prototype.WEBGL = {

	type: 'webgl',

	antialias: false,
	premultipliedAlpha: false,
	stencil: true,

	getContext: function() {
		this.ctx = this.canvas.getContext('webgl', {
			antialias: this.WEBGL.antialias ,
			premultipliedAlpha: this.WEBGL.premultipliedAlpha ,
			stencil: this.WEBGL.stencil 
		});
	},

	init: function(gl) {
		gl._count = 0;
		gl._batch = new Float32Array(16355 * 32);
		// gl._batch = new Float32Array(62000*32);
		gl.clearColor(this.color.r, this.color.g, this.color.b, this.color.a);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		this.vertexShader = gl.createShader(gl.VERTEX_SHADER);
		this.loadShader(this.vertexShader , VERTEXSHADER);
		// gl.shaderSource(this.vertexShader,Studio.STANDARD_VERT_SHADER)
		gl.compileShader(this.vertexShader);

		this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
		this.loadShader(this.fragmentShader , FRAGMENTSHADER);
		// gl.shaderSource(this.fragmentShader,Studio.STANDARD_FRAG_SHADER)
		gl.compileShader(this.fragmentShader);

		// gl.enable(gl.DEPTH_TEST);
		//    gl.depthFunc(gl.LESS);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.enable(gl.BLEND);
		// gl.disable(gl.DEPTH_TEST);

		this.program = gl.createProgram();
		gl.attachShader(this.program, this.vertexShader);
		gl.attachShader(this.program, this.fragmentShader);

		gl.linkProgram(this.program);

		gl.useProgram(this.program);

		this.buffer = gl.createBuffer();
	},

	prep: function(gl) {
		gl.resolutionLocation = gl.getUniformLocation(this.program, "u_resolution");

		gl.enableVertexAttribArray(0);

		gl.positionLocation = gl.getAttribLocation(this.program, "a_position");
		gl.bindAttribLocation(this.program, 0, 'a_position');

		gl.colorLocation = gl.getAttribLocation(this.program, "a_color");
		// gl.bindAttribLocation(this.program, 2, 'a_color');

		gl.textureLocation = gl.getAttribLocation(this.program, "a_texture");
		// gl.bindAttribLocation(this.program, 6, 'a_texture');

		gl.uniform2f(gl.resolutionLocation, this.width, this.height);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

		gl.enableVertexAttribArray(gl.positionLocation);
		gl.enableVertexAttribArray(gl.colorLocation);
		gl.enableVertexAttribArray(gl.textureLocation);

		gl.vertexAttribPointer(gl.positionLocation, 2, gl.FLOAT, false, 32, 0);
		gl.vertexAttribPointer(gl.colorLocation, 4, gl.FLOAT, false, 32, 8);
		gl.vertexAttribPointer(gl.textureLocation, 2, gl.FLOAT, false, 32, 24);

		this._rect_index_buffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._rect_index_buffer);
		this._rect_index = new Uint16Array(this._maxCount * 6);

		for (var i = 0, j = 0; i < this._maxCount * 6; i += 6, j += 4) {
			this._rect_index[i + 0] = j + 0;
			this._rect_index[i + 1] = j + 1;
			this._rect_index[i + 2] = j + 2;
			this._rect_index[i + 3] = j + 1;
			this._rect_index[i + 4] = j + 2;
			this._rect_index[i + 5] = j + 3;
		}
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._rect_index_buffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._rect_index, gl.STATIC_DRAW);
		this._r_count = 0;
	},
	render:  function(lag) {
		this.ctx._count = 0;
		this.vertex_children(this.ctx, lag);
		this.ctx.bufferData(this.ctx.ARRAY_BUFFER, this.ctx._batch, this.ctx.DYNAMIC_DRAW);
		this.ctx.clear(this.ctx.COLOR_BUFFER_BIT | this.ctx.DEPTH_BUFFER_BIT);
		// gl.drawArrays(gl.TRIANGLES, 0, this.children.length*6);
		this.ctx.drawElements(this.ctx.TRIANGLES, this.hasChildren * 6, this.ctx.UNSIGNED_SHORT, 0);  

	}
}


Studio.Stage.prototype.CANVAS = {

	type: '2dContext',

	getContext: function(a) {
		this.ctx = this.canvas.getContext('2d');
	},
	init: function(ctx) {
	},
	prep: function(ctx) {
	},
	// our render function draws everything to the screen then updates them
	// we want to draw everything to the screen as fast as possible. Then we
	// can worry about user input and tweens. This should help prevent certain
	// situation that could cause the frames to drop.
	render: function(lag) {
		this.camera.render(this);
		if (this.hasChildren) {
			this.render_children(lag);
		}
		if (this.activeScene) {
			if (this.activeScene.beforeDraw) {
				this.activeScene.beforeDraw();
			}
			this.activeScene.render(this , lag);
		}
		if (this.previousScene) {
			if (this.previousScene.active) {
				this.previousScene.render(this , lag);
			}
		}
	},

}

Studio.fixedTimeStep = function(delta) {
	this.step(delta);
	this.render(this._lag);
	this.fixedStep();
	this.camera.update(this);

}

Studio.simple = function(delta) {
	this.render(1);
	this.update();
	this.camera.update(this);
}

Studio.Stage.prototype.timeStep = Studio.fixedTimeStep;

Studio.Stage.prototype.fixedStep = function() {
	while (this._d >= this.dur) {
		this._d -= this.dur;
		this.update(); // update by a fixed amount.
	}
}

Studio.Stage.prototype.step = function(delta) {
	this._d += delta;
	this._lag = this._d / this.dur;
}

Studio.Stage.prototype.engine = Studio.Stage.prototype.CANVAS;


Studio.Stage.prototype.update_tweens = function() {
	var i, j = 0;
	var tween, key, delta;
	for (i in this.tweens) {
		tween = this.tweens[i];
		tween.cur += (Studio.delta) * (tween.actor._speed);
		if (!tween.dir) {
			delta = tween.cur / tween.duration;
		}else {
			delta = 1 - tween.cur / tween.duration;
		}
		if (delta < 1 && delta > 0) {
			for (j = 0; j !== tween.keys.length; j++) {
				key = tween.keys[j];
				this.update_property(tween, key, delta);
			}
		}else {
			if (tween.loop) {
				tween.cur = 0;
				if (tween.reflect) {
					if (!tween.dir) {
						tween.dir = 1;
					}else {
						tween.dir = 0;
					}
				}
				return;
			}else {
				if (tween.reset) {
					tween.actor.apply(tween.original);
				}else {
					tween.actor.apply(tween.to);
					// for(j=0;j!==tween.keys.length;j++){
					// 	key = tween.keys[j];
					// 	tween.actor[key] = tween.to[key];
					// }
				}
				if (tween.callback) {
					tween.callback.call(tween.actor);
				}
				tween = null;
				this.tweens[i] = null;
				delete this.tweens[i];
			}
		}
	}
};

Studio.Stage.prototype.update_property = function(tween, key, delta) {
	tween.actor[key] = tween.original[key] + (Studio.Ease[tween.ease](delta) * (tween.to[key] - tween.original[key]));
}

Studio.Stage.prototype.createTween = function(who, ease, to, duration, callback) {
	var temp = {
		actor: who,
		ease: ease,
		original: {},
		to: to,
		cur: 0,
		duration: duration,
		callback: callback,
		loop: false,
		reflect: true,
		reset: false,
		dir: 0,
		id: this.nextID,
		keys: Object.keys(to)
	};

	temp.apply = function(a) {
		for (var key in a) {
			this[key] = a[key];
		}
		return this;
	}

	for (var key in to) {
		temp.original[key] = who[key];
	}

	this.nextID++;
	return temp;
};

Studio.Stage.prototype.createLoop = function(who, ease, to, duration, callback) {
	this.tweens[this.nextID] = this.createTween(who, ease, to, duration, callback);
	this.tweens[this.nextID - 1].loop = true;
	return this.tweens[this.nextID - 1];
}
Studio.Stage.prototype.addTween = function(who, ease, to, duration, callback) {
	this.tweens[this.nextID] = this.createTween(who, ease, to, duration, callback);
	return this.tweens[this.nextID - 1];
};

Studio.Stage.prototype.playTween = function(who) {
	who.cur = 0;
	for (var j = 0; j !== who.keys.length; j++) {
		who.original[who.keys[j]] = who.actor[who.keys[j]];
	}
	this.tweens[who.id] = who;
};

Studio.Stage.prototype.stopTween = function(who) {
	if (this.tweens[who.id]) { // lets make sure the tween is active first
		who.cur = 0;
		for (var j = 0; j !== who.keys.length; j++) {
			who.actor[who.keys[j]] = who.original[who.keys[j]];
		}
		this.tweens[who.id] = null;
		delete this.tweens[who.id];
	}
};

Studio.Ease = {};

Studio.Ease.linear = function(t) {
	return t;
};

Studio.Ease.snap = function(t) {
	return Math.round(t);
};

Studio.Ease.backOut = function(t) {
	var s = 1.70158;
	return --t * t * ((s + 1) * t + s) + 1;
};

Studio.Ease.bounceOut = function(t) {
	if (t < (0.363636)) {
		return 7.5625 * t * t;
	} else if (t < 0.727272) {
		return 7.5625 * (t -= (0.545454)) * t + 0.75;
	} else if (t < 0.909090) {
		return 7.5625 * (t -= (0.818181)) * t + 0.9375;
	} else {
		return 7.5625 * (t -= (0.959595)) * t + 0.984375;
	}
};

Studio.Ease.elasticOut = function(t) {
	var s, a = 0.1, p = 0.4;
	if (t === 0) {
		return 0;
	}
	if (t === 1) {
		return 1;
	}
	if (!a || a < 1) { 
		a = 1; s = p / 4; 
	}else {
		s = p * Math.asin(1 / a) / (6.283);
	}
	return (a * Math.pow(2, -10 * t) * Math.sin((t - s) * (6.283) / p) + 1);
};

Studio.Ease.linearRandom = function(t) {
	return Math.random() * t;
};

Studio.Ease.random = function() {
	return Math.random();
};

Studio.Ease.quadIn = function(t) {
	return t * t;
};

Studio.Ease.quadOut = function(t) {
	return t * (2 - t);
};

Studio.Ease.quadInOut = function(t) {
	if ((t *= 2) < 1) {
		return 0.5 * t * t;
	}
	return -0.5 * (--t * (t - 2) - 1);
};



Studio.Font = function(path, height, width, resolution, sheetWidth, characterSet) {
	this.clipHeight = height * resolution || 1;
	this.clipWidth = width * resolution || 1;
	this.resolution = resolution || 1;
	this.charSet = {};
	this.sheetWidth = sheetWidth || 26;
	this.loadImage(path);
	this._c = characterSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.:;, ';
	this.createSet(this._c);
};

Studio.Font.prototype = new Studio.Image();
Studio.Font.prototype.constructor = Studio.Font;

Studio.Font.prototype.createSet = function(chars) {
	Studio._font_chars_length = chars.length;
	for (var i = 0; i !== Studio._font_chars_length; i++) {
		this.charSet[chars[i]] = i / this.sheetWidth;
	}
};



Studio.TextBox=function(width,height,ctx){
	this.font = null;
	this.lineHeight = 10;
	this.image = document.createElement('canvas');
	this.height= 300;
	this.width= width
	this.shadow = true;
	this.image.height = height * ctx.resolution || 256;
	this.image.width =  width * ctx.resolution || 256;
	this._buffer = this.image.getContext('2d');
    this._buffer.imageSmoothingEnabled = false;
	this._buffer.scale(ctx.resolution,ctx.resolution);
	this._buffer.textBaseline = 'top';
	this._buffer.font=this.font;
	this.text = "";
	this.maxWidth = 300;
	this.color='#fff'
	this._wrap_height = this.lineHeight;
	this.centered = false;
};

Studio.TextBox.prototype = new Studio.Rect();
Studio.TextBox.prototype.constructor = Studio.TextBox;

Studio.TextBox.prototype.setFont= function(font){
	this.font=font;
	return this;
};

Studio.TextBox.prototype.setText= function(text){
	this.text=text;
	this.reset();
	this.wrapText()
	return this;
};

Studio.TextBox.prototype.reset = function(){
	this._buffer.clearRect(0,0,this.image.width,this.image.height);
	this._buffer.font=this.font;
}

Studio.TextBox.prototype.writeLine=function(text,x,y){
	this._buffer.fillStyle='rgba(0,0,0,.5)';
	this._buffer.fillText( text, x+1, y+(this.lineHeight/2)+2);
    this._buffer.fillStyle = this.color;
    this._buffer.fillText( text, x+1, y+this.lineHeight/2);
};

Studio.TextBox.prototype.wrapText = function() {
	var words = this.text.split(' ');
	var line = '';
	var x = 1;
	var y = 0;
	for(var n = 0; n < words.length; n++) {
		var testLine = line + words[n] + ' ';
		var metrics = this._buffer.measureText(testLine);
		var testWidth = metrics.width;
		if (testWidth > this.maxWidth && n > 0) {
			if(this.centered){
				this.writeLine(line, (this.maxWidth-testWidth)/2, y);
			}else{
				this.writeLine(line, x, y);
			}
			line = words[n] + ' ';
			y += this.lineHeight;
		}else {
			line = testLine;
		}
	}
	if(this.centered){
		this.writeLine(line, (this.maxWidth-testWidth)/2, y);
	}else{
		this.writeLine(line, x, y);
	}
	this._wrap_height = y + this.lineHeight;
}



Studio.TextBox.prototype.draw = function(ctx) {
	this.setAlpha(ctx);
	ctx.drawImage(this.image,0,0,this.image.width,this.image.height,this._x,this._y,this._width,this._height);
};




Studio.Stage.prototype.enableKeyboardInput = function() {
	var me = this;
	
	this.keys = {};
	
	this.canvas.onkeydown = function(e) {
		e.preventDefault();
		me.keys[e.keyCode] = 1;
	}
	
	this.canvas.onkeyup = function(e)  {
		e.preventDefault();
		me.keys[e.keyCode] = 0;
	}
};


Studio.Stage.prototype.enableTouchEvents = function() {
	var me = this;

	// TYPES of EVENTS
	// finger also == mouse cursor
	// onTap : finger touch inside button
	// onTapOutside : finger touch anywhere besides button.
	// onDragStart : finger starts dragging a draggable button
	// onDragEnd : finger stops dragging a draggable button
	// // dragable is a state of a button... does not fire event while dragging.
	// onRelease : finger is released inside button
	// onReleaseOutside : finger in relased outside button
	// onHover : when over a button but not pressed. *mouse only?

	var mouse = { 
					x: 0, 
					y: 0, 
					dx: 0, 
					dy: 0, 
					id: 0
				}

	/* MOUSE EVENTS*/

	this.mouse_onDown = function(touch) {
		if (this.buttons && !this._pause_buttons) {
			for (var i = 0; i != this.buttons.length; i++) {
				if (this.buttons[i]._touchID) {
					
					// already tapped by someone so lets leave it alone
				}else {
					if (this.buttons[i].hitTestPoint(touch.x, touch.y)) {
						this.buttons[i]._touchID = touch.id;
						if (this.buttons[i].onTap) this.buttons[i].onTap(touch); // cool we just clicked the button
						if (this.buttons[i].preventBubble) return;
					}else {
						if (this.buttons[i].onTapOutside) this.buttons[i].onTapOutside(touch);
					}
				}
			}
		}
	}

	this.mouse_onMove = function(touch) {
		if (this.buttons && !this._pause_buttons) {
			for (var i = 0; i != this.buttons.length; i++) {
				if (this.buttons[i].hitTestPoint(touch.x, touch.y)) {
					if (this.buttons[i].draggable && touch.id) {
						if ((this.buttons[i]._touchID == touch.id)) {
							if (!this.buttons[i]._activeDrag) {
								if (this.buttons[i].onDragStart) this.buttons[i].onDragStart(touch); // we check to see if a drag has ever occured
								this.buttons[i]._activeDrag = true;
							}else {
								if (this.buttons[i].onDrag) {
									this.buttons[i].onDrag(touch);
								}
							}
						}
					}
					if (this.buttons[i].onHoverStart && !this.buttons[i].hovering) {
						this.buttons[i].onHoverStart(touch);
					}else if (this.buttons[i].onHover) {
						this.buttons[i].onHover(touch);
					}
					this.buttons[i].hovering = true;
				}else {
					if (this.buttons[i].hovering) {
						this.buttons[i].hovering = false;
						if (this.buttons[i].onHoverEnd) {
							this.buttons[i].onHoverEnd();
						}
					}
				}
				if ((this.buttons[i].draggable && this.buttons[i]._activeDrag) && (this.buttons[i]._touchID == touch.id)) {
					this.relativeX = touch.dx;
					this.relativeY = touch.dy;
					if (this.buttons[i].angle  && (this.buttons[i].orbits || this.buttons[i].inheritRotation)) {
						this.relativeX = (touch.dx * Math.cos(-this.buttons[i].angle)) - (touch.dy * Math.sin(-this.buttons[i].angle));
						this.relativeY = (touch.dx * Math.sin(-this.buttons[i].angle)) + (touch.dy * Math.cos(-this.buttons[i].angle));
						touch.dx = this.relativeX;
						touch.dy = this.relativeY;
					}
					if (this.buttons[i].onDrag) this.buttons[i].onDrag(touch);
				}
				if (this.buttons[i].onTouchMove) this.buttons[i].onTouchMove(touch);
			}
		}
	}

	this.mouse_onUp = function(touch) {
		if (this.buttons) {
			for (var i = 0; i != this.buttons.length; i++) {
				if (this.buttons[i]._touchID == touch.id) {
					
					if (this.buttons[i]._activeDrag) {
						if (this.buttons[i].onDragEnd) this.buttons[i].onDragEnd(touch); // we can end the drag if its active.
					}
					if (this.buttons[i].hitTestPoint(touch.x, touch.y)) {
						if (this.buttons[i].onRelease) this.buttons[i].onRelease(touch); // cool we just let go of the button
						
					}else {
						if (this.buttons[i].onReleaseOutside) this.buttons[i].onReleaseOutside(touch);
					}
					this.buttons[i]._activeDrag = false;
					this.buttons[i]._touchID = 0;
				}
			}
		}
	}
	var scaledMouse = {clientX: 0, clientY: 0}

	var ratioEvent = function(event) {
		scaledMouse.clientX = (event.clientX - me.canvas.offsetLeft) / me._scaleRatio;
		scaledMouse.clientY = (event.clientY - me.canvas.offsetTop) / me._scaleRatio;
		// return me.scaledMouse;
	}

	var mouse_down = function(event) {
		ratioEvent(event);
		mouse.id = 1;
		mouse.x = scaledMouse.clientX + me.camera.x;
		mouse.y = scaledMouse.clientY + me.camera.y;
		mouse.dx = mouse.dy = 0;
		me.mouse_onDown(mouse);
	}
	var mouse_move = function(event) {
		ratioEvent(event);
		mouse.dx = mouse.x - (scaledMouse.clientX + me.camera.x);
		mouse.dy = mouse.y - (scaledMouse.clientY + me.camera.y);
		mouse.x = scaledMouse.clientX + me.camera.x;
		mouse.y = scaledMouse.clientY + me.camera.y;
		me.mouse_onMove(mouse);
	}
	var mouse_release = function(event) {
		me.mouse_onUp(mouse);
		mouse.id = 0;
	}
	if (this._mouseWindow) {
		document.addEventListener("mousedown", mouse_down, false);
		document.addEventListener("mousemove", mouse_move, false);
		document.addEventListener("mouseup", mouse_release, false);
		document.addEventListener("mouseout", mouse_release, false);
	}else {
		this.canvas.addEventListener("mousedown", mouse_down, false);
		this.canvas.addEventListener("mousemove", mouse_move, false);
		this.canvas.addEventListener("mouseup", mouse_release, false);
		this.canvas.addEventListener("mouseout", mouse_release, false);
	}

	/* touch events
*/
	
	var touches = {}
	var touchID = 0;
	var events = [];
	var Event = {};
	var length = 0;

	var finger_press = function(event) {
	event.preventDefault();
	length =  event.targetTouches.length
	for (var i = 0; i != length; i++) {
		touchID = event.targetTouches[i].identifier;
		ratioEvent(event.targetTouches[i]);
		touches[touchID] = {};
		touches[touchID].id = touchID; // so we can allow multiple drags at once, without requiring a hit (for fast drags that cause the user to outrun the button)
		//touches[touchID].x = Event.clientX  + me.camera.x;
		//touches[touchID].y = Event.clientY  + me.camera.y;
		touches[touchID].x = scaledMouse.clientX + me.camera.x;
		touches[touchID].y = scaledMouse.clientY + me.camera.y;
		touches[touchID].dx = 0;
		touches[touchID].dy = 0;
		me.mouse_onDown(touches[touchID]);
	}
}
	var finger_move = function(event) {
	event.preventDefault();
	length =  event.targetTouches.length
	for (var i = 0; i != length; i++) {
		touchID = event.targetTouches[i].identifier;
		ratioEvent(event.targetTouches[i]);
		touches[touchID].dx = touches[touchID].x - scaledMouse.clientX;
		touches[touchID].dy = touches[touchID].y - scaledMouse.clientY;
		//touches[touchID].x = Event.clientX + me.camera.x;
		//touches[touchID].y = Event.clientY + me.camera.y;
		touches[touchID].x = scaledMouse.clientX + me.camera.x;
		touches[touchID].y = scaledMouse.clientY + me.camera.y;
		me.mouse_onMove(touches[touchID]);
	}
}
	var finger_release = function(event) {
	event.preventDefault();
	length =  event.changedTouches.length
	for (var i = 0; i != length; i++) {
		touchID = event.changedTouches[i].identifier;
		me.mouse_onUp(touches[touchID]);
		delete touches[touchID];
	}

}

	if (!window.ejecta) {
		this.canvas.addEventListener("touchstart", finger_press, false);
		this.canvas.addEventListener("touchmove", finger_move, false);
		this.canvas.addEventListener("touchend", finger_release, false);
		this.canvas.addEventListener("touchcancel", finger_release, false);
		this.canvas.setAttribute('tabindex', '0');
		this.canvas.focus();
	}else {
		document.addEventListener("touchstart", finger_press, false);
		document.addEventListener("touchmove", finger_move, false);
		document.addEventListener("touchend", finger_release, false);
		document.addEventListener("touchcancel", finger_release, false);
	}
}



