Studio.Effect = {}

Studio.Effect.BillAtkinsonDither_BW = new Studio.Plugin({
	options: {

	},
	init: function(a) {
		this.oldpixel = 1;
		this.newpixel = 1;
		this.qerror = 1;
		this.active = true;
	},
	action: function(a) {
		var pixels = a.ctx.getImageData(0,0,a.bitmap.width,a.bitmap.height);
		var pixeldata = pixels.data;
		var width = parseInt(a.bitmap.width*4)
		var length = pixeldata.length;

		for (var i=0; i < length; i+=4) {
			this.oldpixel = pixeldata[i];

			this.newpixel = this.oldpixel >> 7;
			this.newpixel *= 255;

			pixeldata[i] = pixeldata[i+1] = pixeldata[i+2] = this.newpixel;
			if(pixeldata[i+3]>20){
				pixeldata[i+3] = 255;
			}else{
				pixeldata[i+3] = 0
			}

			this.qerror = (this.oldpixel - this.newpixel) * .15;

			if((i % width === 0) && (i+4 % width === 0) && (i+8 % width === 0)){

			}else{
				pixeldata[i+5] = pixeldata[i+6] = pixeldata[i+4]+= this.qerror;
				pixeldata[i+9] = pixeldata[i+10] = pixeldata[i+8]+= this.qerror;
				pixeldata[i+5+width] = pixeldata[i+6+width] = pixeldata[i+4+width] += this.qerror;
				pixeldata[i+1+width] = pixeldata[i+2+width] = pixeldata[i+width] += this.qerror;
				pixeldata[i+width-3] = pixeldata[i+width-2] = pixeldata[i+width-4] += this.qerror;
				pixeldata[i+width*2] = pixeldata[i+(width*2)] = pixeldata[i+(width*2)] += this.qerror;
			}
		}
		a.ctx.putImageData(pixels,0,0);
	}
})

Studio.Effect.Posterize = new Studio.Plugin({
	options: {

	},
	init: function(a) { // lets build out a canvas for the stats
		// this.cache = new Studio.Cache(a.width,a.height,a.resolution);
		this.oldpixel = 1;
		this.newpixel = 1;
		this.qerror = 1;
		this.active = true
	},
	action: function(a) {
		var pixels = a.ctx.getImageData(0,0,a.bitmap.width,a.bitmap.height);
		var pixeldata = pixels.data;
		var width = a.bitmap.width*4;
		var length = pixeldata.length;

		for (var i=0; i < length; i++) {
			this.oldpixel = pixeldata[i];

			this.newpixel = this.oldpixel >> 7;
			this.newpixel *= 255;

			pixeldata[i] = this.newpixel;
		}
		a.ctx.putImageData(pixels,0,0);
	}
})


Studio.Effect.Replicator = new Studio.Plugin({
	options: {
		x: 3,
		y: 3,
	},
	init: function(a) {
		this.cache = new Studio.Cache();
	},
	action: function(a) {
		var width = a.canvas.width/this.options.x;
		var height = a.canvas.height/this.options.y;
		this.cache.image.width = width;
		this.cache.image.height = height;
		this.cache.buffer.drawImage(a.canvas,0,0, width, height);
		for(var i = 0; i!= this.options.x; i++){
			for(var j = 0; j!= this.options.y; j++){
				a.ctx.drawImage(this.cache.image, i * width , j * height, width ,height)
			}
		}
	}
})


Studio.Effect.Blur = new Studio.Plugin({
	options: {
		x: 3,
		y: 3,
	},
	init: function(a) {
		this.cache = new Studio.Cache();
		this.active = true
	},
	action: function(a) {
		var width = a.bitmap.width/2;
		var height = a.bitmap.height/2;
		console.log(this.cache)
		this.cache.bitmap.width = width;
		this.cache.bitmap.height = height;
		this.cache.ctx.drawImage(a.bitmap,0,0, width, height);
		a.ctx.drawImage(this.cache.bitmap, 0 , 0, a.width ,a.height)
	}
})

Studio.Effect.Cursor = new Studio.Plugin({
	options: {
	},
	init: function(a) {
		this.cursor = new Studio.Image('assets/cursor.png');
		a.bitmap.style.cursor = 'none';
	},
	action: function(a) {
		a.ctx.drawImage(this.cursor.image, a.mouse.x-8, a.mouse.y-8, 48, 48)
	}
})


Studio.Effect.Red = new Studio.Plugin({
	options: {
	},
	init: function(a) {
		this.active = true
	},
	action: function(a) {
		var myGetImageData = a.ctx.getImageData(0,0,a.bitmap.width, a.bitmap.height);
		var buffer = myGetImageData.data.buffer;
		var sourceBuffer8 = new Uint8Array(buffer);
		var sourceBuffer32 = new Uint32Array(buffer);
		var length = sourceBuffer32.length;
		for (var i = 0 ; i!=length; i++){
			var temp = myGetImageData.data[i*4+1];
			sourceBuffer32[i]= (255 << 24) |
                (255-temp << 16) | 
                (temp <<  8) |
                 255-temp
		}
		myGetImageData.data.set(sourceBuffer8);
		a.ctx.putImageData(myGetImageData, 0, 0);
	}
})
