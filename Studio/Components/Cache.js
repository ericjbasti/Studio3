Studio.Cache = function(width, height, resolution) {
	this.resolution = resolution || 1
	this.path = 'cache_' + parseInt(Math.random()*100000).toString(16)
	this.bitmap = document.createElement('canvas')
	this.bitmap.width = width * this.resolution || 512
	this.bitmap.height = height * this.resolution || 512
	this.width = width
	this.height = height
	this.ready = false
	this.ctx = this.bitmap.getContext('2d')
	this.ctx.scale(resolution, resolution)
	this.slice.Full = {x: 0,y: 0,width: this.bitmap.width,height: this.bitmap.height}
	this.sliceGL.Full = {x:0,y:0,width:1, height: 1}

	if(Studio.DEBUG){
		document.body.appendChild(this.bitmap)
	}
}

Studio.inherit(Studio.Cache, Studio.Image)


Studio.Cache.prototype.applyEffect = function(effect){
	effect.action(this)
}