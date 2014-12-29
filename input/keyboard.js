Studio.Stage.prototype.enableKeyboardInput = function(){
	var me=this;
	
	this.keys={};
	
	this.canvas.onkeydown = function(e) {
		e.preventDefault();
		me.keys[e.keyCode] = 1;
	}
	
	this.canvas.onkeyup = function(e)  {
		e.preventDefault();
		me.keys[e.keyCode] = 0;
	}
};