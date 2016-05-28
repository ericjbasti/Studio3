Studio.Clip = function(attr) {
	if (attr) {
		this.apply(attr)
	}
}

Studio.inherit(Studio.Clip, Studio.Rect)

Studio.Clip.prototype.draw = function(ctx) {
	ctx.save()
	ctx.beginPath()
	if (this.angle) {
		this.drawAngled(ctx)
	} else {
		ctx.rect(this._dx - (this._dwidth * this.anchorX), this._dy - (this._dheight * this.anchorY), this._dwidth, this._dheight)
	}
	// ctx.stroke();
	ctx.clip()
}
Studio.Clip.prototype.drawAngled = function(ctx) {
	this.prepAngled(ctx)
	ctx.rect(-(this.width * this.anchorX), -(this.height * this.anchorY), this.width, this.height)
}
