Studio.Stage.prototype.CANVAS = {

	type : '2dContext',

	getContext : function(a){
		this.ctx = this.canvas.getContext('2d');
	},

	init : function(ctx){

	},

	prep : function(ctx){

	},

	loop : function(delta){
		// this.ctx.setTransform(this.resolution, 0, 0,this.resolution,0,0);
		this.draw(this.ctx);
		if(Studio.progress===2){
			this.step(delta);

			this.fixedStep();
			this.render(this._lag);
			if(this._effects){
				this.runEffects(delta);
			}
			return;

		}else{
			this.drawProgress(this.ctx);
			if(Studio.progress===1){
				if(this.onReady){
					this.onReady(delta);
				}
				Studio.progress = 2; // we set this to 2 so we can fire this event once.
				if(!this.activeScene) {
					return; // lets check to see if we have a scene to draw. otherwise lets just draw the stage.
				}
				if(this.activeScene.onActivate){
					this.activeScene.onActivate();
				}
			}
		}
	},

}

Studio.Stage.prototype.fixedStep = function(){
	while(this._d>=this.dur){
		this._d -= this.dur;
		this.update(); // update by a fixed amount.
	}
}

Studio.Stage.prototype.step = function(delta){
	this._d += delta;
	this._lag = this._d/this.dur;
}


Studio.Stage.prototype._d = 0.01;
Studio.Stage.prototype._lag = 0;
Studio.Stage.prototype.dur = 1000/60;

Studio.Stage.prototype.engine = Studio.Stage.prototype.CANVAS;