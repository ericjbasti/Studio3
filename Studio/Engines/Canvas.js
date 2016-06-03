Studio.Stage.prototype.CANVAS = {
	type: '2dContext',
	getContext: function() {
		this.ctx = this.canvas.getContext('2d')
	},
	init: function() {
		this.ctx.webkitImageSmoothingEnabled = this.smoothing
		this.ctx.mozImageSmoothingEnabled = this.smoothing
		this.ctx.imageSmoothingEnabled = this.smoothing
	},
	prep: function() {
	},
	// our render function draws everything to the screen then updates them
	// we want to draw everything to the screen as fast as possible. Then we
	// can worry about user input and tweens. This should help prevent certain
	// situation that could cause the frames to drop.
	render: function(lag) {
		this.ctx.setTransform(this.resolution, 0, 0, this.resolution, 0, 0)
		this.draw(this.ctx)
		this.camera.render(this,lag)

		if (this.previousScene) {
			this._renderScene(this.previousScene , lag)
		}
		if (this.activeScene) {
			this._renderScene(this.activeScene , lag)
		}
		if (this._hasChildren) {
			this.render_children(this, lag)
			return
		}
		if(this._watching){
			this._watching.render_children(this,lag)
		}
	},
}

Studio.Stage.prototype._renderScene = function(scene, lag) {
	if (scene.active) {
		scene.render(this , lag, this.interpolate)
	}
}

Studio.Stage.prototype.engine = Studio.Stage.prototype.CANVAS