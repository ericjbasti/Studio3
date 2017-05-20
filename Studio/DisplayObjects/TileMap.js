Studio.load = function(path, type, callback, who) {

	var request = new XMLHttpRequest()

	request.onload = function studio_load_onload() {
		var data = null
		if ((request.status >= 200 && request.status < 400) || request.status == 0) {
			console.log('%cStudio loaded file : ' + path, Studio.statStyle)

			if (type.toLowerCase() == 'json') {
				data = JSON.parse(request.responseText)
			}
			if (callback) {
				if (who) {
					callback.call(who,data)
				} else {
					callback(data)
				}
			}
		} else {
			this.onerror()
		}
	}

	request.onerror = function() {
		console.log('%cStudio failed to load file : ' + path, Studio.errorStyle)
	}
	request.open('GET', path, true)
	request.send()
}

Studio.TileMap = function(width, height, resolution, attr) {
	this.cache = new Studio.Cache(width, height, resolution)
	this.buffer = new Studio.Cache(width, height, resolution)
	this.offsetX = 0
	this.offsetY = 0
	this.maxWidth = 0
	this.resolution = resolution || 1
	this.repeat =
	this.data = null
	if (attr) {
		this.apply(attr)
	}
}

Studio.TileMap.prototype = {
	apply: Studio.apply,
	constructor: Studio.TileMap,
	build: function(data, set, sx, sy, mx, my) {
		var map = data
		var buffer = this.cache.ctx
		var width = set.tileWidth
		var height = set.tileHeight
		this.maxWidth = Math.floor(this.cache.width / width) / this.resolution
		var sx = sx || 0
		var sy = sy || 0
		var mX = mx || this.maxWidth
		var mY = my || map.height - sy
		if(map.data){
			for (var y = 0; y != mY; y++) {
				for (var x = 0; x != mX; x++) {
					var i = (map.data[parseInt((y + sy) * map.width) + (x + sx)]) - set.firstgid
					if(i> 0x80000000){
						i-=0x80000000;
					}
					if(i>0x40000000){
						i-=0x40000000
					}
					if(i>0x20000000){
						i-=0x20000000
					}

					var _y = parseInt(i / set.across)
					var _x = i - (_y * set.across)

					buffer.drawImage(set.set.bitmap, _x * set.tileWidth, _y * set.tileHeight, set.tileWidth, set.tileHeight, x * set.tileWidth, y * set.tileHeight, set.tileWidth, set.tileHeight)
				}
			}
		}

		this.buffer.ctx.clearRect(0,0,this.cache.width,this.cache.height)
		this.buffer.ctx.drawImage(this.cache.bitmap,0,0)
		this.cache.ready = true
	},
	offsetMap: function(x, y) {
		this.offsetX += x

		if (this.offsetX < 0) {
			this.offsetX = 0
		}
		if (this.offsetX + this.maxWidth > this.data.width) {
			this.offsetX = this.data.width - this.maxWidth
		}
		this.cache.ctx.clearRect(0,0,this.cache.width,this.cache.height)

		for (var i in this.data.layers) {
			this.build(this.data.layers[i], this.tileset, this.offsetX, this.offsetY, this.maxWidth)
		}

	},
	_onLoad: function test(result) {
		if (!result) {
			console.log('The image isn\'t ready so we need to wait.')
			return
		}
		if (result == true) {
			// map  = new Studio.TileMap();
			console.log('The Image is ready, we can now create the tileset from the information provided, and then build the map from the data layer.')
			this.offsetMap(0,0)
		}
	},
	onMapLoad: function(data) {
		this.data = data
		this.set = data.tilesets[0]
		var setimage = new Studio.Image('assets/' + this.set.image)
		this.tileset =  new Studio.TileSet(setimage, this.set.tilewidth, this.set.tileheight, this.set.imagewidth)
		// change to addListenerFunction( function ) ... this explains what the variable needs to be.
		setimage.addListenerTo('ready','_onLoad', this)
	},
	load: function(asset, type) {
		Studio.load(asset, type, this.onMapLoad, this)
	}
}

Studio.TileSet = function(image, width, height, imagewidth) {
	this.firstgid = 1
	this.tileWidth = width || 32
	this.tileHeight = height || 32
	this.across = imagewidth / width | 0
	this.set = image || null
}

Studio.TileSet.prototype = {
	constructor: Studio.TileSet,
	onLoadComplete: function(data) {
		data.across = data.set.width / data.tileWidth
	}
}
