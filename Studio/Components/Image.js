Studio.Image = function studio_image(path, slices) {
	this.path = path + '_'+ parseInt(Math.random()*100000).toString(16)
	this.bitmap = null
	this.width = 1
	this.height = 1

	this.slice = {
		'Full': {
			x: 0,
			y: 0,
			width: 1,
			height: 1
		}
	}

	this.sliceGL = {}

	// this.status = new Studio.Messenger()
	if (slices) {
		this.addSlice(slices)
	}

	if (path) {
		this.loadImage(path)
	}
	return this
}

Studio.inherit(Studio.Image,Studio.Messenger)

Studio.Image.prototype.ready = false
Studio.Image.prototype.height = 1
Studio.Image.prototype.width = 1

Studio.Image.prototype._onImageLoad = function image_onload(image) { // could have Event passed in
	Studio.progress = Studio.queue / Studio.assets.length
	Studio._loadedAsset();
	this._setWidthHeights(image)
	return image
}
Studio.Image.prototype._setWidthHeights = function(image){
	this.slice['Full'].height = image.height
	this.slice['Full'].width = image.width
	this.width = image.width
	this.height = image.height
	this.addSlice(this.slice)
	this.ready = true
	this.sendMessage('ready',this.ready)
}

Studio.Image.prototype.loadImage = function studio_image_loadImage(who) {
	var image = this;
	if (Studio.assets[who]) {
		console.warn('Already loaded : ', who, Studio.assets[who])
		this.bitmap = Studio.assets[who]
		if(Studio.assets.width){
			this.ready = true
			this.sendMessage('ready',this.ready)
		}else{
			Studio.assets[who].addEventListener("load", function(e){
				image._setWidthHeights(e.target)
			} )
		}
		return this
	} else {
		Studio.assets[who] = new Image()
		Studio._addingAsset();
		Studio.assets[who].addEventListener("load", function(e){
			image._onImageLoad(e.target)
		} )
		
		Studio.assets[who].src = who
		this.bitmap = Studio.assets[who]
	}
}
Studio.Image.prototype.buildSliceForGL = function studio_buildSliceForGL(slice) {
	var x = slice.x / this.width
	var y = slice.y / this.height
	return {
		x: x,
		y: y,
		width: slice.width / this.width + x,
		height: slice.height / this.height + y
	}
}

Studio.Image.prototype.addSlice = function studio_image_addSlice(slices) {
	for (var i in slices) {
		this.slice[i] = slices[i]
		this.sliceGL[i] = this.buildSliceForGL(slices[i])
	}
}

Studio.Image.prototype._rebuildGLSlices = function(){
	for (var i in this.slice) {
		this.sliceGL[i] = this.buildSliceForGL(this.slice[i])
	}
}
