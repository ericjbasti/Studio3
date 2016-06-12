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
	var size = size || 9000
	this.data = new Float32Array(size * 36)
	this.count = 0
	this.texture = image || null;
}
Studio.BufferGL.prototype.constructor = Studio.BufferGL

Studio.BufferGL.prototype.draw = function(gl, c){
	if(!this.count){
		return;
	}
	if(!this._texture && this.texture){
		this.setTexture(gl, 1)
	}
	if(this._texture){
		gl.bindTexture(gl.TEXTURE_2D, this._texture)
	}
	//gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.data);
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
	if(this.texture)
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.texture.image)
	if (mipmap) {
		gl.generateMipmap(gl.TEXTURE_2D)
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

	// buffer.data[buffer.count++] = x
	// buffer.data[buffer.count++] = y
	// buffer.data[buffer.count++] = z
	this.addXYZ(buffer,point)
	this.addRGBA(buffer,this.color)
	this.addTX(buffer,tx,ty)

	// buffer.data[buffer.count++] = this.color.r
	// buffer.data[buffer.count++] = this.color.g
	// buffer.data[buffer.count++] = this.color.b
	// buffer.data[buffer.count++] = this.color.a*this._world.alpha



	// this.addTX(this.image.sliceGL[this.slice]);

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

Studio.Rect.prototype.verts = function(box){
	var buffer = stage.buffers[this.image.path];
	var text = this.image.sliceGL[this.slice];
	// this.addVert(stage.buffers[this.image.path], box.TL.x, box.TL.y, stage.draws*-.00001, this.image.sliceGL[this.slice].x, this.image.sliceGL[this.slice].y)
	// this.addVert(stage.buffers[this.image.path], box.TR.x, box.TR.y, stage.draws*-.00001, this.image.sliceGL[this.slice].width, this.image.sliceGL[this.slice].y)
	// this.addVert(stage.buffers[this.image.path], box.BL.x, box.BL.y, stage.draws*-.00001, this.image.sliceGL[this.slice].x, this.image.sliceGL[this.slice].height)
	// this.addVert(stage.buffers[this.image.path], box.BR.x, box.BR.y, stage.draws*-.00001, this.image.sliceGL[this.slice].width, this.image.sliceGL[this.slice].height)
	this.addVert(buffer,box.TL,text.x,text.y)
	this.addVert(buffer,box.TR,text.width,text.y)
	this.addVert(buffer,box.BL,text.x,text.height)
	this.addVert(buffer,box.BR,text.width,text.height)
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
