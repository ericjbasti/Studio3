Studio.Box = function(left, top, width, height) {
	this.left = left || 0
	this.top = top || 0
	this.right = left + width || 1
	this.bottom = top + height || 1
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
	},
	get_rotated_bounds: function(who) {
		var sin = Math.sin(who.angle)
		var cos = Math.cos(who.angle)
		// this._orbitX = (x * cos) - (y * sin)
		// this._orbitY = (x * sin) + (y * cos)

		this._left = -(who._world.width * who.anchorX)
		this._right = this._left + who._world.width
		this._top = -(who._world.height * who.anchorY)
		this._bottom = this._top + who._world.height

		// this.left = (this._left * cos) - (this._top * sin)
		// this.top = (this._left * sin) + (this._top * cos)
		// this.right = (this._right * cos) - (this._bottom * sin)
		// this.bottom = (this._right * sin) + (this._bottom * cos)
		this.left = ((this._left * cos) - (this._top * sin)) + who._dx
		this.right = ((this._right * cos) - (this._bottom * sin)) + who._dx
		this.top = ((this._left * sin) + (this._top * cos)) + who._dy
		this.bottom= ((this._right * sin) + (this._bottom * cos)) + who._dy
	},
}
