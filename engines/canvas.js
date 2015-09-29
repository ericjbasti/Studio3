Studio.Stage.prototype.CANVAS = {

	type: '2dContext',

	getContext: function(a) {
		this.ctx = this.canvas.getContext('2d');
	},
	init: function(ctx) {
	},
	prep: function(ctx) {
	},
	// our render function draws everything to the screen then updates them
	// we want to draw everything to the screen as fast as possible. Then we
	// can worry about user input and tweens. This should help prevent certain
	// situation that could cause the frames to drop.
	render: function(lag) {
		this.camera.render(this);
		if (this.hasChildren) {
			this.render_children(lag);
		}
		if (this.activeScene) {
			if (this.activeScene.beforeDraw) {
				this.activeScene.beforeDraw();
			}
			this.activeScene.render(this , lag);
		}
		if (this.previousScene) {
			if (this.previousScene.active) {
				this.previousScene.render(this , lag);
			}
		}
	},

}

Studio.fixedTimeStep = function(delta) {
	this.step(delta);
	this.render(this._lag);
	this.fixedStep();
	this.camera.update(this);

}

Studio.simple = function(delta) {
	this.render(1);
	this.update();
	this.camera.update(this);
}

Studio.Stage.prototype.timeStep = Studio.fixedTimeStep;

Studio.Stage.prototype.fixedStep = function() {
	while (this._d >= this.dur) {
		this._d -= this.dur;
		this.update(); // update by a fixed amount.
	}
}

Studio.Stage.prototype.step = function(delta) {
	this._d += delta;
	this._lag = this._d / this.dur;
}

Studio.Stage.prototype.engine = Studio.Stage.prototype.CANVAS;
