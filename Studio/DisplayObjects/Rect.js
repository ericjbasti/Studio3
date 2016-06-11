/**
 * Rect
 */

Studio.Rect = function(attr) {
	this.color = new Studio.Color(255, 255, 255, 1)
	// this.subBuffer = new Float32Array(8)
	if (attr) {
		this.apply(attr)
	}
}

Studio.inherit(Studio.Rect, Studio.DisplayObject)


Studio.BufferGL = function(image,size){
	var size = size || 16384
	this.data = new Float32Array(size * 36)
	this.count = 0
	this.texture = image || null;
}
Studio.BufferGL.prototype.constructor = Studio.BufferGL

Studio.BufferGL.prototype.draw = function(gl, c){
	if(!this.count){
		return;
	}
	if(!this._texture){
		this.setTexture(gl, 1)
	}
	if(this._texture){
		gl.bindTexture(gl.TEXTURE_2D, this._texture)
	}
	gl.bufferData(gl.ARRAY_BUFFER, this.data, gl.STATIC_DRAW)
	gl.drawElements(gl.TRIANGLES, (this.count/6), gl.UNSIGNED_SHORT, 0)
	this.count = 0
}

Studio.BufferGL.prototype.prepTexture = function GL_prepTexture(gl) {
	this._texture = gl.createTexture()
	gl.bindTexture(gl.TEXTURE_2D, this._texture)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
}

Studio.BufferGL.prototype.setTexture = function GL_setTexture(gl, mipmap) {
	if (!this._texture) {
		this.prepTexture(gl)
	}
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.texture.image)
	if (mipmap) {
		gl.generateMipmap(gl.TEXTURE_2D)
	}
}


Studio.Rect.prototype.addVert = function(buffer, x, y, z, tx, ty) {
	buffer.data[buffer.count++] = x
	buffer.data[buffer.count++] = y
	buffer.data[buffer.count++] = z
	buffer.data[buffer.count++] = this.color.r
	buffer.data[buffer.count++] = this.color.g
	buffer.data[buffer.count++] = this.color.b
	buffer.data[buffer.count++] = this.color.a*this._world.alpha
	buffer.data[buffer.count++] = tx
	buffer.data[buffer.count++] = ty

	// this.subBuffer[0] = x;
	// this.subBuffer[1] = y
	// this.subBuffer[2] = this.color.r
	// this.subBuffer[3] = this.color.g
	// this.subBuffer[4] = this.color.b
	// this.subBuffer[5] = this.color.a
	// this.subBuffer[6] = tx
	// this.subBuffer[7] = ty

	// gl.bufferSubData(gl.ARRAY_BUFFER, (gl._count-8)*4, this.subBuffer)
	// gl._count+=8;
}

Studio.Rect.prototype.buildElement = function(stage, ratio, interpolate) {
	stage.draws++
	if (interpolate) {
		this._delta(ratio)
	} else {
		this._dset()
	}
	this._boundingBox.get_bounds(this)
	this.addVert(stage.rect_buffer, this._boundingBox.TL.x, this._boundingBox.TL.y, stage.draws*-.0000001, 10, 0)
	this.addVert(stage.rect_buffer, this._boundingBox.TR.x, this._boundingBox.TR.y, stage.draws*-.0000001, 10, 0)
	this.addVert(stage.rect_buffer, this._boundingBox.BL.x, this._boundingBox.BL.y, stage.draws*-.0000001, 10, 0)
	this.addVert(stage.rect_buffer, this._boundingBox.BR.x, this._boundingBox.BR.y, stage.draws*-.0000001, 10, 0)
	// this.vertex_children(gl,ratio,interpolate)
}

Studio.Rect.prototype.buildTriangles = function(gl, ratio) {
	this._delta(ratio)
	this._boundingBox.get_bounds(this)
	this.addVert(gl, this._boundingBox.left, this._boundingBox.top, this._world.z, this.bounds.left, this.bounds.top)
	this.addVert(gl, this._boundingBox.right, this._boundingBox.top, this._world.z, this.bounds.right, this.bounds.top)
	this.addVert(gl, this._boundingBox.left, this._boundingBox.bottom, this._world.z, this.bounds.left, this.bounds.bottom)
	this.addVert(gl, this._boundingBox.right, this._boundingBox.top, this._world.z, this.bounds.right, this.bounds.top)
	this.addVert(gl, this._boundingBox.left, this._boundingBox.bottom, this._world.z, this.bounds.left, this.bounds.bottom)
	this.addVert(gl, this._boundingBox.right, this._boundingBox.bottom, this._world.z, this.bounds.right, this.bounds.bottom)
}

Studio.Rect.prototype.setStyle = function(ctx) {
	if (this.color !== ctx.fillStyle) {
		ctx.fillStyle = this.color.style
	}
}

Studio.Rect.prototype.prepAngled = function(ctx) {
	if (this._dx || this._dy) {
		ctx.translate(this._dx, this._dy)
	}
	ctx.rotate(this._dAngle || 0)
	if (this._world.scaleX !== 1 || this._world.scaleY !== 1) {
		ctx.scale(this._world.scaleX, this._world.scaleY)
	}
}

Studio.Rect.prototype.drawAngled = function(ctx) {
	ctx.save()
	this.prepAngled(ctx)
	ctx.fillRect(-(this.width * this.anchorX), -(this.height * this.anchorY), this.width, this.height)
	// ctx.strokeRect(-(this.width * this.anchorX), -(this.height * this.anchorY), this.width, this.height);
	ctx.restore()
}

Studio.Rect.prototype.draw = function(ctx) {
	this.setStyle(ctx)
	this.setAlpha(ctx)
	ctx.strokeStyle = '#fff'
	if (this.angle) {
		this.drawAngled(ctx)
	} else {
		// ctx.strokeRect(this._dx - (this._world.width * this.anchorX), this._dy - (this._world.height * this.anchorY), this._world.width, this._world.height);
		ctx.fillRect(this._dx - (this._dwidth * this.anchorX), this._dy - (this._dheight * this.anchorY), this._dwidth, this._dheight)
	}
}
