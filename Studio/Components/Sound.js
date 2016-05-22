Studio.getAudioContext = function() {
	if (typeof AudioContext !== "undefined") {
		return new AudioContext();
	} else if (typeof webkitAudioContext !== "undefined") {
		return new webkitAudioContext();
	} else {
		return false;
	}
}

Studio.Sounds = {
	source: null,
	assets: {},
	context: Studio.getAudioContext(),
	soundGraph: function soundGraph(snd) {
		if (snd._time == Studio.now) {

			//return;
		} else {
			snd._time = Studio.now;
			Studio.Sounds.source = Studio.Sounds.context.createBufferSource();
			Studio.Sounds.context.decodeAudioData(snd.data, function(soundBuffer) {
				Studio.Sounds.source.buffer = soundBuffer;
				Studio.Sounds.source.connect(Studio.Sounds.context.destination);
				Studio.Sounds.source.start();
			})
		}
	},
}

Studio.Sound = function(path) {
	this.snd = {_time: 0, data: null};
	this.load(path);
}

Studio.Sound.prototype = {
	load: function(path) {
		var me = this;
		if (!Studio.Sounds.assets[path]) {
			if (Studio.Sounds.context) {
				var request = new XMLHttpRequest();
				request.open("GET", path, true);
				request.responseType = "arraybuffer";
				request.onload = function() {
					Studio.Sounds.assets[path] = request.response;
					me.gainNode = Studio.Sounds.context.createGain();
					
					me.snd.data = Studio.Sounds.assets[path];
				};
				request.send();
			} else {
				var temp = document.createElement('audio');
				temp.src = path;
				temp.load();
				Studio.Sounds.assets[path] = temp;
				me.snd.data = Studio.Sounds.assets[path];
			}
		} else {
			me.snd.data = Studio.Sounds.assets[path];
		}
	},
	play: function() {
		if (this.snd.data) {
			if (Studio.Sounds.context) {
				Studio.Sounds.soundGraph(this.snd)
			} else {
				this.snd.data.play();
			}
		}
	},
	volume : function( val ){

	}
}

Studio.Sound.constructor = Studio.Sound;
