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

Studio.Rect.prototype = new Studio.DisplayObject();
Studio.Rect.prototype.constructor = Studio.Rect;

Studio.Rect.prototype.setTexture = function(tx, ty, tX, tY) {

}

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
}

Studio.Rect.prototype.buildElement = function(gl, ratio) {
	this._delta(ratio);
	this._boundingBox.get_bounds(this);
	this.addVert(gl, this._boundingBox.left, this._boundingBox.top, this._z, this.slice.left, this.slice.top);
	this.addVert(gl, this._boundingBox.right, this._boundingBox.top, this._z, this.slice.right, this.slice.top);
	this.addVert(gl, this._boundingBox.left, this._boundingBox.bottom, this._z, this.slice.left, this.slice.bottom);
	this.addVert(gl, this._boundingBox.right, this._boundingBox.bottom, this._z, this.slice.right, this.slice.bottom);
};

Studio.Rect.prototype.buildTriangles = function(gl, ratio) {
	this._delta(ratio);
	this._boundingBox.get_bounds(this);
	this.addVert(gl, this._boundingBox.left, this._boundingBox.top, this._z, this.slice.left, this.slice.top);
	this.addVert(gl, this._boundingBox.right, this._boundingBox.top, this._z, this.slice.right, this.slice.top);
	this.addVert(gl, this._boundingBox.left, this._boundingBox.bottom, this._z, this.slice.left, this.slice.bottom);
	this.addVert(gl, this._boundingBox.right, this._boundingBox.top, this._z, this.slice.right, this.slice.top);
	this.addVert(gl, this._boundingBox.left, this._boundingBox.bottom, this._z, this.slice.left, this.slice.bottom);
	this.addVert(gl, this._boundingBox.right, this._boundingBox.bottom, this._z, this.slice.right, this.slice.bottom);
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
	ctx.rotate(this.angle || 0);

	if (this._scaleX !== 1 || this._scaleY !== 1) {
		ctx.scale(this._scaleX, this._scaleY);
	}
};

Studio.Rect.prototype.drawAngled = function(ctx) {
	ctx.save();
	this.prepAngled(ctx);
	ctx.fillRect(-(this.width * this.anchorX), -(this.height * this.anchorY), this.width, this.height);
	ctx.restore();
};

Studio.Rect.prototype.draw = function(ctx, ratio) {
	this.setStyle(ctx);
	this.setAlpha(ctx);
	if (this.angle) {
		this.drawAngled(ctx);
	}else {
		ctx.fillRect(this._dx - (this._width * this.anchorX), this._dy - (this._height * this.anchorY), this._width, this._height);
	}
};

Studio.difference = {};

Studio.Rect.prototype.hitTestRect = function(b) {
	Studio.difference.height = this._height + b._height;
	Studio.difference.width = this._width + b._width;
	Studio.difference.x = this._x - (this._width * this.anchorX) - b._x - (b._width * b.anchorX);
	Studio.difference.y = this._y - (this._height * this.anchorY) - b._y - (b._height * b.anchorY);
	if (Studio.difference.x < 0 && Studio.difference.y <= 0 && Studio.difference.height + Studio.difference.y >= 0 && Studio.difference.width + Studio.difference.x >= 0) {
		return true;
	}
	return false;
};



Studio.Clip = function(attr) {
	if (attr) {
		this.apply(attr); 
	}
};

Studio.Clip.prototype = new Studio.Rect();
Studio.Clip.prototype.constructor = Studio.Clip;

Studio.Clip.prototype.draw = function(ctx, ratio) {
	ctx.save();
    ctx.beginPath();
    if (this.angle) {
		this.drawAngled(ctx);
	}else {
		ctx.rect(this._dx - (this._width * this.anchorX), this._dy - (this._height * this.anchorY), this._width, this._height)
	}
	ctx.stroke();
	ctx.clip();
};
Studio.Clip.prototype.drawAngled = function(ctx) {
	this.prepAngled(ctx);
	ctx.rect(-(this.width * this.anchorX), -(this.height * this.anchorY), this.width, this.height);
};

Studio.CircleClip = function(attr) {
	if (attr) {
		this.apply(attr); 
	}
};

Studio.CircleClip.prototype = new Studio.Rect();
Studio.CircleClip.prototype.constructor = Studio.CircleClip;

Studio.CircleClip.prototype.draw = function(ctx, ratio) {
	ctx.save();
    ctx.beginPath();
	ctx.arc(this._dx, this._dy ,this._width/2, 0,2*Math.PI)
	// ctx.stroke();
	ctx.clip();
};

Studio.Restore = function(attr) {
};

Studio.Restore.prototype = new Studio.Rect();
Studio.Restore.prototype.constructor = Studio.Restore;

Studio.Restore.prototype.draw = function(ctx, ratio) {
	ctx.restore();
};

