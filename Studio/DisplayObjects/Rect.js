/**
 * Rect
 */

Studio.Rect = function(attr) {
	this.color = new Studio.Color(255, 255, 255, 1)
	// this.subBuffer = new Float32Array(8)
	this.dirty = 0;
	if (attr) {
		this.apply(attr)
	}
}

Studio.inherit(Studio.Rect, Studio.DisplayObject)


Studio.BufferGL = function(image,size){
	this.size = size || 640
	this.data = new Float32Array(this.size * 36)
	this.count = 0
	this.texture = image || null;
}
Studio.BufferGL.prototype.constructor = Studio.BufferGL

Studio.BufferGL.prototype.draw = function(gl){
	if(!this.count){
		return;
	}
	if(!this._texture && this.texture){
		this.setTexture(gl, 1)
	}
	if(this.texture){
		gl.bindTexture(gl.TEXTURE_2D, this._texture)
	}
	// gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.data);
	gl.bufferData(gl.ARRAY_BUFFER, this.data, gl.DYNAMIC_DRAW)
	gl.drawElements(gl.TRIANGLES, this.count/6, gl.UNSIGNED_SHORT, 0)
	this.count = 0
}

Studio.BufferGL.prototype.prepTexture = function GL_prepTexture(gl) {
	this._texture = gl.createTexture()
	gl.bindTexture(gl.TEXTURE_2D, this._texture)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)


	this.buffer = gl.createBuffer()
	gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
	gl.vertexAttribPointer(gl.positionLocation, 3, gl.FLOAT, gl.FALSE, 36, 0)
	gl.vertexAttribPointer(gl.colorLocation, 4, gl.FLOAT, gl.FALSE, 36, (3)*4)
	gl.vertexAttribPointer(gl.textureLocation, 2, gl.FLOAT, gl.FALSE, 36, (3+4)*4)
	gl.bufferData(gl.ARRAY_BUFFER, this.data, gl.DYNAMIC_DRAW)
}

Studio.BufferGL.prototype.setTexture = function GL_setTexture(gl, mipmap) {
	if (!this._texture) {
		this.prepTexture(gl)
	}
	if(this.texture){
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.texture.bitmap)
		// if (mipmap) {
		// 	gl.generateMipmap(gl.TEXTURE_2D)
		// }
	}
}

Studio.Rect.prototype.addXYZ = function(buffer,point){
	buffer.data[buffer.count++] = point.x
	buffer.data[buffer.count++] = point.y
	buffer.data[buffer.count++] = stage.draws*-.00001
}

Studio.Rect.prototype.addRGBA = function(buffer,color){
	buffer.data[buffer.count++] = color.r
	buffer.data[buffer.count++] = color.g
	buffer.data[buffer.count++] = color.b
	buffer.data[buffer.count++] = color.a*this._world.alpha
}
Studio.Rect.prototype.addTX = function(buffer,x,y){
	buffer.data[buffer.count++] = x
	buffer.data[buffer.count++] = y
}

Studio.Rect.prototype.addVert = function(buffer, point, tx,ty) {
	this.addXYZ(buffer,point)
	this.addRGBA(buffer,this.color)
	this.addTX(buffer,tx,ty)
}

Studio.Rect.prototype.verts = function(box){
	var buffer = stage.rect_buffer;
	this.addVert(buffer,box.TL,10,0)
	this.addVert(buffer,box.TR,10,0)
	this.addVert(buffer,box.BL,10,0)
	this.addVert(buffer,box.BR,10,10)
}


Studio.Rect.prototype.buildElement = function(stage, ratio, interpolate) {
	stage.draws++
	if (interpolate) {
		this._delta(ratio)
	} else {
		this._dset()
	}
	this._boundingBox.get_bounds(this)
	
	this.verts(this._boundingBox)
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
