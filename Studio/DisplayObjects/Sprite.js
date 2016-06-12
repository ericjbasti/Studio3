/**
 * Sprite
 */

Studio.Sprite = function(attr) {
	this.image = null
	this.slice = 'Full'
	this.color = Studio.WHITE

	if (attr) {
		this.apply(attr)
	}
}

Studio.inherit(Studio.Sprite, Studio.Rect)

Studio.Sprite.prototype.drawAngled = function(ctx) {
	ctx.save()
	this.prepAngled(ctx)
	ctx.drawImage(this.image.image,
		this.image.slice[this.slice].x,
		this.image.slice[this.slice].y,
		this.image.slice[this.slice].width,
		this.image.slice[this.slice].height,
		-(this.width * this.anchorX),
		-(this.height * this.anchorY),
		this.width,
		this.height
	)
	ctx.restore()
}

Studio.Sprite.prototype.buildElement = function(stage, ratio, interpolate) {
	if(!stage.buffers[this.image.path]){

			stage.buffers[this.image.path] = new Studio.BufferGL(this.image,0,stage.ctx);
		
	}
	stage.draws++

	if (interpolate) {
		this._delta(ratio)
	} else {
		this._dset()
	}
	this._boundingBox.get_bounds(this)
	
	this.verts(this._boundingBox)
}

Studio.Sprite.prototype.draw = function Studio_Sprite_draw(ctx) {
	if (!this.image) {
		return
	}
	if (!this.image.ready) {
		return
	}
	this.setAlpha(ctx)
	if (this.angle) {
		this.drawAngled(ctx)
	} else {
		ctx.drawImage(
			this.image.image,
			this.image.slice[this.slice].x,
			this.image.slice[this.slice].y,
			this.image.slice[this.slice].width,
			this.image.slice[this.slice].height,
			this._dx - (this._dwidth * this.anchorX),
			this._dy - (this._dheight * this.anchorY),
			this._dwidth,
			this._dheight
		)
		if (this.borderlap && this.border) {
			if (this._dx -  (this._dwidth * this.anchorX) < this.border.x) {
				ctx.drawImage(
					this.image.image,
					this.image.slice[this.slice].x,
					this.image.slice[this.slice].y,
					this.image.slice[this.slice].width,
					this.image.slice[this.slice].height,
					this.border.width + this._dx - (this._dwidth * this.anchorX),
					this._dy - (this._dheight * this.anchorY),
					this._dwidth,
					this._dheight
				)
			}
			if ((this._dx + this._world.width) > this.border.width) {
				ctx.drawImage(
					this.image.image,
					this.image.slice[this.slice].x,
					this.image.slice[this.slice].y,
					this.image.slice[this.slice].width,
					this.image.slice[this.slice].height,
					this._dx - (this._dwidth * this.anchorX) - this.border.width,
					this._dy - (this._dheight * this.anchorY),
					this._dwidth,
					this._dheight
				)
			}
		}
	}
}

/**
 * SpriteAnimation --- just like a Sprite but uses a Spriteimage to render, and as such has frames, framerates etc...
 */ 

Studio.SpriteAnimation = function(attr) {
	this.sheet = null
	this.loop = [[0, 0]]
	this.fps = 12
	this.frame = 0
	this.sliceX = 0
	this.sliceY = 0
	this.offsetY = 0
	this.offsetX = 0
	this.repeat = true
	this.startTime = 0
	if (attr) {
		this.apply(attr)
	}
	this.setStartingFrame(this.frame)
}

Studio.inherit(Studio.SpriteAnimation, Studio.Rect)

Studio.SpriteAnimation.prototype.setStartingFrame = function(a) {
	this.frame = a
	this.startTime = Studio.time
	this.myTime = this.startTime + (a * (1000 / this.fps))
}

Studio.SpriteAnimation.prototype.draw = function(ctx) {
	if (!this.sheet) {
		return
	}
	if (!this.sheet.ready) {
		return
	}
	this.setAlpha(ctx)

	ctx.drawImage(this.sheet.image, this.rect.width * this.sliceX, this.rect.height * this.sliceY, this.rect.width, this.rect.height, this._dx - (this._dwidth * this.anchorX), this._dy - (this._dheight * this.anchorX), this._dwidth, this._dheight)

	if (this.borderlap && this.border) {
		if (this._dx -  (this._dwidth * this.anchorX) < this.border.x) {
			ctx.drawImage(this.sheet.image, this.rect.width * this.sliceX, this.rect.height * this.sliceY, this.rect.width, this.rect.height, this.border.width + this._dx - (this._dwidth * this.anchorX), this._dy - (this._dheight * this.anchorY), this._dwidth, this._dheight)
		}
		if ((this._dx + this._world.width) > this.border.width) {
			ctx.drawImage(this.sheet.image, this.rect.width * this.sliceX, this.rect.height * this.sliceY, this.rect.width, this.rect.height, this._dx - (this._dwidth * this.anchorX) - this.border.width, this._dy - (this._dheight * this.anchorY), this._dwidth, this._dheight)
		}
	}
	if (this.loop.length) {
		this.updateFrame()
	}
}

Studio.SpriteAnimation.prototype.setSlice = function() {
	this.sliceX = this.loop[this.frame][0] + this.offsetX
	this.sliceY = this.loop[this.frame][1] + this.offsetY
}

Studio.SpriteAnimation.prototype.updateFrame = function() {
	this.myTime += Studio.delta

	this.frame = (((this.myTime - this.startTime) * this._world.speed) / (1000 / this.fps)) | 0

	if (this.frame >= this.loop.length) {
		this.startTime = this.myTime
		this.frame = 0
		if (this.onLoopComplete) {
			this.onLoopComplete.call(this)
		}
	}
	this.setSlice()
}
