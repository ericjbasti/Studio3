Studio.Stage.prototype.enableKeyboardInput = function() {
	var me = this;

	this.keys = {};

	var keydown = function(e) {
		e.preventDefault();
		me.keys[e.keyCode] = 1;
	};

	var keyup = function(e)  {
		e.preventDefault();
		me.keys[e.keyCode] = 0;
	};

	document.addEventListener('keydown', keydown, false);
	document.addEventListener('keyup', keyup, false);
};

