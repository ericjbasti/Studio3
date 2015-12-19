/**
 * Sprite
 */

Studio.Sprite = function(attr) {
	this.image = null;
	this.color = new Studio.Color(1, 1, 1, 1);
	this._boundingBox = new Studio.Box();
	if (attr) {
		this.apply(attr);
	}
};

Studio.extend(Studio.Sprite, Studio.Rect);

Studio.Sprite.prototype.drawAngled = function(ctx) {
	ctx.save();
	this.prepAngled(ctx);
	ctx.drawImage(this.image.image, 0, 0, this.image.width, this.image.height, -(this.width * this.anchorX), -(this.height * this.anchorY), this.width, this.height);
	ctx.restore();
};

Studio.Sprite.prototype.draw = function(ctx) {
	if (!this.image) {
		return;
	}
	if (!this.image.ready) {
		return;
	}
	this.setAlpha(ctx);
	if (this.angle) {
		this.drawAngled(ctx);
	} else {

		ctx.drawImage(this.image.image, 0, 0, this.image.width, this.image.height, this._dx - (this._world.width * this.anchorX), this._dy - (this._world.height * this.anchorY), this._world.width, this._world.height);
	}
};

/**
 * ImageSlice
 */

Studio.ImageSlice = function(attr) {
	this.image = null;
	this.color = new Studio.Color(1, 1, 1, 1);
	this.rect = {x: 0, y: 0, height: 32, width: 32};
	this._boundingBox = new Studio.Box();
	if (attr) {
		this.apply(attr);
	}
};

Studio.extend(Studio.ImageSlice, Studio.Sprite);

Studio.ImageSlice.prototype.drawAngled = function(ctx) {
	ctx.save();
	this.prepAngled(ctx);
	ctx.drawImage(this.image.image, this.rect.x, this.rect.y, this.rect.width, this.rect.height, -(this.width * this.anchorX), -(this.height * this.anchorY), this.width, this.height);
	ctx.restore();
};

Studio.ImageSlice.prototype.draw = function(ctx) {
	if (!this.image) {
		return;
	}
	if (!this.image.ready) {
		return;
	}
	this.setAlpha(ctx);
	if (this.angle) {
		this.drawAngled(ctx);
	} else {

		ctx.drawImage(this.image.image, this.rect.x, this.rect.y, this.rect.width, this.rect.height, this._dx - (this._world.width * this.anchorX), this._dy - (this._world.height * this.anchorY), this._world.width, this._world.height);
	}
};

/**
 * SpriteAnimation --- just like a Sprite but uses a SpriteSheet to render, and as such has frames, framerates etc...
 */ 

Studio.SpriteAnimation = function(attr) {
	this.sheet = new Studio.SpriteSheet();
	this.loop = [[0, 0]];
	this.fps = 12;
	this.frame = 0;
	this.sliceX = 0;
	this.sliceY = 0;
	this.repeat = true;
	this.startTime = 0;
	if (attr) {
		this.apply(attr);
	}
	this.setStartingFrame(this.frame);
};

Studio.extend(Studio.SpriteAnimation, Studio.Rect);

Studio.SpriteAnimation.prototype.setStartingFrame = function(a) {
	this.frame = a;
	this.startTime = Studio.time;
	this.myTime = this.startTime + (a * (1000 / this.fps));
};

Studio.SpriteAnimation.prototype.draw = function(ctx) {
	if (!this.sheet) {
		return;
	}
	if (!this.sheet.ready) {
		return;
	}
	this.setAlpha(ctx);
	ctx.drawImage(this.sheet.image, this.sheet.rect.width * this.sliceX, this.sheet.rect.height * this.sliceY, this.sheet.rect.width, this.sheet.rect.height, this._dx - (this._world.width * this.anchorX), this._dy - (this._world.height * this.anchorX), this._world.width, this._world.height);
	if (this.loop.length) {
		this.updateFrame();
	}
};

Studio.SpriteAnimation.prototype.setSlice = function() {
	this.sliceX = this.loop[this.frame][0];
	this.sliceY = this.loop[this.frame][1];
};

Studio.SpriteAnimation.prototype.updateFrame = function() {
	this.myTime += Studio.delta;

	this.frame = (((this.myTime - this.startTime) * this._speed) / (1000 / this.fps)) | 0;

	if (this.frame >= this.loop.length) {
		this.startTime = this.myTime;
		this.frame = 0;
		if (this.onLoopComplete) {
			this.onLoopComplete.call(this);
		}
	}
	this.setSlice();
};

Studio.SpriteSheet = function(path, attr) {
	this.image = new Studio.Image();
	this.rect = {height: 32, width: 32};
	if (path) {
		this.loadImage(path);
	}
	if (attr) {
		this.apply(attr);
	}
};

Studio.extend(Studio.SpriteSheet, Studio.Image);

Studio.SpriteSheet.prototype.apply = function(obj) {
	var keys = Object.keys(obj);
	var i = keys.length;
	var key;
	while (i) {
		key = keys[i - 1];
		this[key] = obj[key];
		i--;
	}
};

