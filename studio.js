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

// @codekit-append "display/tween.js"
// @codekit-append "display/font.js"
// @codekit-append "display/textbox.js"
// @codekit-append "input/keyboard.js"
// @codekit-append "input/touch.js"

'use strict';

// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
  Object.keys = (function () {
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

    return function (obj) {
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

(function(){
		// var lastTime = 0;
		var vendors = ['ms', 'moz', 'webkit', 'o'];
		for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
			window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
			window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
		}
		if (!window.requestAnimationFrame) {
			window.requestAnimationFrame = function(callback) {
				var id = window.setTimeout(function() {
					callback(Date.now());
				}, 4);
				return id;
			};
		}
		if (!window.cancelAnimationFrame) {
			window.cancelAnimationFrame = function(id) {
				clearTimeout(id);
			};
		}
	}());

	// Copyright  Vincent Piel 2013.
	// https://github.com/gamealchemist/Javascript-Pooling
	// setupPool.
	// setup a pool on the function, add a pnew method to retrieve objects
	// from the pool, and add a hidden pdispose method to the instances so
	// they can be sent back on the pool.
	// use : MyPureJSClass.setupPool(100);
	// then : var myInstance = MyPureJSClass.pnew(23, 'arg 2', ..)
	function setupPool(newPoolSize){
		//debugger;
		if (!(newPoolSize>=0)) throw('setupPool takes a size >= 0 as argument.');
		this.pool                = this.pool || []    ;
		this.poolSize            = this.poolSize || 0 ;
		this.pnew                = pnew               ;
		if(Object.defineProperty){
			Object.defineProperty(this.prototype, 'pdispose', { value : pdispose } ) ;
		}else{
			Object.prototype.pdispose = pdispose;
		}
		// pre-fill the pool.
		while ( this.poolSize < newPoolSize ) { (new this()).pdispose(); }
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
	function  pnew (){
		var pnewObj  = null     ;
		if (this.poolSize !== 0 ){              // the pool contains objects : grab one
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
	function pdispose(){
		var thisCttr = this.constructor;
		if (this.dispose) this.dispose()          ;  // Call dispose if defined
		thisCttr.pool[thisCttr.poolSize++] = this ;  // throw the object back in the pool
	}
	if(Object.defineProperty){
		Object.defineProperty(Function.prototype,'setupPool', { value : setupPool });
	}else{
		Function.prototype.setupPool = setupPool;
	}



if (!window.Studio){
	window.Studio = window.ß = {  // alt+S = ß just for those that hate writing things out.
		stages : [],
		stage : null,
		tko : null,
		assets : {length : 0},
		queue : 0,
		progress : 1,
		sin : Math.sin,
		cos : Math.cos,
		random : Math.random,
		abs : Math.abs,
		my : {ratio : 1},
		temp : {},
		info : {displayObjects : 0},
		active : true,
		cap: 34,
		draws: 0,
	};
	Studio.time = 1;
	Studio.interval = null;
	Studio.browser = navigator.userAgent.toLowerCase();
	Studio.disableRAF = false;
}




Studio.start = function(time_stamp){
	//Studio.stage=Studio.stages[0];
	if(time_stamp){
		Studio.time=time_stamp;
		requestAnimationFrame(Studio.loop);

	}else{
		requestAnimationFrame(Studio.start);
	}
};

Studio.loop = function(time_stamp){
	

	Studio.tick(time_stamp);
	Studio.draws = 0;

//	for(var m = 0; m!== Studio.stages.length; m++){
	//	Studio.stage = Studio.stages[m];
		// if(Studio.stage.active){
			Studio.stage.loop(Studio.frameRatio,Studio.delta);
		// }
	// }

	requestAnimationFrame(Studio.loop);
};

Studio.capped = function(time_stamp){
	// var time_stamp = Date.now();
	this.delta      = time_stamp - this.time;
	this.time       = time_stamp;
	this.delta = this.cap > this.delta ? this.delta : this.cap;
	this.frameRatio = this.delta/16.666666666666668; // vs 60fps
};

Studio.uncapped = function(time_stamp){
	this.delta      = time_stamp - this.time;
	this.time       = time_stamp;
	this.frameRatio = this.delta/16.666666666666668; // vs 60fps
};

Studio.tick = Studio.capped;

Studio.stopTime = function(){
	//this.time = this.now();
	//this.delta = this.frameRatio = 0;
	//this.active=false;
	// console.log('STOP');
};

Studio.resetTime = function(){
	//this.active=true;
	//this.start();
	// console.log('START');
};

Studio.z_index = function(a, b){
	if (a.z < b.z) {
		return -1;
	}
	if (a.z > b.z) {
		return 1;
	}
	return 0;
};

Studio.round = function(x){
	return x + 0.5 | 0;
};


// apply(obj:Object)
// this will modify or add the current object to contain the contents of the object (obj) being passed in.

Studio.apply = function (obj){ // Display Object and a few others share this function. All children of displayObject inherit this function.
	Studio.temp.keys = Object.keys(obj); // we use Studio.temp.keys to avoid creating more garbage.
	Studio.temp.keys_i = Studio.temp.keys.length;
	while (Studio.temp.keys_i) {
		Studio.temp.key = Studio.temp.keys[Studio.temp.keys_i-1];
		this[Studio.temp.key] = obj[Studio.temp.key];
		Studio.temp.keys_i--;
	}
	return this;
}

// addTo()

Studio.addTo = function(a,b){
    for (var attr in b){
        if(b.hasOwnProperty(attr) && !a.hasOwnProperty(attr)){
            a[attr]=b[attr];
        }
    }
}




