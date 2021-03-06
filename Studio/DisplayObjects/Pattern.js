/*
	Studio.Pattern(
		attr : {} || null 		(defaults to { height: 512, width: 512, resolution: 1})
	)
	Studio.Pattern is an extention of Studio.Rect.
	It contains a Studio.Cache to store the pattern once created.
	ex. var pattern = new Studio.Pattern({
			x:20,
			y:20,
			width: 256,
			height: 128,
			resolution: 2
		});
*/

Studio.Pattern = function(attr) {
	this.height = 512
	this.width = 512
	this.overflowX = 0
	this.overflowY = 0
	this.resolution = 1
	this.image = null
	this.slice = 'Full'
	this.offsetX = 0
	this.offsetY = 0
	// this.pattern = [{0,0,96,96}]
	if (attr) {
		this.apply(attr)
	}
	this.width = this.width + this.overflowX
	this.height = this.height + this.overflowY
	this.cache = new Studio.Cache(this.width, this.height, this.resolution)
	this._cached = false
	this.image.status.addListener('onImageReady', this)
	return this
}

Studio.extend(Studio.Pattern, Studio.Rect)

/*
	setPattern
*/

Studio.Pattern.prototype.setPattern = function() {
	var slice = this.image.slice[this.slice]

	var width = slice.width * this.scaleX || 0
	var height = slice.height * this.scaleY  || 0
	for (var x = 0; x < this.width; x += width) {
		for (var y = 0; y < this.height; y += height) {
			if (this.offsetX + width > width) {
				this.offsetX -= width
			}
			if (this.offsetY + height > height) {
				this.offsetY -= height
			}
			this.cache.ctx.drawImage(this.image.image, slice.x, slice.y, slice.width, slice.height, x + this.offsetX,y + this.offsetY, width, height)
		}
	}
	return this
}

Studio.Pattern.prototype.checkOverflow = function() {
	if (this.x > 0) {
		this.x -= this.overflowX
	}
	if (this.y > 0) {
		this.y -= this.overflowY
	}
	if (this.x < -this.overflowX) {
		this.x += this.overflowX
	}
	if (this.y < -this.overflowY) {
		this.y += this.overflowY
	}
}
/*
	onImageReady(
		ready : Boolean		// value returned by image object
	)

	Once the image for this pattern is loaded we can create the pattern.
	Otherwise the cache is never auto populated.
*/

Studio.Pattern.prototype.onImageReady = function(ready) {
	if (ready) {
		this.setPattern()
	}
}

Studio.Pattern.prototype.debugDraw = function(ctx) {
	ctx.strokeRect(this._dx - (this._world.width * this.anchorX), this._dy - (this._world.height * this.anchorY) - this._vertical_align, this._world.width, this._wrap_height)
}

Studio.Pattern.prototype.drawAngled = function(ctx) {
	ctx.save()
	this.prepAngled(ctx)
	ctx.drawImage(this.cache.image, 0, 0, this.cache.image.width, this.cache.image.height, -(this._dwidth * this.anchorX), -(this._dheight * this.anchorY), this._dwidth, this._dheight)
	ctx.restore()
}

Studio.Pattern.prototype.draw = function(ctx) {
	this.setAlpha(ctx)
	// since we don't resize the ctx, we need to compensate based on the differences of the ctx height and text height
	if (this.angle) {
		this.drawAngled(ctx)
	} else {
		ctx.drawImage(this.cache.image, 0, 0, this.cache.image.width, this.cache.image.height, this._dx - (this._dwidth * this.anchorX), this._dy - (this._dheight * this.anchorY), this._dwidth, this._dheight)
	}
}
