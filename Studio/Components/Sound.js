

// var create_snd = function(path) {
// 	if (!SOUNDS[path]) {
// 		var temp = document.createElement('audio');
// 		temp.src = path;
// 		temp.load();
// 		SOUNDS[path] = temp;
// 		return temp;
// 	} else {
// 		return SOUNDS[path];
// 	}
// }

// var change_volume = function(val) {
// 	for (var i in SOUNDS) {
// 		SOUNDS[i].volume = val;
// 	}
// }
var context;
if (typeof AudioContext !== "undefined") {
    context = new AudioContext();
} else if (typeof webkitAudioContext !== "undefined") {
    context = new webkitAudioContext();
} else {
    throw new Error('AudioContext not supported. :(');
}



var SOUNDS = {};

Studio.Sound = function(path){
	this.snd = null;
	this.load(path);
}

var soundSource, soundBuffer;
function audioGraph(audioData) {
    // create a sound source
    soundSource = context.createBufferSource();

    // The Audio Context handles creating source buffers from raw binary
    context.decodeAudioData(audioData, function(soundBuffer){
        // Add the buffered data to our object
        soundSource.buffer = soundBuffer;

        // Plug the cable from one thing to the other
        soundSource.connect(context.destination);
        soundSource.start(context.currentTime);
    }); 
}

Studio.Sound.prototype = {
	load: function(path){
		if (!SOUNDS[path]) {
			// var temp = document.createElement('audio');
			// temp.src = path;
			// temp.load();
			// SOUNDS[path] = temp;

			var request = new XMLHttpRequest();
			request.open("GET", path, true);
			request.responseType = "arraybuffer";
			 
			// Our asynchronous callback
			var me = this;
			request.onload = function() {
			    SOUNDS[path] = request.response;
			    me.snd = SOUNDS[path];
			};
			request.send();
		} else {
			me.snd = SOUNDS[path];
		}
	},
	play: function(){
		// this.snd.play();
		if(this.snd){
			try{audioGraph(this.snd)}
			catch(e){}
		}
	},

}

Studio.Sound.constructor = Studio.Sound;
