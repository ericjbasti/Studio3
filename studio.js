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
// @codekit-append "Studio/Input/Gamepad.js"
// @codekit-append "Studio/DisplayObjects/DOMElement.js"

var getWebGLContextType = function(){
	var canvas = document.createElement('canvas');
	if(canvas.getContext('webgl')){
		return 'webgl';
	}
	if(canvas.getContext('experimental-webgl')){
		return 'experimental-webgl';
	}
	return false;

}

var Studio = Studio || {
	stages: [],
	_current_stage: null,
	assets: {
		length: 0
	},
	asset_count: 0,
	queue: 0,
	progress: 0,
	active: true,
	cap: 1000 / 20, // don't let the true frame rate go below 20fps, prevent huge frame skips
	draws: 0,
	loaded: true,
	version: '0.5.1',
	now: 0, // to get around Safari not supporting performance.now() you can pull in the timestap with this property.
	delta: 0,
	time: 1,
	RAF: null,
	browser_info: {
		type: navigator.userAgent.toLowerCase(),
		webGL: getWebGLContextType(),
		iOS : (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream)
	},
	_temp: {}
}

Studio.updateProgress = function() {
	this.progress = this.queue / this.assets.length
}

Studio._continue = function(time_stamp){
	if (Studio.stages.length > 1) {
		Studio.RAF = requestAnimationFrame(Studio.loopAll)
	} else {
		Studio._current_stage = Studio.stages[0]
		Studio.RAF = requestAnimationFrame(Studio.loop)
	}
}


// this function starts the entire engine. It also checks to see if it will be drawing multiple stages.
// if stages.length > 1 it will loop through all the stages, otherwise it just renders the one it has.
// by doing this check we can avoid an aditional for loop, when we don't need it.
Studio.start = function(time_stamp) {
	if (Studio.queue === Studio.assets.length) {
		Studio.progress = 1
	}
	if (time_stamp) {
		Studio.now = time_stamp
		Studio.time = time_stamp
		Studio._continue()

	} else {
		Studio.RAF = requestAnimationFrame(Studio.start)
	}
}

// this function renders the _current_stage.
Studio._loop = function() {
	if (Studio._current_stage.active) {
		Studio._current_stage.loop(Studio.delta)
	}
}

Studio.loop = function(time_stamp) {
	Studio.tick(time_stamp)
	Studio.draws = 0
	Studio._loop();
	Studio.RAF = requestAnimationFrame(Studio.loop)
}

Studio.loopAll = function(time_stamp) {
	Studio.tick(time_stamp)
	Studio.draws = 0
	for (var m = 0; m !== Studio.stages.length; m++) {
		Studio._current_stage = Studio.stages[m]
		Studio._loop()
	}
	Studio.RAF = requestAnimationFrame(Studio.loopAll)
}

Studio._tick = {
	console: function(time_stamp) { // slows down, when the processor can't handle it.
		this.delta = 16.6666666
		this.now += this.delta
	},
	capped: function(time_stamp) { // never lets us skip too many frames
		this.delta = time_stamp - this.now
		this.now = time_stamp
		this.delta = this.cap > this.delta ? this.delta : this.cap
	},
	uncapped: function(time_stamp) {
		this.delta = time_stamp - this.now
		this.now = time_stamp
	}
}

Studio.tick = Studio._tick.capped

Studio._addingAsset = function() {
	this.assets.length++
	this.updateProgress()
}
Studio._loadedAsset = function() {
	this.queue++
	this.updateProgress()
	this.asset_count++
}
Studio.handleVisibilityChange = function() {
	if (document.hidden) {
		console.log('%cStudio Paused (visibilitychange)', Studio.statStyle)
		cancelAnimationFrame(Studio.RAF)
	} else {
		console.log('%cStudio Play (visibilitychange)', Studio.statStyle)
		Studio.RAF = requestAnimationFrame(Studio._continue)
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
	Studio._temp.keys = Object.keys(obj) // we use Studio._temp.keys to avoid creating more garbage.
	Studio._temp.keys_i = Studio._temp.keys.length
	while (Studio._temp.keys_i) {

		if (Studio._temp.key === 'color_hex' && this['color']) {
			this['color'].setFromHex(obj[Studio._temp.key])
		}
		Studio._temp.key = Studio._temp.keys[Studio._temp.keys_i - 1]
		this[Studio._temp.key] = obj[Studio._temp.key]
		Studio._temp.keys_i--
	}
	return this
}

// addTo()

Studio.addTo = function(a) {
	for (var i = 1; i < arguments.length; i++){
		var b = arguments[i]
		for (var attr in b) {
			if (b.hasOwnProperty(attr) && !a.hasOwnProperty(attr)) {
				a[attr] = b[attr]
			}
		}
	}
	return a
}

// Studio.inherit(a,b)
// A : the New Class
// B : Class to inherit attributes from.

Studio.inherit = function(A, B, properties) {
	if (properties) {
		A.prototype = new B(properties)
	} else {
		A.prototype = new B()
	}
	A.prototype.constructor = A
}

Studio.windowResize = function(){
	for (var m = 0; m !== Studio.stages.length; m++) {
		if(Studio.stages[m].resize){
			Studio.stages[m].resize()
			Studio.stages[m].render(0)
		}
	}
}

window.addEventListener('resize', Studio.windowResize);

Studio.TOP = Studio.LEFT = 0
Studio.MIDDLE = Studio.CENTER = 0.5
Studio.BOTTOM = Studio.RIGHT = 1

Studio.infoStyle = 'background-color: #3af; padding: 2px 4px; color: #fff'
Studio.errorStyle = 'background-color: #c01; padding: 2px 4px;'
Studio.warningStyle = 'background-color: #fd2; padding: 2px 4px;'
Studio.statStyle = 'background-color: #eee; padding: 2px 4px; color: #555; font-size: 10px'
Studio.engineStyle = 'background-color: #eee; color: #3af; padding: 1px 4px; border: 1px solid #3af'

