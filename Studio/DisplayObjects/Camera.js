/**
* Camera
* This sets what parts we should see, and how we should see them.
*/

Studio.Camera = function(stage) {
	this.stage 		= {width: stage.width, height: stage.height}
	this.tracking 	= null
	this.focus		= {x:0,y:0}
	this.bound 		= null
	this.active		= true

	this.matrix 	= 	new Float32Array([1,0,0,
						 0,1,0,
						 0,0,1]);
}

Studio.inherit(Studio.Camera, Studio.DisplayObject)

Studio.Camera.prototype.updateRect = function() {
	this.left	= -this.bound._world.x * this.scaleX
	this.top	= -this.bound._world.y * this.scaleY
	this.right	= this.left + (this.bound._world.width * this.scaleX - this.stage.width)
	this.bottom	= this.top + (this.bound._world.height * this.scaleY - this.stage.height)
}

Studio.Camera.prototype.update = function(stage, ratio, webgl) {
	if (this.tracking) { // are we following a DisplayObject?
		if(!webgl) this.tracking._delta(ratio)
		this.x = (this.tracking._dx)
		this.y = (this.tracking._dy)
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

Studio.Camera.prototype.render = function(stage, ratio, webgl) {
	this.update(stage,ratio, webgl)
	if (this.x || this.y || this.scaleX !== this.matrix[0] || this.scaleY !== this.matrix[4]) { // we only need to update this if its different
		this.matrix[0] = this.scaleX;
		this.matrix[4] = this.scaleY;
		this.matrix[6] = this.focus.x-(this.x * this.scaleX);
		this.matrix[7] = this.focus.y-(this.y * this.scaleY);
		if(!webgl){
			stage.ctx.setTransform(this.matrix[0]*stage.resolution, 0, 0, this.matrix[4]*stage.resolution, this.matrix[6]*stage.resolution, this.matrix[7]*stage.resolution)
		}
	}
	if(webgl){ // webgl needs up to send this information.
		stage.ctx.uniformMatrix3fv(stage.ctx.matrixLocation,false,this.matrix);
	}
}

Studio.Camera.prototype.track = function(who) {
	this.tracking = who
	this.focus.x = stage.width/2
	this.focus.y = stage.height/2
}

Studio.Camera.prototype.bindTo = function(who) {
	this.bound = who
}

Studio.Camera.prototype.unBind = function() {
	this.bindTo(null)
}

Studio.Camera.prototype.stopTracking = function() {
	this.track(null)
	this.focus.x = 0
	this.focus.y = 0
	this.matrix[6] = this.focus.x-(this.x * this.scaleX);
	this.matrix[7] = this.focus.y-(this.y * this.scaleY);
}
