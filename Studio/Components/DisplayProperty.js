/**
 * DisplayProperty
 */

Studio.DisplayProperty = function() {
	this.x        = 0
	this.y        = 0
	this.z        = 0
	this.height   = 1
	this.width    = 1
	this.scaleX   = 1
	this.scaleY   = 1
	this.rotation = 0
	this.skews 	  = 0
	this.angle 	  = 0
	this.alpha 	  = 1
	this.speed 	  = 1

	return this
}

Studio.DisplayProperty.prototype = {
	constructor: Studio.DisplayProperty,
	apply: Studio.apply
}


/**
 * Vector
 */

Studio.Vector = function(x,y) {
	this.x = x || 0
	this.y = y || 0

	return this
}

Studio.Vector.prototype = {
	constructor: Studio.Vector,
	length: function(){
		return Math.sqrt((this.x * this.x) + (this.y * this.y))
	},
	normalize: function(){
		var length = this.length();
		
		if(length === 0) return this

		this.x /= length
		this.y /= length

		return this
	},
	multiply: function(b){
		this.x *= b.x
		this.y *= b.y

		return this
	},
	scale: function(b){
		this.x *= b
		this.y *= b

		return this
	},
	divide: function(b){
		this.x /= b.x
		this.y /= b.y

		return this
	},
	add: function(b){
		this.x += b.x
		this.y += b.y

		return this
	},
	subtract: function(b){
		this.x -= b.x
		this.y -= b.y

		return this
	},
	duplicate: function(b){
		if(b){
			this.x = b.x
			this.y = b.y
			return this
		}
		return new Studio.Vector(this.x, this.y)
	},
	round: function(){
		this.x = Math.round(this.x)
		this.y = Math.round(this.y)
	}
}