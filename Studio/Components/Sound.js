Studio.getAudioContext = function() {
	if (typeof AudioContext !== 'undefined') {
		return new AudioContext()
	} else if (typeof webkitAudioContext !== 'undefined') {
		return new webkitAudioContext()
	} else {
		return false
	}
}

Studio.Sounds = {
	source: null,
	context: Studio.getAudioContext(),
	soundGraph: function soundGraph(snd) {
		if (snd._time == Studio.now) {
			// playing the same soundbuffer at the exact same time causes errors and horrible distortion
			// we make sure not to let that happen.
			return
		} else {
			snd._time = Studio.now
			this.source = this.context.createBufferSource()
			this.source.loop = snd.loop
			this.source.buffer = snd.data
			this.source.connect(snd._volume)
			snd._volume.connect(this._volume)
			this._volume.connect(this.context.destination)
			this.source.start(0)
		}
	},
	init: function() {
		if (this.context) {
			this._volume = this.context.createGain()
			this.volume = this._volume.gain
			this.setVolume = function(vol) {
				this.volume.value = vol
			}
			this._filter = this.context.createBiquadFilter()

		} else {
			this.setVolume = function(vol) {
				if (vol > 1) vol = 1
				if (vol < 0) vol = 0
				for (var i in this.assets) {
					this.assets[i].volume = vol
				}
			}
		}
		var mute = document.createElement('div')
		mute.innerHTML = 'Enable Sound'
		mute.ontouchend = function() {
			song.play()
		}
		document.body.appendChild(mute)
	}
}

Studio.Sounds.init()

Studio.Sound = function(path) {
	this.snd = {_time: 0, data: null, loop: false, volume: 1}
	this.status = new Studio.Messenger()
	this.load(path)
}

Studio.Sound.prototype = {
	constructor: Studio.Sound,
	load: function(path) {
		var me = this

		if (!Studio.assets[path]) {
			if (Studio.Sounds.context) {
				var request = new XMLHttpRequest()
				request.open('GET', path, true)
				request.responseType = 'arraybuffer'
				request.onload = function() {
					Studio.assets[path] = request.response
					me.snd._data = Studio.assets[path]
					me.snd._volume = Studio.Sounds.context.createGain()
					me.snd.volume = me.snd._volume.gain
					me.snd.volume.value = 1
					Studio.Sounds.context.decodeAudioData(me.snd._data,function(soundBuffer) {
						me.snd.data = soundBuffer
						Studio._loadedAsset()
					})
				}
				Studio._addingAsset()
				request.send()
			} else {
				var temp = document.createElement('audio')
				temp.src = path
				temp.load()
				Studio.assets[path] = temp
				me.snd.data = Studio.assets[path]
			}
		} else {
			me.snd.data = Studio.assets[path]
		}
	},
	play: function() {
		if (this.snd.data) {
			if (Studio.Sounds.context) {
				Studio.Sounds.soundGraph(this.snd)
			} else {
				this.snd.data.play()
				this.snd.data.loop = this.snd.loop
			}
		} else {
			console.log('Sound file not ready.')
		}
	},
	volume: function(val) {

	},
	stop: function() {

	},
	loop: function(set) {
		this.snd.loop = set
	}
}

// Studio.SoundManager = function(){
// 	this.source = null
// 	this.context = Studio.getAudioContext();
// 	this.init();
// }
// Studio.SoundManager.prototype = {
// 	constructor: Studio.SoundManager,
// 	soundGraph: function soundGraph(snd) {
// 		if (snd._time == Studio.now ) {
// 			// playing the same soundbuffer at the exact same time causes errors and horrible distortion
// 			// we make sure not to let that happen.
// 			return;
// 		} else {
// 			snd._time = Studio.now;
// 			this.source = this.context.createBufferSource();
// 			this.source.buffer = snd.data;
// 			this.source.connect(this._volume);
// 			this._volume.connect(this.context.destination);
// 			this.source.start(0);
// 		}
// 	},
// 	init: function(){
// 		if(this.context){
// 			this._volume = this.context.createGain();
// 			this.volume = this._volume.gain;
// 			this.setVolume = function(vol){
// 				this.volume.value = vol;
// 			}
// 		}else{
// 			this.setVolume = function(vol){
// 				if(vol>1) vol = 1
// 				if(vol<0) vol = 0
// 				for( var i in this.assets){
// 					this.assets[i].volume = vol;
// 				}
// 			}
// 		}
// 	},
// 	createSound: function(path){
// 		var sound;
// 		if (Studio.assets[path]) {
// 			console.warn('Already loaded : ', path, Studio.assets[path])
// 			sound = Studio.assets[path]
// 			sound.ready = true
// 			sound.status.setStatus(this.ready)
// 			return sound
// 		} else {
// 			Studio.assets.length++
// 			if (this.context) {
// 				var request = new XMLHttpRequest();
// 				request.open("GET", path, true);
// 				request.responseType = "arraybuffer";
// 				request.onload = function() {
// 					Studio.assets[path] = request.response;
// 					me.snd._data = Studio.Sounds.assets[path];
// 					Studio.Sounds.context.decodeAudioData(me.snd._data,function(soundBuffer){
// 						me.snd.data = soundBuffer;
// 					})
// 				};
// 				request.send();
// 			} else {
// 				var temp = document.createElement('audio');
// 				temp.src = path;
// 				temp.load();
// 				Studio.Sounds.assets[path] = temp;
// 				me.snd.data = Studio.Sounds.assets[path];
// 			}
// 			Studio.queue++
// 		}
// 	}
// }

// var SS = new Studio.SoundManager();

