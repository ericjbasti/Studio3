Studio.Point = function(x,y){
	this.x = x || 0
	this.y = y || 0
	this.temp = 0
	return this
}

Studio.Point.prototype = {
	constructor: Studio.Point,
	translate : function(x,y){
		this.x += x
		this.y += y
	},
	scale : function(x,y){
		this.x *= x
		this.y *= y
	},
	rotate : function(sin,cos){
		this.temp = (this.x * cos) - (this.y * sin)
		this.y = (this.x * sin) + (this.y * cos)
		this.x = this.temp;
	},
	set : function(x,y){
		this.x = x
		this.y = y
	}
}

Studio.Box = function(left, top, width, height) {
	this.TL = new Studio.Point(left, top)
	this.TR = new Studio.Point(left + width, top)
	this.BR = new Studio.Point(left, top + height)
	this.BL = new Studio.Point(left + width, top + height)

	this.left = 0
	this.right = 0
	this.top = 0
	this.bottom = 0
	this.sin = 0
	this.cos = 0
	return this
}

Studio.Box.prototype = {
	constructor: Studio.Box,
	set: function(left, top, width, height) {
		this.TL.set(left, top)
		this.TR.set(left + width, top)
		this.BL.set(left, top + height)
		this.BR.set(left + width, top)
	},
	get_bounds: function(who) {
		if (who._world.rotation) {
			if(who.skews){
				this.get_rotated_bounds_w_skew(who)
			}else{
				this.get_rotated_bounds(who)
			}
		} else {
			this.get_straight_bounds(who)
		}
	},
	get_straight_bounds: function(who) {
		this.TL.set(who._dx - who._world.width * who.anchorX, who._dy - who._world.height * who.anchorY)
		this.TR.set(this.TL.x + who._world.width, this.TL.y)
		this.BR.set(this.TR.x, this.TR.y + who._world.height)
		this.BL.set(this.TL.x, this.BR.y)

	},
	_shift : function(x,y){
		this.TL.translate(x,y)
		this.TR.translate(x,y)
		this.BR.translate(x,y)
		this.BL.translate(x,y)
	},
	_scale : function(x,y){
		this.TL.scale(x,y)
		this.TR.scale(x,y)
		this.BR.scale(x,y)
		this.BL.scale(x,y)
	},
	_set_orbit_xy : function(sin,cos){
		this.TL.x = ((this.left * cos) - (this.top * sin))
		this.TL.y = ((this.left * sin) + (this.top * cos))
		this.TR.x = ((this.right * cos) - (this.top * sin))
		this.TR.y = ((this.right * sin) + (this.top * cos))
		this.BR.x = ((this.right * cos) - (this.bottom * sin))
		this.BR.y = ((this.right * sin) + (this.bottom * cos))
		this.BL.x = ((this.left * cos) - (this.bottom * sin))
		this.BL.y = ((this.left * sin) + (this.bottom * cos))
	},
	_set_bounds : function( a, b , width, height){
		this.left 	= -a
		this.right 	= this.left + width
		this.top 	= -b
		this.bottom = this.top + height
	},
	get_rotated_bounds_w_skew: function(who) {
		this.sin = Math.sin(who._dAngle)
		this.cos = Math.cos(who._dAngle)

		this._set_bounds(who.width * who.anchorX, who.height * who.anchorY, who.width, who.height)
		this._set_orbit_xy(this.sin,this.cos);
		this._scale(who._world.scaleX,who._world.scaleY)
		this._shift(who._dx, who._dy)
	},
	get_rotated_bounds: function(who) {
		this.sin = Math.sin(who._dAngle)
		this.cos = Math.cos(who._dAngle)

		this._set_bounds(who._world.width * who.anchorX, who._world.height * who.anchorY, who._world.width, who._world.height)
		this._set_orbit_xy(this.sin,this.cos);
		this._shift(who._dx, who._dy)
	},
}

Studio.RECT_BOX = new Studio.Box(10,0,0,0);