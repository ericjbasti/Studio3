/**
* Camera
* This sets what parts we should see, and how we should see them.
*/

Studio.Camera = function(stage) {
	this.stage 		= {width: stage.width, height: stage.height}
	this.tracking 	= null

	this.bound 		= null
	this.active		= true
}

Studio.extend(Studio.Camera,Studio.DisplayObject)

Studio.Camera.prototype.updateRect = function() {
	this.left	= -this.bound._world.x * this.scaleX
	this.top	= -this.bound._world.y * this.scaleY
	this.right	= this.left + (this.bound._world.width * this.scaleX - this.stage.width)
	this.bottom	= this.top + (this.bound._world.height * this.scaleY - this.stage.height)
}

Studio.Camera.prototype.update = function(stage, ratio) {
	if (this.tracking) { // are we following a DisplayObject?
		this.tracking._delta(ratio)
		this.x = (this.tracking._dx * this.scaleX) - this.stage.width / 2
		this.y = (this.tracking._dy * this.scaleY) - this.stage.height / 2
		// this.angle = this.tracking.angle || 0 ;
	}
	if (this.bound) { // are we bound to a DisplayObject? this can be the main stage if you want.
		this.updateRect()
		if (this.x < this.left) { // checking the bounds of the X coord.
			this.x = this.left
		} else if (this.x > this.right) {
			this.x = this.right
		}
		if (this.y <  this.top) { // checking the bounds of the Y coord.
			this.y = this.top
		} else if (this.y > this.bottom) {
			this.y = this.bottom
		}
	}
}

Studio.Camera.prototype.render = function(stage, ratio) {
	this.update(stage,ratio)
	if (this.x || this.y || this.scaleX !== 1 || this.scaleY !== 1) {
		stage.ctx.setTransform(stage.resolution * this.scaleX, 0, 0, stage.resolution * this.scaleY, -this.x * stage.resolution, -this.y * stage.resolution)
	}
}

Studio.Camera.prototype.track = function(who) {
	this.tracking = who
}

Studio.Camera.prototype.bindTo = function(who) {
	this.bound = who
}

Studio.Camera.prototype.unBind = function() {
	this.bindTo(null)
}

Studio.Camera.prototype.stopTracking = function() {
	this.track(null)
}
