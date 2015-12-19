Studio.Effect = {}

Studio.Effect.BillAtkinsonDither_BW = new Studio.Plugin({
	options: {

	},
	init: function(a) {
		this.oldpixel = 1;
		this.newpixel = 1;
		this.qerror = 1;
	},
	action: function(a) {
		var pixels = a.ctx.getImageData(0,0,a.canvas.width,a.canvas.height);
		var pixeldata = pixels.data;
		var width = parseInt(a.canvas.width*4)
		var length = pixeldata.length;

		for (var i=0; i < length; i+=4) {
			this.oldpixel = pixeldata[i];

			this.newpixel = this.oldpixel >> 7;
			this.newpixel *= 255;

			pixeldata[i] = pixeldata[i+1] = pixeldata[i+2] = this.newpixel;

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
	},
	action: function(a) {
		var pixels = a.ctx.getImageData(0,0,a.canvas.width,a.canvas.height);
		var pixeldata = pixels.data;
		var width = a.canvas.width*4;
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

Studio.Effect.Bloom = new Studio.Plugin({
	options: {
	},
	init: function(a) {
		this.height = (a.canvas.height/2)*a.resolution;
		this.width = (a.canvas.width/2)*a.resolution;
		this.cache = new Studio.Cache(this.width,this.height);
		// this.cache.buffer.strokeStyle = '#fff';
		// this.cache.buffer.strokeRect( 10, 10, this.width-20, this.height-20);
		// this.cache.buffer.strokeRect( 15, 15, this.width-30, this.height-30);
		// this.cache.buffer.fillStyle = "rgba(200,0,0,.5)";
		// this.cache.buffer.fillRect( 25, this.height-25-this.height/4, this.width/4, this.height/4);
		this.cache.buffer.globalAlpha = .25
	},
	action: function(a) {
		this.cache.buffer.globalCompositeOperation = "source-over"
		this.cache.buffer.fillStyle="rgba(0,0,0,.35)";
		this.cache.buffer.fillRect( 0,0,this.width, this.height);
		this.cache.buffer.globalCompositeOperation = "lighten"
		this.cache.buffer.drawImage(a.canvas,0,0, this.width, this.height)
		a.ctx.globalCompositeOperation = 'lighten';
		a.ctx.drawImage(this.cache.image, 0, 0, a.canvas.width, a.canvas.height)
		a.ctx.globalCompositeOperation = 'source-over';
	}
})

Studio.Effect.Cursor = new Studio.Plugin({
	options: {
	},
	init: function(a) {
		this.cursor = new Studio.Image('assets/cursor.png');
		a.canvas.style.cursor = 'none';
	},
	action: function(a) {
		a.ctx.drawImage(this.cursor.image, a.mouse.x-8, a.mouse.y-8, 48, 48)
	}
})


Studio.Effect.Red = new Studio.Plugin({
	options: {
	},
	init: function(a) {
		
	},
	action: function(a) {
		var myGetImageData = a.ctx.getImageData(0,0,a.canvas.width, a.canvas.height);
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






var WAVE = new Studio.Plugin({
	action: function(a) {
		this.bufferCTX.drawImage(a.canvas, 0, 0);
		for (var j = 0; j != this.w.length; j++) {
			a.ctx.drawImage(this.buffer, j, 0, 1, a.height, j, this.w[j], 1, a.height);
			this.w[j] += (Math.cos(this.count * .08));
			this.count += .5;
		}
	},
	init: function(a) {
		this.w = [];
		for (var i = 0; i != a.width; i++) {
			this.w[i] = 0;
		}

		this.buffer = document.createElement('canvas');
		this.buffer.height = a.height;
		this.buffer.width = a.width;

		this.bufferCTX = this.buffer.getContext('2d');

		this.count = 0;
	}
})

var BLOOM = new Studio.Plugin({
	init: function(a) {
		this.buffer = document.createElement('canvas');
		this.buffer.height = a.height / 3 ;
		this.buffer.width = a.width / 3 ;

		this.bufferCTX = this.buffer.getContext('2d');
	},
	action: function(a) {
		this.bufferCTX.drawImage(a.canvas, 0, 0, this.buffer.width, this.buffer.height);
		a.ctx.globalAlpha = 1;
		a.ctx.globalCompositeOperation = "lighter";
		a.ctx.drawImage(this.buffer, 0, 0, a.width, a.height);
		a.ctx.globalCompositeOperation = "source-over";
	}
})
