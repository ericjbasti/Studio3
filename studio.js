
// @codekit-prepend "Studio/Requirements.js"

// @codekit-append "Studio/Components/Box.js"
// @codekit-append "Studio/Components/Color.js"
// @codekit-append "Studio/Components/DisplayProperty.js"

// @codekit-append "Studio/Components/LinkedList.js"
// @codekit-append "Studio/Components/Plugin.js"
// @codekit-append "Studio/Components/Image.js"
// @codekit-append "Studio/Components/Cache.js"
// @codekit-append "Studio/Components/Ease.js"

// @codekit-append "Studio/DisplayObjects/DisplayObject.js"

// @codekit-append "Studio/DisplayObjects/DisplayList.js"
// @codekit-append "Studio/DisplayObjects/Rect.js"
// @codekit-append "Studio/DisplayObjects/Clip.js"
// @codekit-append "Studio/DisplayObjects/CircleClip.js"
// @codekit-append "Studio/DisplayObjects/Restore.js"
// @codekit-append "Studio/DisplayObjects/Circle.js"
// @codekit-append "Studio/DisplayObjects/Sprite.js"
// @codekit-append "Studio/DisplayObjects/Camera.js"
// @codekit-append "Studio/DisplayObjects/Scene.js"
// @codekit-append "Studio/DisplayObjects/Stage.js"
// @codekit-append "Studio/DisplayObjects/TextBox.js"
// @codekit-append "Studio/DisplayObjects/Tween.js"

// @codekit-append "Studio/Effects/Standards.js"

// @codekit-append "Studio/engines/WebGL.js"
// @codekit-append "Studio/engines/Canvas.js"

// @codekit-append "Studio/Input/Keyboard.js"
// @codekit-append "Studio/Input/Touch.js"



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
	} else {
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
} else {
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
		cap: 1000/20, // don't let the true frame rate go below 20fps, prevent huge frame skips
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
	Studio.RAF;
}

Studio.updateProgress = function() {
	this.progress = this.queue / this.assets.length;
};

Studio.addAsset = function(path, Who) {
	if (!this.assets[path]) {
		this.assets.length += 1;
		this.assets[path] = new Who();
		this.updateProgress();
		return true;
	} else {
		console.warn('Already loaded : ', path, Studio.assets[Who]);
		return false;
	}
};

Studio.start = function(time_stamp) {
	// Studio.stage=Studio.stages[0];
	if (Studio.queue === Studio.assets.length) {
		Studio.progress = 1;
	}
	if (time_stamp) {
		Studio.now = time_stamp;
		Studio.time = time_stamp;
		Studio.RAF = requestAnimationFrame(Studio.loop);

	} else {
		Studio.RAF = requestAnimationFrame(Studio.start);
	}
};

Studio.loop = function(time_stamp) {
	Studio.RAF = requestAnimationFrame(Studio.loop);

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

Studio.handleVisibilityChange = function() {
	if (document.hidden) {
		console.log('%cStudio Paused (visibilitychange)', Studio.statStyle);
		cancelAnimationFrame(Studio.RAF);
	} else {
		console.log('%cStudio Play (visibilitychange)', Studio.statStyle);
		Studio.RAF = requestAnimationFrame(Studio.start);
	}
};

document.addEventListener('visibilitychange', Studio.handleVisibilityChange, false);

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
};

// addTo()

Studio.addTo = function(a, b) {
	for (var attr in b) {
		if (b.hasOwnProperty(attr) && !a.hasOwnProperty(attr)) {
			a[attr] = b[attr];
		}
	}
};

// Studio.extend(a,b)
// A : the New Class
// B : Class to inherit attributes from.

Studio.extend = function(A, B) {
	A.prototype = new B();
	A.prototype.constructor = A;
};

Studio.Messanger = function() {
	this.listeners = [];
	this.status = 0;
};

Studio.Messanger.prototype.addListener = function(callback) {
	this.listeners.push(callback);
	// reply back with current status when adding new listener.
	callback(this.status);
};

Studio.Messanger.prototype.setStatus = function(message) {
	this.status = message;
	// now lets tell everyone that listens.
	for (var i = 0; i < this.listeners.length; i++) {
		this.listeners[i](this.status);
	}
};

Studio.TOP = Studio.LEFT = 0;
Studio.MIDDLE = Studio.CENTER = 0.5;
Studio.BOTTOM = Studio.RIGHT = 1;

Studio.infoStyle = 'background-color: #3af; padding: 2px 4px; color: #fff';
Studio.errorStyle = 'background-color: #c01; padding: 2px 4px;';
Studio.warningStyle = 'background-color: #fd2; padding: 2px 4px;';
Studio.statStyle = 'background-color: #eee; padding: 2px 4px; color: #555; font-size: 10px';
Studio.engineStyle = 'background-color: #eee; color: #3af; padding: 1px 4px; border: 1px solid #3af';

