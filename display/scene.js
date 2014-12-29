/**
 * Scene
 */

Studio.Scene = function(attr){
	this.color = null;
	this.active = false;
	this.image = null;
	this.loader = null;
	this.assets = [];
	this.children = [];
	if (attr){
		this.apply(attr); 
	}
	if(this.build){
		this.build();
	}
	if(this.init){
		this.init();
	}
};

Studio.Scene.prototype = new Studio.DisplayObject();
Studio.Scene.prototype.constructor = Studio.Scene;


Studio.Scene.prototype.loadAssets = function(){
	for (var i=0; i!==arguments.length; i++){
		this.assets.push(new Studio.Image(arguments[i]));
	}
};

Studio.Scene.prototype.setStyle = function(ctx){
	if(this.color!==ctx.fillStyle){
		ctx.fillStyle = this.color.style;
	}
};

Studio.Scene.prototype.draw = function(ctx){
	this.setAlpha(ctx);
	if (this.image){
		ctx.drawImage(this.image.image,this._x,this._y,this.width, this.height);
		return;
	}
	if(this.color){
		if(this.color.a === 0){
			ctx.clearRect(0,0,this.width, this.height);
			return;
		}
		this.setStyle(ctx);
		ctx.fillRect(0,0,this.width,this.height);
		return;
	}
};
