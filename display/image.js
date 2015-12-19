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