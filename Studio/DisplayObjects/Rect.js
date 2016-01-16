/**
 * Rect
 */

Studio.Rect = function(attr) {
	this.color = new Studio.Color(1, 0, 0, 0);
	this.slice = new Studio.Box(10, 0, 0, 0);
	if (attr) {
		this.apply(attr);
	}
};

Studio.extend(Studio.Rect, Studio.DisplayObject);

Studio.Rect.prototype.addVert = function(gl, x, y, z, tx, ty) {
	gl._batch[gl._count++] = x;
	gl._batch[gl._count++] = y;
	// gl._batch[gl._count+2] = 1;
	gl._batch[gl._count++] = this.color.r;
	gl._batch[gl._count++] = this.color.g;
	gl._batch[gl._count++] = this.color.b;
	gl._batch[gl._count++] = this.color.a;
	gl._batch[gl._count++] = (tx);
	gl._batch[gl._count++] = (ty);
	// gl._count +=8;
};

Studio.Rect.prototype.buildElement = function(gl, ratio, interpolate) {
	if(interpolate){
		this._delta(ratio);
	}else{
		this._dset();
	}
	this._boundingBox.get_bounds(this);
	this.addVert(gl, this._boundingBox.left, this._boundingBox.top, this._world.z, this.slice.left, this.slice.top);
	this.addVert(gl, this._boundingBox.right, this._boundingBox.top, this._world.z, this.slice.right, this.slice.top);
	this.addVert(gl, this._boundingBox.left, this._boundingBox.bottom, this._world.z, this.slice.left, this.slice.bottom);
	this.addVert(gl, this._boundingBox.right, this._boundingBox.bottom, this._world.z, this.slice.right, this.slice.bottom);
};

Studio.Rect.prototype.buildTriangles = function(gl, ratio) {
	this._delta(ratio);
	this._boundingBox.get_bounds(this);
	this.addVert(gl, this._boundingBox.left, this._boundingBox.top, this._world.z, this.slice.left, this.slice.top);
	this.addVert(gl, this._boundingBox.right, this._boundingBox.top, this._world.z, this.slice.right, this.slice.top);
	this.addVert(gl, this._boundingBox.left, this._boundingBox.bottom, this._world.z, this.slice.left, this.slice.bottom);
	this.addVert(gl, this._boundingBox.right, this._boundingBox.top, this._world.z, this.slice.right, this.slice.top);
	this.addVert(gl, this._boundingBox.left, this._boundingBox.bottom, this._world.z, this.slice.left, this.slice.bottom);
	this.addVert(gl, this._boundingBox.right, this._boundingBox.bottom, this._world.z, this.slice.right, this.slice.bottom);
};

Studio.Rect.prototype.setStyle = function(ctx) {
	if (this.color !== ctx.fillStyle) {
		ctx.fillStyle = this.color.style;
	}
};

Studio.Rect.prototype.prepAngled = function(ctx) {
	if (this._dx || this._dy) {
		ctx.translate(this._dx, this._dy);
	}
	ctx.rotate(this._dAngle || 0);
	if (this._world.scaleX !== 1 || this._world.scaleY !== 1) {
		ctx.scale(this._world.scaleX, this._world.scaleY);
	}
};

Studio.Rect.prototype.drawAngled = function(ctx) {
	ctx.save();
	this.prepAngled(ctx);
	ctx.fillRect(-(this.width * this.anchorX), -(this.height * this.anchorY), this.width, this.height);
	// ctx.strokeRect(-(this.width * this.anchorX), -(this.height * this.anchorY), this.width, this.height);
	ctx.restore();
};

Studio.Rect.prototype.draw = function(ctx) {
	this.setStyle(ctx);
	this.setAlpha(ctx);
	ctx.strokeStyle = '#fff';
	if (this.angle) {
		this.drawAngled(ctx);
	} else {
		// ctx.strokeRect(this._dx - (this._world.width * this.anchorX), this._dy - (this._world.height * this.anchorY), this._world.width, this._world.height);
		ctx.fillRect(this._dx - (this._world.width * this.anchorX), this._dy - (this._world.height * this.anchorY), this._world.width, this._world.height);
	}
};
