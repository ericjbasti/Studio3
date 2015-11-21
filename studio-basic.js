// @codekit-prepend "requirements.js"
// @codekit-append "display/_box.js"
// @codekit-append "display/_color.js"
// @codekit-append "display/displayObject.js"
// @codekit-append "display/rect.js"
// @codekit-append "display/image.js"
// @codekit-append "display/sprite.js"
// @codekit-append "display/camera.js"
// @codekit-append "display/scene.js"
// @codekit-append "display/stage.js"
// @codekit-append "engines/canvas.js"
// @codekit-append "display/tween.js"

'use strict';

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
	// Studio.stage=Studio.stages[0];
	if(Studio.queue==Studio.assets.length){
		Studio.progress = 1;
	}
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


// Studio.extends(a,b)
// a : New Class
// b : Class to inherit attributes from.

Studio.extends = function(a,b){
	a.prototype = new b();
	a.prototype.constructor = a;
}

Studio.infoStyle = 'background-color: #3af; padding: 2px 4px; color: #fff';
Studio.errorStyle = 'background-color: #c01; padding: 2px 4px;';
Studio.warningStyle = 'background-color: #fd2; padding: 2px 4px;';
Studio.engineStyle = 'background-color: #eee; color: #3af; padding: 1px 4px; border: 1px solid #3af';

