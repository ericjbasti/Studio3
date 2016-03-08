Studio.Pattern = function(attr, stage) {
	this.height = 512;
	this.width = 512;
	this.image = null;

	if (attr) {
		this.apply(attr);
	}

	this.cache = new Studio.Cache(this.width,this.height, stage.resolution);
	this._cached = false;
	this.image.status.addListener("onImageReady",this);
	return this;
};

Studio.extend(Studio.Pattern, Studio.Rect);

Studio.Pattern.prototype.setPattern = function(width,height) {
	for(var x = 0; x<this.width; x+=width){
		for(var y = 0; y<this.height; y+=height){
			this.cache.ctx.drawImage(this.image.image,x,y,width,height)
		}
	}
	return this;
};

Studio.Pattern.prototype.onImageReady = function(ready){
	if(ready){
		this.setPattern(96,96);
	}
}

Studio.Pattern.prototype.debugDraw = function(ctx) {
	ctx.strokeRect(this._dx - (this._world.width * this.anchorX), this._dy - (this._world.height * this.anchorY) - this._vertical_align, this._world.width, this._wrap_height);
};

Studio.Pattern.prototype.drawAngled = function(ctx) {
	ctx.save();
	this.prepAngled(ctx);
	ctx.drawImage(this.cache.image, 0, 0, this.cache.image.width, this.cache.image.height, -(this._dwidth * this.anchorX), -(this._dheight * this.anchorY), this._dwidth, this._dheight);
	ctx.restore();
};

Studio.Pattern.prototype.draw = function(ctx) {
	this.setAlpha(ctx);
	// since we don't resize the ctx, we need to compensate based on the differences of the ctx height and text height
	if (this.angle) {
		this.drawAngled(ctx);
	} else {
		ctx.drawImage(this.cache.image, 0, 0, this.cache.image.width, this.cache.image.height, this._dx - (this._dwidth * this.anchorX), this._dy - (this._dheight * this.anchorY), this._dwidth, this._dheight);
	}
};
