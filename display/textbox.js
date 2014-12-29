Studio.TextBox=function(width,height,ctx){
	this.font = null;
	this.fontSize = 16;
	this._fontScale = 1;
	this.kerning = 1.0;
	this.lineHeight = 1.5;
	this.image = document.createElement('canvas');
	this.height= height;
	this.width= width
	this.image.height = height * ctx.resolution || 256;
	this.image.width =  width * ctx.resolution || 256;
	this._buffer = this.image.getContext('2d');
	this._buffer.scale(ctx.resolution,ctx.resolution);
	this.ready = false;
	this.text = "";
};

Studio.TextBox.prototype = new Studio.Rect();
Studio.TextBox.prototype.constructor = Studio.TextBox;

Studio.TextBox.prototype.setFont= function(font){
	this.font=font;
	this.updateBitmap();
	return this;
};

Studio.TextBox.prototype.setText= function(text){
	this.text=text;
	this.updateBitmap();
	return this;
};

Studio.TextBox.prototype.updateBitmap=function(){
	this.ready=false;
	if (this.font.ready) {
		this._fontScale = 1 / this.font.resolution;
		this._buffer.clearRect(0,0,this.width,this.height);
		Studio._lineSpacing=(this.lineHeight*this.fontSize);
		Studio._kerning= (this.kerning*this.font.clipWidth)*this._fontScale;
		Studio._lines = this.text.split('\n');
		for (var l=0; l!==Studio._lines.length;l++){
			Studio._text=Studio._lines[l];
			for (var i=0;i!==Studio._text.length;i++){
				Studio._c=this.font.charSet[Studio._text[i]];
				Studio._sheetY=Studio._c+(Studio._c<0?-1:0) | 0;
				Studio._sheetX=((Studio._c-Studio._sheetY)*this.font.sheetWidth);

				this._buffer.drawImage(this.font.image,
					Studio._sheetX*this.font.clipWidth,
					Studio._sheetY*this.font.clipHeight,
					this.font.clipWidth,
					this.font.clipHeight,
					i*Studio._kerning,
					l*Studio._lineSpacing,
					this.font.clipWidth*this._fontScale,
					this.fontSize);
			}
		}
		this.ready=true;
	}
};

Studio.TextBox.prototype.draw = function(ctx) {
	if (this.image && this.ready) {
		this.setAlpha(ctx);
		ctx.drawImage(this.image,0,0,this.image.width,this.image.height,this._x,this._y,this._width,this._height);
	}else{
		this.updateBitmap();
	}
};




