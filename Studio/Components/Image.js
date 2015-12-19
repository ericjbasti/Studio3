/**
 * Image
 */

Studio.Image = function(path) {
	this.image = null;
	this.path = null;
	if (path) {
		this.loadImage(path);
	}
	this.status = new Studio.Messanger();
};

Studio.Image.prototype.constructor = Studio.Image;

Studio.Image.prototype.ready = false;
Studio.Image.prototype.height = 1;
Studio.Image.prototype.width = 1;

Studio.Image.prototype.loadImage = function(who) {
	if (Studio.assets[who]) {
		console.warn('Already loaded : ', who, Studio.assets[who]);
		this.image = Studio.assets[who];
		this.ready = true;
		this.status.setStatus(this.ready);
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
