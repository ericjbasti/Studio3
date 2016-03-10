/**
 * Image
 */

Studio.Image = function studio_image(path) {

	this.image = null
	this.width = 1
	this.height = 1

	this.slice = {
		'Full': {
			x:0,
			y:0,
			width: 1,
			height: 1
		}
	}

	this.sliceGL = {}

	this.status = new Studio.Messanger()

	if (path) {
		this.loadImage(path)
	}
	return this;
};

Studio.Image.prototype.constructor = Studio.Image;

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
		Studio.assets.length++
		var image = this
		Studio.assets[who].onload = function image_onload() { // could have Event passed in
			Studio.queue++
			Studio.progress = Studio.queue / Studio.assets.length
			image.ready = true
			image.status.setStatus(image.ready)
			image.slice['Full'].height = this.height
			image.slice['Full'].width = this.width
			image.width = this.width
			image.height = this.height
			if (Studio.queue === Studio.assets.length) {
				Studio.loaded = true
			}
			image.addSlice(image.slice)
			return image
		};
		Studio.assets[who].src = who
		this.image = Studio.assets[who]
	}
}
Studio.Image.prototype.buildSliceForGL = function studio_buildSliceForGL(slice){
	return {
		x: slice.x/this.width,
		y: slice.y/this.height,
		width: slice.width/this.width,
		height: slice.height/this.height
	}
}

Studio.Image.prototype.addSlice = function studio_image_addSlice(slices){
	for(var i in slices){
		this.slice[i] = slices[i]
		this.sliceGL[i] = this.buildSliceForGL(slices[i])
	}
}