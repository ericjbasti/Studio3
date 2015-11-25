Studio.Box = function(left, top, width, height) {
	this.left = left || 0;
	this.top = top || 0;
	this.right = left + width || 1;
	this.bottom = top + height || 1;
	return this;
};

Studio.Box.prototype = {
	constructor: Studio.Box,
	set: function(left, top, width, height) {
		this.left = left || this.left;
		this.top = top || this.top;
		this.right = left + width || this.right;
		this.bottom = top + height || this.bottom;
	},
	get_bounds: function(who) {
		// if(who._rotation){
		// this.get_rotated_bounds(who);
		// }else{
		this.get_straight_bounds(who);
		// }
	},
	get_straight_bounds: function(who) {
		this.left = who._dx - who._world.width * who.anchorX;
		this.right = this.left + who._world.width;
		this.top = who._dy - who._world.height * who.anchorY;
		this.bottom = this.top + who._world.height;
	},
	get_rotated_bounds: function(who) {
		this.left = who._world.x - who._world.width * who.anchorX * 2;
		this.right = this.left + who._world.width * 3;
		this.top = who._world.y - who._world.height * who.anchorY * 3;
		this.bottom = this.top + who._world.height * 2;
	},
};