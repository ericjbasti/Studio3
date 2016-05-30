Studio.Box = function(left, top, width, height) {
	this.left = left || 0
	this.top = top || 0
	this.right = left + width || 1
	this.bottom = top + height || 1

	this.TL = {x:left||0, y:top||0}
	this.TR = {x:left+width||0, y:top||0}
	this.BR = {x:left+width||0, y:top+height||0}
	this.BL = {x:left||0, y:top+height||0}
	return this
}

Studio.Box.prototype = {
	constructor: Studio.Box,
	set: function(left, top, width, height) {
		this.left = this._left = left || this.left
		this.top = this._top = top || this.top
		this.right = this._right = left + width || this.right
		this.bottom = this._left = top + height || this.bottom
	},
	get_bounds: function(who) {
		if(who._world.rotation){
			this.get_rotated_bounds(who);
		}else{
			this.get_straight_bounds(who)
		}
	},
	get_straight_bounds: function(who) {
		this.left = who._dx - who._world.width * who.anchorX
		this.right = this.left + who._world.width
		this.top = who._dy - who._world.height * who.anchorY
		this.bottom = this.top + who._world.height

		this.TL = {x:this.left , y:this.top}
		this.TR = {x:this.right, y:this.top}
		this.BR = {x:this.right, y:this.bottom}
		this.BL = {x:this.left , y:this.bottom}
	},
	get_rotated_bounds: function(who) {
		var sin = Math.sin(who.angle)
		var cos = Math.cos(who.angle)

		var a = (who._world.width * who.anchorX)
		var b = (who._world.height * who.anchorY)

		this.left = -a
		this.right = this.left + who._world.width
		this.top = -b
		this.bottom = this.top + who._world.height


		this.TL.x = who._dx + ((this.left * cos) - (this.top * sin)) 
		this.TL.y = who._dy + ((this.left * sin) + (this.top * cos)) 

		this.TR.x = who._dx + ((this.right * cos) - (this.top * sin)) 
		this.TR.y =  who._dy + ((this.right * sin) + (this.top * cos)) 

		this.BR.x = who._dx + ((this.right * cos) - (this.bottom * sin)) 
		this.BR.y =  who._dy + ((this.right * sin) + (this.bottom * cos)) 

		this.BL.x = who._dx + ((this.left * cos) - (this.bottom * sin)) 
		this.BL.y =  who._dy + ((this.left * sin) + (this.bottom * cos)) 

	},
}
