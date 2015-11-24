Studio.TextBox = function(width, height, stage) {
	this.font = null;
	this.lineHeight = 10;
	this.image = document.createElement('canvas');
	this.height = height;
	this.width = width
	this.shadow = true;
	this.image.height = height * stage.resolution;
	this.image.width =  width * stage.resolution;
	this._buffer = this.image.getContext('2d');
	this._buffer.imageSmoothingEnabled = false;
	this._buffer.scale(stage.resolution, stage.resolution);
	this._buffer.textBaseline = 'top';
	this._buffer.font = this.font;
	this.text = "";
	this.color = '#fff'
	this._wrap_height = this.lineHeight;
	this.horizontal_align = Studio.LEFT;
	this.vertical_align = Studio.TOP;
	this._vertical_align = 0;
	return this;
};

Studio.extends(Studio.TextBox, Studio.Rect)

Studio.TextBox.prototype.setFont = function(font) {
	this.font = font;
	return this;
};

Studio.TextBox.prototype.setText = function(text) {
	this.text = text;
	return this;
};

Studio.TextBox.prototype.setColor = function(color) {
	this.color = color;
	return this;
}

Studio.TextBox.prototype.setFont = function(font) {
	this._buffer.font = this.font = font;
	return this;
}

Studio.TextBox.prototype.finish = function() {
	this.reset();
	this.wrapText()
}

Studio.TextBox.prototype.reset = function() {
	this._buffer.clearRect(0, 0, this.width, this.height);
	this._buffer.font = this.font;
}

Studio.TextBox.prototype.writeLine = function(text, x, y) {
	this._buffer.fillStyle = 'rgba(0,0,0,.5)';
	this._buffer.fillText(text, x + 1, y + 2);
	this._buffer.fillStyle = this.color;
	this._buffer.fillText(text, x + 1, y);
};

Studio.TextBox.prototype.wrapText = function() {
	var paragraphs = this.text.split('\n');
	var y = 1;
	for (var i = 0; i!= paragraphs.length; i++){
		var words = paragraphs[i].split(' ');
		console.log(words)
		var line = '';
		var x = 1;
		for (var n = 0; n < words.length; n++) {
			var testLine = line + words[n] + ' ';
			var metrics = this._buffer.measureText(testLine);
			var testWidth = metrics.width;
			if (testWidth > this.width && n > 0) {
				testWidth = this._buffer.measureText(line).width;
				this.writeLine(line, (this.width - testWidth) * this.horizontal_align, y);
				line = words[n] + ' ';
				y += this.lineHeight;
			} else {
				line = testLine;
			}
		}
		this.writeLine(line, (this.width - this._buffer.measureText(line).width) * this.horizontal_align, y);
		this._wrap_height = y + this.lineHeight;
		if(i!=paragraphs.length-1){
			y += this.lineHeight;
		}
	}
	
	this._vertical_align = (this._wrap_height * this.vertical_align - this.height * this.vertical_align) | 0;
}

Studio.TextBox.prototype.draw = function(ctx) {
	this.setAlpha(ctx);
	// since we don't resize the buffer, we need to compensate based on the differences of the buffer height and text height
	ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height, this._dx - (this._world.width * this.anchorX), this._dy - (this._world.height * this.anchorY) - this._vertical_align, this._world.width, this._world.height);
};

