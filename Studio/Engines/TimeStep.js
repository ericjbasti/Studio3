Studio.timeStep = {
	fixed: function(delta) {
		this.fixedStep(delta)
		this.step(delta)
		this._timebased_updates(delta)
		this.render(this._lag)
		if (this.onExitFrame) {
			this.onExitFrame()
		}
	},
	simple: function(delta) {
		this.update(this.interpolate)
		this._timebased_updates(delta)
		this.render(1)
		if (this.onExitFrame) {
			this.onExitFrame()
		}
	},
	static_fixed: function(delta) {
		this.step(delta)
		if (this._d >= this.dur) {
			this._d -= this.dur
			this.update(false)
			this._timebased_updates(delta)
			this.render(1)
		}
		if (this._d < 1) {
			this._d = 1.5
		}
	}
}

Studio.Stage.prototype.timeStep = Studio.timeStep.static_fixed

Studio.Stage.prototype.fixedStep = function() {
	while (this._d >= this.dur) {
		this._d -= this.dur
		this.update(this.interpolate) // update by a fixed amount.
	}
	if (this._d < 1) {
		this._d = 1.5
	}
}

Studio.Stage.prototype.step = function(delta) {
	this._d += delta

	this._lag = this._d / this.dur
	if (this._lag > 1) {
		this._lag = 1
	}
	if (this._lag < 0) {
		this._lag = 0
	}
}