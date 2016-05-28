Studio.Color = function(r, g, b, a) {
	this.r = r / 255 || 0
	this.g = g / 255 || 0
	this.b = b / 255 || 0
	this.a = a || 1
	this.style = 'rgba(255,255,255,1)'

	this._build_style()
	return this
}

Studio.Color.prototype = {
	constructor: Studio.Color,
	set: function(r, g, b, a) {
		this.r = r / 255
		this.g = g / 255
		this.b = b / 255
		this.a = a
		this._build_style()
		return this
	},
	red: function(v) {
		this.r = v
		return this
	},
	green: function(v) {
		this.g = v
		return this
	},
	blue: function(v) {
		this.b = v
		return this
	},
	alpha: function(v) {
		this.a = v
		return this
	},
	build: function() {
		this._build_style()
		return this
	},
	setFromHex: function(hex) {
		if (!hex) return
		// if the hex value comes in as shorthand '#333', we should double the values.
		if (hex.length === 4) {
			hex = hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3] + 'ff'
		}
		// if the hex doesn't contain an alpha value lets assume its 'ff'.
		if (hex.length === 7) {
			hex += 'ff'
		}
		// take each value besides [0] an convert it to RGBA since that works for both Canvas and WebGL
		this.set('0x' + hex[1] + hex[2] | 0, '0x' + hex[3] + hex[4] | 0, '0x' + hex[5] + hex[6] | 0, ('0x' + hex[7] + hex[8] | 0) / 255)
		return this
	},
	_build_style: function() {
		this.style = 'rgba(' + parseInt(this.r * 255) + ',' + parseInt(this.g * 255) + ',' + parseInt(this.b * 255) + ',' + this.a + ')'
	}
}

Studio.RED = new Studio.Color(204, 0, 17, 1)
Studio.YELLOW = new Studio.Color(255, 221, 34, 1)
Studio.BLUE = new Studio.Color(51, 170, 255, 1)
Studio.WHITE = new Studio.Color(255, 255, 255, 1)