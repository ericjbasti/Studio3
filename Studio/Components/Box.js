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
			this.get_rotated_bounds(who)
		} else {
			this.get_straight_bounds(who)
		}
	},
	get_straight_bounds: function(who) {
		this.a = who._dx
		this.b = who._dy
		this.TL = {
			x: this.a - who._world.width * who.anchorX,
			y: this.b - who._world.width * who.anchorY
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
	get_rotated_bounds: function(who) {
		var sin = Math.sin(who._dAngle)
		var cos = Math.cos(who._dAngle)

		var a = (who._world.width * who.anchorX)
		var b = (who._world.height * who.anchorY)

		this.left 	= -a
		this.right 	= this.left + who._world.width
		this.top 	= -b
		this.bottom = this.top + who._world.height

		this.TL.x = who._dx + ((this.left * cos) - (this.top * sin))
		this.TL.y = who._dy + ((this.left * sin) + (this.top * cos))

		this.TR.x = who._dx + ((this.right * cos) - (this.top * sin))
		this.TR.y = who._dy + ((this.right * sin) + (this.top * cos))

		this.BR.x = who._dx + ((this.right * cos) - (this.bottom * sin))
		this.BR.y = who._dy + ((this.right * sin) + (this.bottom * cos))

		this.BL.x = who._dx + ((this.left * cos) - (this.bottom * sin))
		this.BL.y = who._dy + ((this.left * sin) + (this.bottom * cos))

	},
}

Studio.RECT_BOX = new Studio.Box(10,0,0,0);