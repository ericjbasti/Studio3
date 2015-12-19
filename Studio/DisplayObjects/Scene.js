/**
 * Scene
 */

Studio.Scene = function(attr) {
	this.color = new Studio.Color(0,0,0,0);
	this.active = false;
	this.image = null;
	this.loader = null;
	this.assets = [];
	this.children = [];
	if (attr) {
		this.apply(attr);
	}
	if (this.build) {
		this.build();
	}
	if (this.init) {
		this.init();
	}
};

Studio.extend(Studio.Scene, Studio.DisplayObject);

Studio.Scene.prototype.loadAssets = function() {
	for (var i = 0; i !== arguments.length; i++) {
		this.assets.push(new Studio.Image(arguments[i]));
	}
};

Studio.Scene.prototype.setStyle = function(ctx) {
	if (this.color !== ctx.fillStyle) {
		ctx.fillStyle = this.color.style;
	}
};

Studio.Scene.prototype.draw = function(ctx) {
	this.setAlpha(ctx);
	// return;
	if (this.image) {
		ctx.drawImage(this.image.image, this._world.x, this._world.y, this.width, this.height);
		return;
	}
	if (this.color) {
		if (this.color.a === 0) {
			ctx.clearRect(this._world.x, this._world.y, this.width, this.height);
			return;
		}
		this.setStyle(ctx);
		ctx.fillRect(this._world.x, this._world.y,  this.width, this.height);
		return;
	}
};
