

Studio.DOMElement = function(id, stage) {
	this.element = document.getElementById(id)
	this.id = id
	var style = this.element.style
	style.position = 'absolute'
	this.width = this._width = 0
	this.height = this._height = 0
	style.top = this.y = parseFloat(style.top) || 0
	style.top = this.x = parseFloat(style.left) || 0
	style.transformOrigin = '0 0 0'
	this.alpha = style.opacity || 1
	this.stage = stage
}

Studio.inherit(Studio.DOMElement, Studio.DisplayObject)

Studio.DOMElement.prototype.hide = function() {
	this.element.style.display = 'none'
}
Studio.DOMElement.prototype.show = function() {
	this.element.style.display = 'block'
}
Studio.DOMElement.prototype.draw = Studio.DOMElement.prototype.vertex_children = function() {
	if (!this.active) return
	if (this.__alpha) this.element.style.opacity = this.alpha
	if (this.__x) {
		this.element.style.left = '0'
		this.element.style.transform = 'translate(' + (((this.__x-this.stage.camera.x) * this.stage.camera.scaleX)+this.stage.camera.focus.x) + 'px, ' + (((this.__y-this.stage.camera.y) * this.stage.camera.scaleY)+this.stage.camera.focus.y) + 'px) rotate('+ this._world.rotation+'deg) scale(' + this.scaleX*this.stage.camera.scaleX + ')'
	}
	if (this.__z) this.element.style.z_index = this.__z
}
