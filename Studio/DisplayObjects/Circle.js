Studio.Circle = function(attr) {
	this.color = new Studio.Color(1, 0, 0, 0)
	if (attr) {
		this.apply(attr)
	}
	this.height = this.width;
}

Studio.inherit(Studio.Circle, Studio.Rect)

Studio.Circle.prototype.draw = function(ctx) {
	this.setStyle(ctx)
	this.setAlpha(ctx)
	ctx.beginPath()

	ctx.arc(this._world.x, this._world.y, this._world.width/2, 0, 2 * Math.PI)
	ctx.fill()
}
