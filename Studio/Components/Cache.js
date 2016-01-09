Studio.Cache = function(width, height, resolution) {
	var resolution = resolution || 1;

	this.image = document.createElement('canvas');
	this.image.width = width * resolution || 512;
	this.image.height = height * resolution || 512;
	this.width = width;
	this.height = height;
	this.ready = false;
	this.ctx = this.image.getContext('2d');
	this.ctx.scale(resolution, resolution);
};

Studio.extend(Studio.Cache, Studio.Image);
