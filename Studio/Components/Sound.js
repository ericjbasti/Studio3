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
		if (snd._time == Studio.now ) {
			// playing the same soundbuffer at the exact same time causes errors and horrible distortion
			// we make sure not to let that happen.
			return;
		} else {
			snd._time = Studio.now;
			this.source = this.context.createBufferSource();
			this.source.buffer = snd.data;
			this.source.connect(this._volume);
			this._volume.connect(this.context.destination);
			this.source.start(0);
		}
	},
	init: function(){
		if(this.context){
			this._volume = this.context.createGain();
			this.volume = this._volume.gain;
			this.setVolume = function(vol){
				this.volume.value = vol;
			}
		}else{
			this.setVolume = function(vol){
				if(vol>1) vol = 1
				if(vol<0) vol = 0
				for( var i in this.assets){
					this.assets[i].volume = vol;
				}
			}
		}
	},
}
Studio.Sounds.init();

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
					me.snd._data = Studio.Sounds.assets[path];
					Studio.Sounds.context.decodeAudioData(me.snd._data,function(soundBuffer){
						me.snd.data = soundBuffer;
					})
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
