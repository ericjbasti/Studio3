// Studio.Broadcast = function(){
// 	this.broadcasts = {
// 		'stage.onReady': {status: false, tell:[]};
// 	};
// }

// Studio.Broadcast.prototype.addListener = function(who, to){

// }




/**
 * Image
 */

Studio.Image = function(path) {
	this.image = null;
	this.path = null;
	this.ready = false;
	this.height = 1;
	this.width = 1;

	if (path) {
		this.loadImage(path);
	}

	this.status = new Studio.Messanger();

	this.parent = parent || null;
};

Studio.Image.prototype.constructor = Studio.Image;

Studio.Image.prototype.loadImage = function(who) {
	if (Studio.assets[who]) {
		console.warn('Already loaded : ', who, Studio.assets[who]);
		this.image = Studio.assets[who];
		this.ready = true;
		this.status.setStatus(newAsset.ready);
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
			newAsset.status.setStatus(newAsset.ready);
			newAsset.height = this.height;
			newAsset.width = this.width;
			
			if (Studio.queue === Studio.assets.length) {
				Studio.loaded = true;
			}
			return newAsset;
		};
		Studio.assets[who].src = who;
		this.image = Studio.assets[who];
	}
};


Studio.Cache = function(width, height, resolution){
	var resolution = resolution || 1;

	this.image = document.createElement('canvas');
	this.image.width = width * resolution || 512;
	this.image.height = height * resolution || 512;
	this.width = width;
	this.height = height;
	this.ready = false;
	this.buffer = this.image.getContext('2d');
	this.buffer.scale(resolution, resolution);
}

Studio.extend(Studio.Cache, Studio.Image);