
// @codekit-prepend "Studio/Requirements.js"

// @codekit-append "Studio/Components/Box.js"
// @codekit-append "Studio/Components/Color.js"
// @codekit-append "Studio/Components/DisplayProperty.js"

// @codekit-append "Studio/Components/Messenger.js"
// @codekit-append "Studio/Components/LinkedList.js"
// @codekit-append "Studio/Components/Plugin.js"
// @codekit-append "Studio/Components/Image.js"
// @codekit-append "Studio/Components/Cache.js"
// @codekit-append "Studio/Components/Ease.js"
// @codekit-append "Studio/Components/Pool.js"

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
// @codekit-append "Studio/DisplayObjects/Pattern.js"
// @codekit-append "Studio/DisplayObjects/TileMap.js"

// @codekit-append "Studio/Effects/Standards.js"

// @codekit-append "Studio/engines/TimeStep.js"
// @codekit-append "Studio/engines/WebGL.js"
// @codekit-append "Studio/engines/Canvas.js"

// @codekit-append "Studio/Input/Keyboard.js"
// @codekit-append "Studio/Input/Touch.js"

// @codekit-append "Studio/Components/Sound.js"

var Studio = Studio || {
	stages: [],
	stage: null,
	assets: {
		length: 0
	},
	queue: 0,
	progress: 0,
	temp: {},
	active: true,
	cap: 1000 / 20, // don't let the true frame rate go below 20fps, prevent huge frame skips
	draws: 0,
	loaded: true,
	version: '0.5.1',
	now: 0, // to get around Safari not supporting performance.now() you can pull in the timestap with this property.
	delta: 0,
	canWebGL: document.createElement("canvas").getContext('webgl')!== null,
	time: 1,
	RAF: null,
	browser: navigator.userAgent.toLowerCase(),
}

Studio.updateProgress = function() {
	this.progress = this.queue / this.assets.length
}

Studio.start = function(time_stamp) {
	if (Studio.queue === Studio.assets.length) {
		Studio.progress = 1
	}
	if (time_stamp) {
		Studio.now = time_stamp
		Studio.time = time_stamp
		if (Studio.stages.length > 1) {
			Studio.RAF = requestAnimationFrame(Studio.loopAll)
		} else {
			Studio.RAF = requestAnimationFrame(Studio.loop)
		}

	} else {
		Studio.RAF = requestAnimationFrame(Studio.start)
	}
}

Studio._loop = function(i) {
	Studio.stage = Studio.stages[i]
	if (Studio.stage.active) {
		Studio.stage.loop(Studio.delta)
	}
}

Studio.loop = function(time_stamp) {
	Studio.tick(time_stamp)
	Studio.draws = 0
	Studio._loop(0)
	Studio.RAF = requestAnimationFrame(Studio.loop)
}

Studio.loopAll = function(time_stamp) {
	Studio.tick(time_stamp)
	Studio.draws = 0

	for (var m = 0; m !== Studio.stages.length; m++) {
		Studio._loop(m)
	}
	Studio.RAF = requestAnimationFrame(Studio.loopAll)
}
//?? what? Something is up with the time_stamp... seems like the float gets all out of whack eventually (floats suck).
// So to get the 60fps that you know is possible (check this before hand), setting the tick to be 60fps, we manage to match
// what the console (in this case Apple TV 4) is actually outputting. Quite amazed by this really.


Studio.console = function(time_stamp) {
	this.delta = 16.6666666
	this.now += this.delta
}

Studio.capped = function(time_stamp) {
	this.delta = time_stamp - this.now
	this.now = time_stamp
	this.delta = this.cap > this.delta ? this.delta : this.cap
}

Studio.uncapped = function(time_stamp) {
	this.delta = time_stamp - this.now
	this.now = time_stamp
}

Studio.tick = Studio.capped

Studio.stopTime = function() {
	//this.time = this.now();
	//this.delta = this.frameRatio = 0;
	//this.active=false;
	// console.log('STOP');
}

Studio.resetTime = function() {
	//this.active=true;
	//this.start();
	// console.log('START');
}

Studio._addingAsset = function(){
	this.assets.length++;
	this.updateProgress();
}
Studio._loadedAsset = function(){
	this.queue++;
	this.updateProgress();
}
Studio.handleVisibilityChange = function() {
	if (document.hidden) {
		console.log('%cStudio Paused (visibilitychange)', Studio.statStyle)
		cancelAnimationFrame(Studio.RAF)
	} else {
		console.log('%cStudio Play (visibilitychange)', Studio.statStyle)
		Studio.RAF = requestAnimationFrame(Studio.start)
	}
}

document.addEventListener('visibilitychange', Studio.handleVisibilityChange, false)

Studio.z_index = function(a, b) {
	if (a.z < b.z) {
		return -1
	}
	if (a.z > b.z) {
		return 1
	}
	return 0
}

Studio.round = function(x) {
	return x + 0.5 | 0
}

// apply(obj:Object)
// this will modify or add the current object to contain the contents of the object (obj) being passed in.



Studio.apply = function(obj) { // Display Object and a few others share this function. All children of displayObject inherit this function.
	Studio.temp.keys = Object.keys(obj) // we use Studio.temp.keys to avoid creating more garbage.
	Studio.temp.keys_i = Studio.temp.keys.length
	while (Studio.temp.keys_i) {

		if (Studio.temp.key === 'color_hex') {
			this['color'].setFromHex(obj[Studio.temp.key])
		}
		Studio.temp.key = Studio.temp.keys[Studio.temp.keys_i - 1]
		this[Studio.temp.key] = obj[Studio.temp.key]
		Studio.temp.keys_i--
	}
	return this
}



// addTo()

Studio.addTo = function(a, b) {
	for (var attr in b) {
		if (b.hasOwnProperty(attr) && !a.hasOwnProperty(attr)) {
			a[attr] = b[attr]
		}
	}
}

// Studio.extend(a,b)
// A : the New Class
// B : Class to inherit attributes from.

Studio.extend = function(A, B, properties) {
	if (properties) {
		A.prototype = new B(properties)
	} else {
		A.prototype = new B()
	}
	A.prototype.constructor = A
}


Studio.TOP = Studio.LEFT = 0
Studio.MIDDLE = Studio.CENTER = 0.5
Studio.BOTTOM = Studio.RIGHT = 1

Studio.infoStyle = 'background-color: #3af; padding: 2px 4px; color: #fff'
Studio.errorStyle = 'background-color: #c01; padding: 2px 4px;'
Studio.warningStyle = 'background-color: #fd2; padding: 2px 4px;'
Studio.statStyle = 'background-color: #eee; padding: 2px 4px; color: #555; font-size: 10px'
Studio.engineStyle = 'background-color: #eee; color: #3af; padding: 1px 4px; border: 1px solid #3af'

