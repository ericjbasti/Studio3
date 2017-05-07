Studio.Box = function(left, top, width, height) {
	this.TL = {x: left || 0, y: top || 0}
	this.TR = {x: left + width || 0, y: top || 0}
	this.BR = {x: left + width || 0, y: top + height || 0}
	this.BL = {x: left || 0, y: top + height || 0}
	this.a = 0
	this.b = 0
	this.rot = {sin:0,cos:0,a:0,b:0}
	return this
}

Studio.Box.prototype = {
	constructor: Studio.Box,
	set: function(left, top, width, height) {
		this.TL = {x: left, y: top}
		this.TR = {x: left + width, y: top}
		this.BR = {x: left + width, y: top + height}
		this.BL = {x: left, y: top + height}
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
		this.a = who._dx
		this.b = who._dy
		this.TL = {
			x: this.a - who._world.width * who.anchorX,
			y: this.b - who._world.height * who.anchorY
		}
		this.TR = {
			x: this.TL.x + who._world.width,
			y: this.TL.y
		}
		this.BR = {
			x: this.TR.x,
			y: this.TR.y + who._world.height
		}
		this.BL = {
			x: this.TL.x,
			y: this.BR.y
		}
	},
	_shift : function(x,y){
		this.TL.x += x
		this.TL.y += y
		this.TR.x += x
		this.TR.y += y
		this.BR.x += x
		this.BR.y += y
		this.BL.x += x
		this.BL.y += y
	},
	_scale : function(x,y){
		this.TL.x *= x
		this.TL.y *= y
		this.TR.x *= x
		this.TR.y *= y
		this.BR.x *= x
		this.BR.y *= y
		this.BL.x *= x
		this.BL.y *= y
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
		var sin = Math.sin(who._dAngle)
		var cos = Math.cos(who._dAngle)

		this._set_bounds(who.width * who.anchorX, who.height * who.anchorY, who.width, who.height)
		this._set_orbit_xy(sin,cos);
		this._scale(who._world.scaleX,who._world.scaleY)
		this._shift(who._dx, who._dy)
	},
	get_rotated_bounds: function(who) {
		var sin = Math.sin(who._dAngle)
		var cos = Math.cos(who._dAngle)

		this._set_bounds(who._world.width * who.anchorX, who._world.height * who.anchorY, who._world.width, who._world.height)
		this._set_orbit_xy(sin,cos);
		this._shift(who._dx, who._dy)
	},
}

Studio.RECT_BOX = new Studio.Box(10,0,0,0);