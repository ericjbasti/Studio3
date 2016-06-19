Studio.Cache = function(width, height, resolution) {
	var resolution = resolution || 1
	this.path = 'cache_'+parseInt(Math.random()*999999999)
	this.bitmap = document.createElement('canvas')
	this.bitmap.width = width * resolution || 512
	this.bitmap.height = height * resolution || 512
	this.width = width
	this.height = height
	this.ready = false
	this.ctx = this.bitmap.getContext('2d')
	this.ctx.scale(resolution, resolution)
	this.slice.Full = {x: 0,y: 0,width: this.bitmap.width,height: this.bitmap.height}
}

Studio.inherit(Studio.Cache, Studio.Image)
