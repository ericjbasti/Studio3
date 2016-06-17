Studio.Cache = function(width, height, resolution) {
	var resolution = resolution || 1
	this.path = 'cache_'+parseInt(Math.random()*999999999)
	this.image = document.createElement('canvas')
	this.image.width = width * resolution || 512
	this.image.height = height * resolution || 512
	this.width = width
	this.height = height
	this.ready = false
	this.ctx = this.image.getContext('2d')
	this.ctx.scale(resolution, resolution)
	this.slice.Full = {x: 0,y: 0,width: this.image.width,height: this.image.height}
}

Studio.inherit(Studio.Cache, Studio.Image)
