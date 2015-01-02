/**
 * Rect
 */

Studio.Rect = function(attr){
	this.color = new Studio.Color(1,0,0,0);
	this.slice = new Studio.Box(10,0,0,0);
	if (attr){
		this.apply(attr); 
	}
};

Studio.Rect.prototype = new Studio.DisplayObject();
Studio.Rect.prototype.constructor = Studio.Rect;


Studio.Rect.prototype.setTexture = function(tx,ty,tX,tY){

}

Studio.Rect.prototype.addVert = function(gl,x,y,z,tx,ty){
	gl._batch[gl._count] = x;
	gl._batch[gl._count+1] = y;
	// gl._batch[gl._count+2] = 1;
	gl._batch[gl._count+2] = this.color.r;
	gl._batch[gl._count+3] = this.color.g;
	gl._batch[gl._count+4] = this.color.b;
	gl._batch[gl._count+5] = this.color.a;
	gl._batch[gl._count+6] = (tx);
	gl._batch[gl._count+7] = (ty);
	gl._count +=8;
}

Studio.Rect.prototype.buildElement = function(gl){
	this._boundingBox.get_bounds(this);
	this.addVert(gl,this._boundingBox.left,this._boundingBox.top, this._z, this.slice.left,this.slice.top);
	this.addVert(gl,this._boundingBox.right,this._boundingBox.top, this._z, this.slice.right,this.slice.top);
	this.addVert(gl,this._boundingBox.left,this._boundingBox.bottom, this._z, this.slice.left,this.slice.bottom);
	this.addVert(gl,this._boundingBox.right,this._boundingBox.bottom, this._z, this.slice.right,this.slice.bottom);
};

Studio.Rect.prototype.buildTriangles = function(gl){
	this._boundingBox.get_bounds(this);
	this.addVert(gl,this._boundingBox.left,this._boundingBox.top, this._z, this.slice.left,this.slice.top);
	this.addVert(gl,this._boundingBox.right,this._boundingBox.top, this._z, this.slice.right,this.slice.top);
	this.addVert(gl,this._boundingBox.left,this._boundingBox.bottom, this._z, this.slice.left,this.slice.bottom);
	this.addVert(gl,this._boundingBox.right,this._boundingBox.top, this._z, this.slice.right,this.slice.top);
	this.addVert(gl,this._boundingBox.left,this._boundingBox.bottom, this._z, this.slice.left,this.slice.bottom);
	this.addVert(gl,this._boundingBox.right,this._boundingBox.bottom, this._z, this.slice.right,this.slice.bottom);
};

Studio.Rect.prototype.setStyle = function(ctx){
	if(this.color!==ctx.fillStyle){
		ctx.fillStyle = this.color.style;
	}
};

Studio.Rect.prototype.prepAngled = function(ctx){
	if (this._x || this._y) {
		ctx.translate(this._x, this._y);
	}
	ctx.rotate(this.angle || 0);

	if (this._scaleX!==1 || this._scaleY!==1) {
		ctx.scale(this._scaleX, this._scaleY);
	}
};

Studio.Rect.prototype.drawAngled = function(ctx){
	ctx.save();
	this.prepAngled(ctx);
	ctx.fillRect(-(this.width*this.anchorX),-(this.height*this.anchorY), this.width, this.height);
	ctx.restore();
};

Studio.Rect.prototype.draw = function(ctx){
	this.setStyle(ctx);
	this.setAlpha(ctx);
	if(this.angle){
		this.drawAngled(ctx);
	}else{
		ctx.fillRect(this._x-(this._width*this.anchorX),this._y-(this._height*this.anchorY),this._width,this._height);
	}
};

Studio.difference= {};

Studio.Rect.prototype.hitTestRect = function(b) {
	Studio.difference.height = this._height + b._height;
	Studio.difference.width = this._width + b._width;
	Studio.difference.x=this._x-(this._width*this.anchorX)-b._x-(b._width*b.anchorX);
	Studio.difference.y=this._y-(this._height*this.anchorY)-b._y-(b._height*b.anchorY);
	if (Studio.difference.x < 0 && Studio.difference.y <= 0 && Studio.difference.height + Studio.difference.y >= 0 && Studio.difference.width + Studio.difference.x >= 0) {
		return true;
	}
	return false;
};