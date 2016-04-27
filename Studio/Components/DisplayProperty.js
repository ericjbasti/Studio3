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
	this.angle 	  = 0
	this.alpha 	  = 1
	this.speed 	  = 1
}

Studio.DisplayProperty.prototype = {
	constructor: Studio.DisplayProperty,
	apply: Studio.apply
}
