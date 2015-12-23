Studio.Stage.prototype.CANVAS = {
	type: '2dContext',
	getContext: function() {
		this.ctx = this.canvas.getContext('2d');
	},
	init: function() {
	},
	prep: function() {
	},
	// our render function draws everything to the screen then updates them
	// we want to draw everything to the screen as fast as possible. Then we
	// can worry about user input and tweens. This should help prevent certain
	// situation that could cause the frames to drop.
	render: function(lag) {
		this.ctx.setTransform(this.resolution, 0, 0, this.resolution, 0, 0);
		this.draw(this.ctx);
		this.camera.render(this,lag);
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
		if (this.hasChildren) {
			this.render_children(lag);
		}
	},
};

Studio.fixedTimeStep = function(delta) {
	this.step(delta);
	this.fixedStep();
	this._timebased_updates(delta);
	this.render(this._lag);
};

Studio.simple = function() {
	this.update();
	this.render(1);
};

Studio.Stage.prototype.timeStep = Studio.fixedTimeStep;

Studio.Stage.prototype.fixedStep = function() {
	while (this._d >= this.dur) {
		this._d -= this.dur;
		this.update(); // update by a fixed amount.
	}
};

Studio.Stage.prototype.step = function(delta) {
	this._d += delta;
	this._lag = this._d / this.dur;
	if (this._lag > 1) {
		this._lag = 1;
	}
};

Studio.Stage.prototype.engine = Studio.Stage.prototype.CANVAS;
