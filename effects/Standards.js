



var WAVE = new Studio.Plugin({
	action : function(a){
		this.bufferCTX.drawImage(a.canvas,0,0);
		for(var j=0; j!= this.w.length; j++) {
			a.ctx.drawImage(this.buffer,j,0,1,a.height,j,this.w[j],1,a.height);
			this.w[j]+=(Math.cos(this.count*.08));
			this.count+=.5;
		}
	},
	init : function(a){
		this.w = [];
		for(var i = 0; i!= a.width; i++){
			this.w[i]=0;
		}

		this.buffer = document.createElement('canvas');
		this.buffer.height = a.height;
		this.buffer.width = a.width;

		this.bufferCTX = this.buffer.getContext('2d');

		this.count = 0;
	}
})




var BLOOM = new Studio.Plugin({
	init: function(a){
		this.buffer = document.createElement('canvas');
		this.buffer.height = a.height/3 ;
		this.buffer.width = a.width/3 ;

		this.bufferCTX = this.buffer.getContext('2d');
	},
	action: function(a){
		this.bufferCTX.drawImage(a.canvas, 0, 0, this.buffer.width, this.buffer.height);
		a.ctx.globalAlpha = 1;
		a.ctx.globalCompositeOperation="lighter";
		a.ctx.drawImage(this.buffer,0,0,a.width,a.height);
		a.ctx.globalCompositeOperation="source-over";
	}
})