/**
 * Image
 */

Studio.Image = function studio_image(path, slices) {
	this.path = path
	this.image = null
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

	this.status = new Studio.Messenger()
	if (slices) {
		this.addSlice(slices)
	}

	if (path) {
		this.loadImage(path)
	}
	return this
}

Studio.Image.prototype.constructor = Studio.Image

Studio.Image.prototype.ready = false
Studio.Image.prototype.height = 1
Studio.Image.prototype.width = 1

Studio.Image.prototype.loadImage = function studio_image_loadImage(who) {
	if (Studio.assets[who]) {
		console.warn('Already loaded : ', who, Studio.assets[who])
		this.image = Studio.assets[who]
		this.ready = true
		this.status.setStatus(this.ready)
		return this
	} else {
		Studio.assets[who] = new Image()
		Studio._addingAsset();
		var image = this
		Studio.assets[who].onload = function image_onload() { // could have Event passed in
			Studio.progress = Studio.queue / Studio.assets.length
			image.slice['Full'].height = this.height
			image.slice['Full'].width = this.width
			image.width = this.width
			image.height = this.height
			Studio._loadedAsset();
			image.addSlice(image.slice)
			image.ready = true
			image.status.setStatus(image.ready)
			return image
		}
		Studio.assets[who].src = who
		this.image = Studio.assets[who]
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
