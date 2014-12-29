Studio.Font = function(path,height,width,resolution,sheetWidth,characterSet){
	this.clipHeight = height*resolution || 1;
	this.clipWidth = width*resolution || 1;
	this.resolution = resolution || 1;
	this.charSet = {};
	this.sheetWidth = sheetWidth || 26;
	this.loadImage(path);
	this._c = characterSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.:;, ';
	this.createSet(this._c);
};

Studio.Font.prototype = new Studio.Image();
Studio.Font.prototype.constructor = Studio.Font;

Studio.Font.prototype.createSet = function(chars){
	Studio._font_chars_length = chars.length;
	for(var i = 0; i!== Studio._font_chars_length; i++){
		this.charSet[chars[i]] = i/this.sheetWidth;
	}
};