Studio.TextBox = function(width, height, stage) {
	this.font = '12px Arial'
	this.lineHeight = 10
	this.height = height
	this.width = width
	this.shadow = 1
	this.shadowColor = 'rgba(255,0,0,0.5)'
	this.cache = new Studio.Cache(width,height, stage.resolution)

	this.cache.ctx.textBaseline = 'top'
	this.cache.ctx.font = this.font

	this.text = ''
	this.color = new Studio.Color(255,255,255,1)
	this.fontColor = '#fff'
	this._wrap_height = this.lineHeight
	this.horizontal_align = Studio.LEFT
	this.vertical_align = Studio.TOP
	this._vertical_align = 0


	return this
}

Studio.inherit(Studio.TextBox, Studio.Sprite)

Studio.TextBox.prototype.setFont = function(font) {
	this.font = font
	return this
}

Studio.TextBox.prototype.setText = function(text) {
	this.text = text
	return this
}

Studio.TextBox.prototype.setColor = function(color) {
	this.fontColor = color
	return this
}

Studio.TextBox.prototype.setFont = function(font) {
	this.cache.ctx.font = this.font = font
	return this
}

Studio.TextBox.prototype.finish = function() {
	this.reset()
	this.wrapText()
}

Studio.TextBox.prototype.reset = function() {
	this.cache.ctx.clearRect(0, 0, this.width, this.height)
	this.cache.ctx.font = this.font
}

Studio.TextBox.prototype.writeLine = function(text, x, y) {
	if (this.shadow) {
		this.cache.ctx.fillStyle = this.shadowColor
		this.cache.ctx.fillText(text, x + 1 + this.shadow, y + this.shadow)
	}
	this.cache.ctx.fillStyle = this.fontColor
	this.cache.ctx.fillText(text, x + 1, y)
}

Studio.TextBox.prototype.wrapText = function() {
	var paragraphs = this.text.split('\n')
	var y = 0
	for (var i = 0; i !== paragraphs.length; i++) {
		var words = paragraphs[i].split(' ')
		var line = ''
		for (var n = 0; n < words.length; n++) {
			var testLine = line + words[n] + ' '
			var metrics = this.cache.ctx.measureText(testLine)
			var testWidth = metrics.width
			if (testWidth > this.width && n > 0) {
				testWidth = this.cache.ctx.measureText(line).width
				// We want to avoid any off pixel font rendering so we use | 0 to prevent floats
				// also offset everything by 2px because it helps with the centering of text
				this.writeLine(line, 2 + (this.width - testWidth) * this.horizontal_align | 0 , y)
				line = words[n] + ' '
				y += this.lineHeight
			} else {
				line = testLine
			}
		}
		this.writeLine(line, 2 + (this.width - this.cache.ctx.measureText(line).width) * this.horizontal_align | 0, y)
		this._wrap_height = y + this.lineHeight
		if (i !== paragraphs.length - 1) {
			y += this.lineHeight
		}
	}
	// this._wrap_height += (this.shadow * 2) + 1;
	if (this._wrap_height > this.height) {
		this._wrap_height = this.height
	}
	this._vertical_align = (this._wrap_height * this.vertical_align - this.height * this.vertical_align) | 0
}

Studio.TextBox.prototype.fit = function() {
	this.cache.height = this._wrap_height
	this.wrapText()
}

Studio.TextBox.prototype.debugDraw = function(ctx) {
	ctx.strokeRect(this._dx - (this._world.width * this.anchorX), this._dy - (this._world.height * this.anchorY) - this._vertical_align, this._world.width, this._wrap_height)
}

Studio.TextBox.prototype.drawAngled = function(ctx) {
	ctx.save()
	this.prepAngled(ctx)
	ctx.drawImage(this.cache.image, 0, 0, this.cache.image.width, this.cache.image.height, -(this.width * this.anchorX), -(this.height * this.anchorY) - this._vertical_align, this.width, this.height)
	ctx.restore()
}

Studio.TextBox.prototype.draw = function(ctx) {
	this.setAlpha(ctx)
	// since we don't resize the ctx, we need to compensate based on the differences of the ctx height and text height
	if (this.angle) {
		this.drawAngled(ctx)
	} else {
		ctx.drawImage(this.cache.image, 0, 0, this.cache.image.width, this.cache.image.height, this._dx - (this._dwidth * this.anchorX), this._dy - (this._dheight * this.anchorY) - this._vertical_align, this._dwidth, this._dheight)
	}
}

Studio.TextBox.prototype.verts = function(box, buffer){
	this.addVert(buffer,box.TL,0,0)
	this.addVert(buffer,box.TR,1,0)
	this.addVert(buffer,box.BL,0,1)
	this.addVert(buffer,box.BR,1,1)
}


Studio.TextBox.prototype.buildElement = function(stage, ratio, interpolate) {
	if(!stage.buffers[this.cache.path]){
		stage.buffers[this.cache.path] = new Studio.BufferGL(this.cache,0,stage.ctx);
	}
	stage.draws++

	if (interpolate) {
		this._delta(ratio)
	} else {
		this._dset()
	}
	this._boundingBox.get_bounds(this)
	
	this.verts(this._boundingBox, stage.buffers[this.cache.path])
}
