Studio.CircleClip = function(attr) {
	if (attr) {
		this.apply(attr)
	}
}

Studio.inherit(Studio.CircleClip, Studio.Rect)

Studio.CircleClip.prototype.draw = function(ctx) {
	ctx.save()
	ctx.beginPath()
	ctx.arc(this._dx, this._dy , this._world.width / 2, 0, 2 * Math.PI)
	ctx.clip()
}
