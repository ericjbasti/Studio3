
Studio.TextBox=function(width,height,ctx){
	this.font = null;
	this.lineHeight = 10;
	this.image = document.createElement('canvas');
	this.height= 300;
	this.width= width
	this.shadow = true;
	this.image.height = height * ctx.resolution || 256;
	this.image.width =  width * ctx.resolution || 256;
	this._buffer = this.image.getContext('2d');
    this._buffer.imageSmoothingEnabled = false;
	this._buffer.scale(ctx.resolution,ctx.resolution);
	this._buffer.textBaseline = 'top';
	this._buffer.font=this.font;
	this.text = "";
	this.maxWidth = 300;
	this.color='#fff'
	this._wrap_height = this.lineHeight;
	this.centered = false;
};

Studio.TextBox.prototype = new Studio.Rect();
Studio.TextBox.prototype.constructor = Studio.TextBox;

Studio.TextBox.prototype.setFont= function(font){
	this.font=font;
	return this;
};

Studio.TextBox.prototype.setText= function(text){
	this.text=text;
	this.reset();
	this.wrapText()
	return this;
};

Studio.TextBox.prototype.reset = function(){
	this._buffer.clearRect(0,0,this.image.width,this.image.height);
	this._buffer.font=this.font;
}

Studio.TextBox.prototype.writeLine=function(text,x,y){
	this._buffer.fillStyle='rgba(0,0,0,.5)';
	this._buffer.fillText( text, x+1, y+(this.lineHeight/2)+2);
    this._buffer.fillStyle = this.color;
    this._buffer.fillText( text, x+1, y+this.lineHeight/2);
};

Studio.TextBox.prototype.wrapText = function() {
	var words = this.text.split(' ');
	var line = '';
	var x = 1;
	var y = 0;
	for(var n = 0; n < words.length; n++) {
		var testLine = line + words[n] + ' ';
		var metrics = this._buffer.measureText(testLine);
		var testWidth = metrics.width;
		if (testWidth > this.maxWidth && n > 0) {
			if(this.centered){
				this.writeLine(line, (this.maxWidth-testWidth)/2, y);
			}else{
				this.writeLine(line, x, y);
			}
			line = words[n] + ' ';
			y += this.lineHeight;
		}else {
			line = testLine;
		}
	}
	if(this.centered){
		this.writeLine(line, (this.maxWidth-testWidth)/2, y);
	}else{
		this.writeLine(line, x, y);
	}
	this._wrap_height = y + this.lineHeight;
}



Studio.TextBox.prototype.draw = function(ctx) {
	this.setAlpha(ctx);
	ctx.drawImage(this.image,0,0,this.image.width,this.image.height,this._x,this._y,this._width,this._height);
};


