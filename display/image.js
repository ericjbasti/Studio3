/**
 * Image
 */

Studio.Image = function(path) {
	this.image = new Image();
	this.path = path;
	this.ready = false;
	this.height = 1;
	this.width = 1;
	if (path) {
		this.loadImage(path);
	}
};

Studio.Image.prototype.constructor = Studio.Image;

Studio.Image.prototype.loadImage = function(who) {
	if (Studio.assets[who]) {
		console.warn('Already loaded : ', who, Studio.assets[who]);
		this.image = Studio.assets[who];
		this.ready = true;
		if (this.onLoadComplete) {
			this.onLoadComplete();
		}
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
			newAsset.height = this.height;
			newAsset.width = this.width;
			
			if (Studio.queue === Studio.assets.length) {
				Studio.loaded = true;
			}
			if (newAsset.onLoadComplete) {
				newAsset.onLoadComplete();
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
	this.ready = false;
	this.buffer = this.image.getContext('2d');
	this.buffer.scale(resolution, resolution);

	// document.body.appendChild(this.image)
	// this.image.style.border = "1px solid green"
}

Studio.extend(Studio.Cache, Studio.Image);