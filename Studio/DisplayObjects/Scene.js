/**
 * Scene
 */

Studio.Scene = function(attr) {
	this.color = new Studio.Color(0,0,0,0)
	this.active = false
	this.image = null
	this.loader = null
	this.assets = []
	this.children = []
	this.buttons = []
	this.tweens = Object.create(null)
	this.tween_length = 0
	this.trails = true
	this.anchorX = 0
	this.anchorY = 0
	if (attr) {
		this.apply(attr)
	}
	if (this.build) {
		this.build.call(this,this)
	}
	if (this.init) {
		this.init.call(this,this)
	}
}

Studio.inherit(Studio.Scene, Studio.Rect)

Studio.Scene.prototype.loadAssets = function() {
	for (var i = 0; i !== arguments.length; i++) {
		this.assets.push(new Studio.Image(arguments[i]))
	}
}

Studio.Scene.prototype.addButton = function(who) {
	this.buttons.unshift(who)
}

Studio.Scene.prototype.render_children = function(stage, lag) {
	for (this.i = 0; this.i < this._hasChildren; this.i++) {
		if (this.children[this.i].active) {
			this.children[this.i].render(stage, lag, stage.interpolate)
		}
	}
}

Studio.Scene.prototype.close = function(stage) {
	this.active = false
}
Studio.Scene.prototype.setStyle = function(ctx) {
	if (this.color !== ctx.fillStyle) {
		ctx.fillStyle = this.color.style
	}
}

Studio.Scene.prototype.draw = function(ctx) {
	this.setAlpha(ctx)
	// return;
	if (this.image) {
		ctx.drawImage(this.image.image, this._dx, this._dy, this.width, this.height)
		return
	}
	if (this.color) {
		if (this.color.a === 0) {
			ctx.clearRect(this._dx, this._dy, this.width, this.height)
			return
		}
		if (this.color.a < 1 && !this.trails) {
			ctx.clearRect(this._dx, this._dy, this.width, this.height)
		}
		this.setStyle(ctx)
		ctx.fillRect(this._dx, this._dy,  this.width, this.height)
		return
	}
}
