// (function(){
// 	// lets setup Studio to create our needed data
// 	Studio.draws = 0;
	



// 	var Stats = document.createElement('canvas');
// 		Stats.id = 'stats';
// 		Stats.width = window.innerWidth;
// 		Stats.height = 100;
// 		Stats.style.background="#000"
// 		document.body.appendChild(Stats);
// 	var stats = new Studio.Stage("stats");
// 		stats.color = 'rgba(0,0,0,0)';

// 	var step = 0;
// 	var heap = 0;
// 	var half = stats.height/2

// 	var displayFPS = function(stage) {
// 			stage.ctx.fillStyle = 'rgb('+(Studio.frameRatio*50>>0)*2+',0,0)';
// 			stage.ctx.fillRect(step,half,2,-(Studio.frameRatio*10));
// 			step++;
// 			if(step>stage.width) {
// 				step=0;
// 				stage.ctx.fillStyle = 'rgba(0,0,0,.3)';
// 				stage.ctx.fillRect(0,0,stage.width,stage.height);
// 			}
// 		}

// 	// if(window.performance){
// 	// 	if(window.performance.memory){
// 	// 		var displayMemory = function(stage) {
// 	// 			stage.ctx.fillStyle = 'rgb(0,'+(Studio.frameRatio*50>>0)*2+',0)';
// 	// 			heap = window.performance.memory.usedJSHeapSize/window.performance.memory.jsHeapSizeLimit;
// 	// 			stage.ctx.fillRect(step,half,2,heap*3000);
// 	// 		}
// 	// 		stats.addEffect(displayMemory);
// 	// 	}
// 	// }
// 	var displayDraws = function(stage) {
// 		stage.ctx.fillStyle = '#000';
// 		stage.ctx.fillRect(0,0,stage.width,14);
// 		stage.ctx.fillStyle = 'rgb(255,255,255)';
// 		Studio.stage.ctx.fillText(((60/Studio.frameRatio)|0) +' fps / '+ Studio.draws +' draw', 2, 12);
// 		stage.ctx.fillStyle = 'rgb(20,100,100)';
// 		stage.ctx.fillRect(step,half,2,Studio.draws);
// 	}
// 	stats.addEffect(displayDraws);
		
// 	stats.addEffect(displayFPS);
// 	stats.ready=true;
// })();



var STATS = new Studio.Plugin({
	options: {
		external : true,
		height: 100,
		width: 320,
		show_text : true,
		clear_mode: 'cover', // modes : cover, erase
		position: 0,
	},
	init: function(a){ // lets build out a canvas for the stats
		this.buffer = document.createElement('canvas');
		this.buffer.id = '_stats_buffer'
		this.buffer.width = this.options.width;
		this.buffer.height = this.options.height;
		this.half = this.buffer.height/2;
		if(this.options.show_text){
			this.half= this.buffer.height
		}
		// this.buffer.style.background="#000";

		this.buffer.ctx = this.buffer.getContext('2d');
		if(this.options.external){
			document.body.appendChild(this.buffer);
		}

		if(this.options.clear_mode == 'cover'){
			this.buffer.ctx.fillStyle = 'rgba(0,0,0,.3)';
			this.buffer.ctx.fillRect(0,0,this.buffer.width,this.buffer.height);
		}

		this.step = 0;
		this._time = 0;
		this._tick = 0;
		this._ratio = 0;
		this._spikes = 0;
		// we rewrite these function just so we can track the draw count
		Studio.DisplayObject.prototype.render = function(stage){
			if(this._visible){
				if(stage.snapPixels){
					this.snapPixels();
				}
				Studio.draws ++;
				this.draw(stage.ctx);
				this.render_children(stage);
			}
			if(this.onExitFrame){
				this.onExitFrame();
			}
		}
		Studio.DisplayList.prototype.render = function(e){
			if(this.cached){
				if(this.alpha!==e.ctx.globalAlpha){
					e.ctx.globalAlpha=this.alpha;
				}
				Studio.draws++;
				this.draw(e.ctx);
			}else{
				var listItem = this.first;
				while(listItem){
					this.next = listItem.next;
					listItem.render(e);
					listItem = listItem.next || this.next;
				}
			}
		}
	},
	action: function(a){
		this._time += Studio.delta;
		this._tick++;
		this._ratio += Studio.frameRatio;
		if(Studio.frameRatio>3.1){
			this._spikes++;
		}
		// if(this.options.show_text && this._time>1000){
		// 	this.displayDraws(this.buffer.ctx);
		// 	this._time = 0;
		// 	this._tick = 0;
		// 	this._ratio = 0;
		// }
		this.displayFPS(this.buffer.ctx);

		if(!this.options.external){
			a.ctx.drawImage(this.buffer,0,this.options.position);
		}
	},
	cover : function(ctx){
		ctx.fillStyle = 'rgba(0,0,0,.3)';
		ctx.fillRect(0,12*this.options.show_text,this.buffer.width,this.buffer.height);
	},
	erase : function(ctx){
		ctx.clearRect(0,0,this.buffer.width,this.buffer.height);
	},
	displayFPS : function(ctx){
		if(Studio.frameRatio>3.01){
			ctx.fillStyle = 'rgb(240,0,0)';
			
		}else if(Studio.frameRatio>2.1){
			ctx.fillStyle = 'rgb(240,220,0)';
		}else{
			ctx.fillStyle = 'rgb(20,245,0)';
		}
		
		// ctx.fillRect(this.step,this.half,2,-(Studio.frameRatio*5));
		this.step++;
		if(this.step>this.buffer.width) {
			this.step=0;
			this[this.options.clear_mode](ctx);
		}
	},
	displayDraws : function(ctx) {
		ctx.fillStyle = 'rgba(0,0,0,.8)';
		ctx.fillRect(0,0,this.buffer.width,12);
		ctx.fillStyle = 'rgb(255,255,255)';
		ctx.fillText((60/(this._ratio/this._tick)|0) +' fps / '+ Studio.draws +' draw / '+this._spikes +' spikes', 2, 10);
	}

})



